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
  onTap,
}: {
  cardRef: React.RefObject<HTMLDivElement | null>;
  fullName: string;
  title: string;
  email: string;
  onTap?: () => void;
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
      onClick={onTap}
      onTouchStart={onTap}
      className="w-95 md:w-142.5 max-w-[90vw] aspect-1.75/1 glass-card-landing p-6 md:p-12 flex justify-between cursor-default select-none"
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
        className="flex flex-col items-center justify-center shrink-0 w-[25%] translate-y-[1em]"
        style={{ transform: "translateZ(25px)" }}
      >
        {qrSrc && (
          <img src={qrSrc} alt="QR Code" className="w-full aspect-square" />
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
  prefillToken,
}: {
  fullName: string;
  title: string;
  email: string;
  infoText?: string;
  prefillToken?: string;
}) {
  const [token, setToken] = useState(prefillToken ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const gyroGrantedRef = useRef(false);
  const gyroListeningRef = useRef(false);
  const gyroOriginRef = useRef<{ beta: number; gamma: number } | null>(null);

  // Remove prefill token from URL without reloading
  useEffect(() => {
    if (prefillToken) {
      const url = new URL(window.location.href);
      url.searchParams.delete("prefill");
      window.history.replaceState({}, "", url.pathname + url.search);
    }
  }, [prefillToken]);

  const applyCardTransform = useCallback((rotateX: number, rotateY: number) => {
    const card = cardRef.current;
    if (!card) return;
    const clampedX = Math.max(-25, Math.min(25, rotateX));
    const clampedY = Math.max(-25, Math.min(25, rotateY));
    card.style.transform = `perspective(800px) rotateX(${clampedX}deg) rotateY(${clampedY}deg)`;
    card.style.boxShadow = `${-clampedY * 2}px ${clampedX * 2}px 60px rgba(255,255,255,0.07), 0 0 30px rgba(182,160,255,0.12)`;
  }, []);

  // Start listening for gyroscope events (called after permission is granted or on Android)
  const startGyroscope = useCallback(() => {
    if (gyroListeningRef.current) return;
    gyroListeningRef.current = true;

    function handleOrientation(e: DeviceOrientationEvent) {
      if (e.beta === null || e.gamma === null) return;
      // Capture first reading as origin
      if (!gyroOriginRef.current) {
        gyroOriginRef.current = { beta: e.beta, gamma: e.gamma };
      }
      const rotateX = (e.beta - gyroOriginRef.current.beta) * 0.5;
      const rotateY = (e.gamma - gyroOriginRef.current.gamma) * 0.5;
      applyCardTransform(rotateX, rotateY);
    }

    window.addEventListener("deviceorientation", handleOrientation);
  }, [applyCardTransform]);

  // Request iOS permission on card tap, reset gyro origin, or directly start on Android
  const handleCardTap = useCallback(async () => {
    // Reset gyroscope origin on every tap and snap card to neutral
    gyroOriginRef.current = null;
    applyCardTransform(0, 0);

    if (gyroGrantedRef.current) return;
    // Prevent re-entrant calls while permission dialog is open
    gyroGrantedRef.current = true;

    const DOE = DeviceOrientationEvent as any;
    if (typeof DOE.requestPermission === "function") {
      try {
        const permission = await DOE.requestPermission();
        if (permission === "granted") {
          startGyroscope();
          return;
        }
      } catch {
        // User denied or error – silently ignore
      }
      gyroGrantedRef.current = false;
    }
  }, [startGyroscope, applyCardTransform]);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    // Desktop: mouse-driven tilt
    function handleMouseMove(e: globalThis.MouseEvent) {
      if (gyroListeningRef.current) return;
      const rect = card!.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const maxDistance = Math.max(window.innerWidth, window.innerHeight);
      const rotateY = ((e.clientX - centerX) / maxDistance) * 25;
      const rotateX = ((centerY - e.clientY) / maxDistance) * 25;
      applyCardTransform(rotateX, rotateY);
    }

    window.addEventListener("mousemove", handleMouseMove);

    // Mobile: auto-start gyroscope on Android (no permission needed)
    // Only activate on touch devices to avoid blocking mouse on desktop
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const DOE = DeviceOrientationEvent as any;
    if (isTouchDevice && "DeviceOrientationEvent" in window && typeof DOE.requestPermission !== "function") {
      gyroGrantedRef.current = true;
      startGyroscope();
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [applyCardTransform, startGyroscope]);

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

        router.replace("/");
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
        <BusinessCard cardRef={cardRef} fullName={fullName} title={title} email={email} onTap={handleCardTap} />

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
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowInfo(false)}>
                <div className="absolute inset-0 bg-black/60" />
                <div
                  className="relative z-10 w-80 md:w-96 p-5 md:p-6 rounded-xl glass-card text-sm md:text-base text-on-surface-variant leading-relaxed shadow-2xl whitespace-pre-line"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => setShowInfo(false)}
                    className="absolute top-3 right-3 text-on-surface-variant/60 hover:text-on-surface transition"
                    aria-label="Close"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  {infoText || "Enter the access code you received."}
                </div>
              </div>
            )}
          </div>
          <input
            id="token"
            type="text"
            autoComplete="current-password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Code eingeben"
            className="w-full pl-4 md:pl-6 pr-10 md:pr-14 py-3 md:py-5 bg-surface-container border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary/50 outline-none transition text-on-surface placeholder-on-surface-variant/50 text-sm md:text-base"
            disabled={loading}
            autoFocus
          />

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
