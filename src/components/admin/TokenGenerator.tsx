"use client";

import { useState } from "react";
import QRCodeDisplay from "./QRCodeDisplay";

export default function TokenGenerator() {
  const [name, setName] = useState("");
  const [role, setRole] = useState<"viewer" | "admin">("viewer");
  const [expiresIn, setExpiresIn] = useState("12w");
  const [format, setFormat] = useState<"jwt" | "compact" | "mini">("compact");
  const [generatedToken, setGeneratedToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isMini = format === "mini";

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setGeneratedToken("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: isMini ? "mini" : name.trim(),
          role: isMini ? "viewer" : role,
          expiresIn,
          format,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to generate token");
        return;
      }

      const data = await res.json();
      setGeneratedToken(data.token);
    } catch {
      setError("Failed to generate token");
    } finally {
      setLoading(false);
    }
  }

  const tokenUrl = generatedToken
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/?token=${generatedToken}`
    : "";

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleGenerate}
        className="bg-white rounded-xl shadow p-6 space-y-4"
      >
        <h2 className="text-lg font-semibold text-gray-900">Generate New Token</h2>

        {!isMini && (
          <div>
            <label htmlFor="token-name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              id="token-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Company XYZ, John Doe"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
              required
            />
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          {!isMini && (
            <div>
              <label htmlFor="token-role" className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                id="token-role"
                value={role}
                onChange={(e) => setRole(e.target.value as "viewer" | "admin")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
              >
                <option value="viewer">Viewer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}

          <div>
            <label htmlFor="token-expiry" className="block text-sm font-medium text-gray-700 mb-1">
              Expires In
            </label>
            <select
              id="token-expiry"
              value={expiresIn}
              onChange={(e) => setExpiresIn(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
            >
              <option value="1h">1 Hour</option>
              <option value="24h">24 Hours</option>
              <option value="7d">1 Week</option>
              <option value="4w">4 Weeks</option>
              <option value="12w">12 Weeks (default)</option>
              <option value="26w">26 Weeks</option>
              <option value="52w">1 Year</option>
            </select>
          </div>

          <div>
            <label htmlFor="token-format" className="block text-sm font-medium text-gray-700 mb-1">
              Format
            </label>
            <select
              id="token-format"
              value={format}
              onChange={(e) => setFormat(e.target.value as "jwt" | "compact" | "mini")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
            >
              <option value="mini">Mini (8 chars, viewer only)</option>
              <option value="compact">Compact (short, better QR)</option>
              <option value="jwt">JWT (standard, longer)</option>
            </select>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || (!isMini && !name.trim())}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? "Generating..." : "Generate Token"}
        </button>
      </form>

      {generatedToken && (
        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Generated Token</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Token
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={generatedToken}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 text-sm font-mono"
              />
              <button
                onClick={() => navigator.clipboard.writeText(generatedToken)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition text-sm"
              >
                Copy
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={tokenUrl}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 text-sm font-mono"
              />
              <button
                onClick={() => navigator.clipboard.writeText(tokenUrl)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition text-sm"
              >
                Copy
              </button>
            </div>
          </div>

          <QRCodeDisplay url={tokenUrl} />
        </div>
      )}
    </div>
  );
}
