"use client";

import { useState, useEffect } from "react";

export default function PDFUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [hasPdf, setHasPdf] = useState(false);
  const [pdfKey, setPdfKey] = useState(0);

  useEffect(() => {
    fetch("/api/pdf", { method: "HEAD" }).then((res) => {
      setHasPdf(res.ok);
    }).catch(() => {});
  }, []);

  async function handleDelete() {
    try {
      const res = await fetch("/api/pdf", { method: "DELETE" });
      if (res.ok) {
        setHasPdf(false);
        setMessage("");
      }
    } catch {}
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const res = await fetch("/api/pdf/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setMessage("PDF uploaded successfully!");
        setHasPdf(true);
        setFile(null);
        setPdfKey((k) => k + 1);
      } else {
        const data = await res.json();
        setMessage(data.error || "Upload failed.");
      }
    } catch {
      setMessage("Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="bg-white rounded-xl shadow p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">PDF Resume</h2>

      <div className="flex gap-4">
        {/* Preview thumbnail */}
        {hasPdf && (
          <div className="shrink-0 w-28 relative">
            <iframe
              key={pdfKey}
              src={`/api/pdf/preview?v=${pdfKey}`}
              className="w-28 h-36 rounded-lg border border-gray-200 pointer-events-none"
              title="PDF Preview"
            />
            <button
              type="button"
              onClick={handleDelete}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 transition shadow"
              title="Delete PDF"
            >
              ✕
            </button>
          </div>
        )}

        {/* Upload form */}
        <div className="flex-1 space-y-3">
          <form onSubmit={handleUpload} className="space-y-3">
            <div>
              <label htmlFor="pdf-file" className="block text-sm font-medium text-gray-700 mb-1">
                Upload new PDF
              </label>
              <input
                id="pdf-file"
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-gray-700 file:mr-4 file:px-4 file:py-2 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {message && (
              <p
                className={`text-sm ${
                  message.includes("success") ? "text-green-600" : "text-red-600"
                }`}
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={uploading || !file}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {uploading ? "Uploading..." : "Upload PDF"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
