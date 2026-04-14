"use client";

import { useState } from "react";

interface DecodedPayload {
  name: string | null;
  role: string;
  jti: string | null;
  issuedAt: string | null;
  expiresAt: string;
}

export default function TokenVerifier() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    valid: boolean;
    payload?: DecodedPayload;
    error?: string;
  } | null>(null);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!token.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/auth/decode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim() }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ valid: false, error: "Request failed" });
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full px-4 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-on-surface bg-surface-container-low text-sm font-mono";

  return (
    <div className="bg-surface-container rounded-xl p-6 space-y-4">
      <h2 className="text-lg font-semibold text-on-surface">Verify &amp; Decode Token</h2>

      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label htmlFor="verify-token" className="block text-sm font-medium text-on-surface-variant mb-1">
            Token
          </label>
          <input
            id="verify-token"
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste a token here..."
            className={inputClass}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || !token.trim()}
          className="px-6 py-2 bg-primary text-on-primary rounded-lg font-medium hover:bg-primary-dim disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>
      </form>

      {result && (
        <div
          className={`rounded-lg p-4 text-sm ${
            result.valid
              ? "bg-tertiary/10 border border-tertiary/30"
              : "bg-error/10 border border-error/30"
          }`}
        >
          {result.valid && result.payload ? (
            <div className="space-y-2">
              <p className="font-semibold text-tertiary">Valid Token</p>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-on-surface-variant">
                {result.payload.name && (
                  <>
                    <dt className="font-medium">Name</dt>
                    <dd>{result.payload.name}</dd>
                  </>
                )}
                <dt className="font-medium">Role</dt>
                <dd>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      result.payload.role === "admin"
                        ? "bg-primary/15 text-primary"
                        : "bg-secondary/15 text-secondary"
                    }`}
                  >
                    {result.payload.role}
                  </span>
                </dd>
                {result.payload.jti && (
                  <>
                    <dt className="font-medium">Token ID</dt>
                    <dd className="font-mono text-xs">{result.payload.jti}</dd>
                  </>
                )}
                {result.payload.issuedAt && (
                  <>
                    <dt className="font-medium">Issued At</dt>
                    <dd>{new Date(result.payload.issuedAt).toLocaleString()}</dd>
                  </>
                )}
                <dt className="font-medium">Expires At</dt>
                <dd>{new Date(result.payload.expiresAt).toLocaleString()}</dd>
              </dl>
            </div>
          ) : (
            <p className="font-semibold text-error">
              {result.error || "Invalid or expired token"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
