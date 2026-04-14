"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";

const FAKE_MINI_TOKEN = "xK7m$q2b";

function BusinessCard({
  cardRef,
  fullName,
  title,
  email,
}: {
  cardRef: React.RefObject<HTMLDivElement | null>;
  fullName: string;
  title: string;
  email: string;
}) {
  const [qrSrc, setQrSrc] = useState<string>("");

  useEffect(() => {
    QRCode.toDataURL(window.location.origin, {
      width: 256,
      margin: 0,
      color: { dark: "#f1f3fc", light: "#00000000" },
    }).then(setQrSrc);
  }, []);

  return (
    <div
      ref={cardRef}
      className="w-95 md:w-142.5 max-w-[90vw] aspect-1.75/1 glass-card p-6 md:p-12 flex justify-between cursor-default select-none"
      style={{
        transformStyle: "preserve-3d",
        transition: "transform 0.15s ease-out, box-shadow 0.15s ease-out",
        willChange: "transform",
        backfaceVisibility: "hidden",
      }}
    >
      <div className="flex flex-col justify-between">
        <div style={{ transform: "translateZ(30px)" }}>
          <h2 className="font-headline text-2xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            {fullName}
          </h2>
          <p className="text-secondary text-sm md:text-lg font-bold font-headline mt-0.5 md:mt-1">
            {title}
          </p>
        </div>

        <div
          className="text-on-surface-variant text-xs md:text-sm"
          style={{ transform: "translateZ(20px)" }}
        >
          <span>{email}</span>
        </div>
      </div>

      <div
        className="flex flex-col items-center justify-center shrink-0 self-stretch translate-y-[1em]"
        style={{ transform: "translateZ(25px)" }}
      >
        {qrSrc && (
          <img src={qrSrc} alt="QR Code" className="h-[65%] aspect-square" />
        )}
        <span className="text-on-surface-variant/70 text-[10px] md:text-[13px] font-mono tracking-wide mt-1 md:mt-2.5">
          {FAKE_MINI_TOKEN}
        </span>
      </div>
    </div>
  );
}

export default function LandingPage({
  fullName,
  title,
  email,
  infoText,
}: {
  fullName: string;
  title: string;
  email: string;
  infoText?: string;
}) {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleMouseMove(e: globalThis.MouseEvent) {
      const card = cardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const maxDistance = Math.max(window.innerWidth, window.innerHeight);
      const rotateY = ((e.clientX - centerX) / maxDistance) * 25;
      const rotateX = ((centerY - e.clientY) / maxDistance) * 25;
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      card.style.boxShadow = `${-rotateY * 1.5}px ${rotateX * 1.5}px 40px rgba(0,0,0,0.45)`;
    }

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);

      try {
        const res = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: token.trim() }),
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Invalid token");
          return;
        }

        router.refresh();
      } catch {
        setError("Failed to verify token");
      } finally {
        setLoading(false);
      }
    },
    [token, router],
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center section-gradient-1 px-4">
      <div className="relative mb-0">
        <BusinessCard cardRef={cardRef} fullName={fullName} title={title} email={email} />

        {/* Sketch-style animated arrow from example token to input */}
        <svg
          width="80"
          height="64"
          viewBox="0 0 80 64"
          fill="none"
          className="absolute -bottom-7 md:-bottom-10 right-0 pointer-events-none md:w-30 md:h-24"
          style={{ overflow: "visible" }}
        >
          <path
            d="M20 0 C38 8, 58 18, 54 32 C50 44, 44 46, 36 56"
            stroke="var(--color-on-surface-variant)"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            strokeDasharray="90"
            strokeDashoffset="90"
          >
            <animate
              attributeName="stroke-dashoffset"
              values="90;0;0;90"
              keyTimes="0;0.4;0.7;1"
              dur="3.5s"
              repeatCount="indefinite"
            />
          </path>
          {/* Arrowhead left */}
          <path
            d="M47 52 L36 56"
            stroke="var(--color-on-surface-variant)"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            strokeDasharray="14"
            strokeDashoffset="14"
          >
            <animate
              attributeName="stroke-dashoffset"
              values="14;14;0;0;14"
              keyTimes="0;0.25;0.4;0.7;1"
              dur="3.5s"
              repeatCount="indefinite"
            />
          </path>
          {/* Arrowhead right */}
          <path
            d="M38 44 L36 56"
            stroke="var(--color-on-surface-variant)"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            strokeDasharray="14"
            strokeDashoffset="14"
          >
            <animate
              attributeName="stroke-dashoffset"
              values="14;14;0;0;14"
              keyTimes="0;0.25;0.4;0.7;1"
              dur="3.5s"
              repeatCount="indefinite"
            />
          </path>
        </svg>
      </div>

      <div className="h-6 md:h-9" />

      <form onSubmit={handleSubmit} className="relative w-75 md:w-112.5 max-w-[90vw] space-y-3 md:space-y-4">
        <div className="relative flex items-center">
          <div className="absolute -left-7 md:-left-12 shrink-0">
            <button
              type="button"
              onClick={() => setShowInfo((v) => !v)}
              className="text-on-surface-variant/50 hover:text-on-surface-variant transition"
              aria-label="Info"
            >
              <svg className="w-4 h-4 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
            </button>

            {showInfo && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowInfo(false)} />
                <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 md:mr-6 z-50 w-52 md:w-84 p-3 md:p-5 rounded-lg glass-card text-xs md:text-sm text-on-surface-variant leading-relaxed shadow-xl whitespace-pre-line">
                  {infoText || "Enter the access code you received."}
                  <div className="absolute left-full top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-l-[6px] border-l-outline-variant/15" />
                </div>
              </>
            )}
          </div>
          <input
            id="token"
            type={showPassword ? "text" : "password"}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Code eingeben"
            className="w-full pl-4 md:pl-6 pr-18 md:pr-28 py-3 md:py-5 bg-surface-container border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary/50 outline-none transition text-on-surface placeholder-on-surface-variant/50 text-sm md:text-base"
            disabled={loading}
            autoFocus
          />

          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-9 md:right-14 text-on-surface-variant/60 hover:text-on-surface transition"
            tabIndex={-1}
            aria-label={showPassword ? "Hide token" : "Show token"}
          >
            <svg
              className="w-4 h-4 md:w-6 md:h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              {showPassword ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                />
              ) : (
                <>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </>
              )}
            </svg>
          </button>

          <button
            type="submit"
            disabled={loading || !token.trim()}
            className="absolute right-2 md:right-3 text-on-surface-variant/60 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition"
            aria-label="Submit"
          >
            {loading ? (
              <svg
                className="w-5 h-5 md:w-7 md:h-7 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 md:w-7 md:h-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            )}
          </button>
        </div>

        {error && (
          <p className="text-sm md:text-base text-error bg-error-container/20 px-3 md:px-5 py-2 md:py-3 rounded-lg">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
