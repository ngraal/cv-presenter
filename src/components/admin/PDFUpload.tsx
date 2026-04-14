"use client";

import { useState, useEffect, useCallback } from "react";

export default function PDFUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [pdfFiles, setPdfFiles] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [previewKey, setPreviewKey] = useState(0);

  const loadFiles = useCallback(() => {
    fetch("/api/pdf")
      .then((res) => res.json())
      .then((files: string[]) => {
        setPdfFiles(files);
        if (files.length > 0 && (!selected || !files.includes(selected))) {
          setSelected(files[0]);
        }
        if (files.length === 0) setSelected(null);
      })
      .catch(() => {});
  }, [selected]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  async function handleDelete(name: string) {
    try {
      const res = await fetch(`/api/pdf?file=${encodeURIComponent(name)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMessage("");
        loadFiles();
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
        const data = await res.json();
        setMessage("PDF uploaded successfully!");
        setFile(null);
        setPreviewKey((k) => k + 1);
        loadFiles();
        if (data.name) setSelected(data.name);
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
    <section className="bg-surface-container rounded-xl p-6 space-y-4">
      <h2 className="text-lg font-semibold text-on-surface">PDF Documents</h2>

      <div className="flex gap-4 min-h-0">
        {/* Preview — A4 aspect ratio */}
        {selected && (
          <div className="shrink-0 w-64 self-stretch">
            <iframe
              key={`${selected}-${previewKey}`}
              src={`/api/pdf/preview?file=${encodeURIComponent(selected)}&v=${previewKey}`}
              className="w-full h-full min-h-[22rem] rounded-lg border border-outline-variant"
              title="PDF Preview"
            />
          </div>
        )}

        <div className="flex-1 space-y-3 min-h-0">
          {/* File list — scrollable after 5 items */}
          {pdfFiles.length > 0 && (
            <ul className="space-y-1 max-h-52 overflow-y-auto">
              {pdfFiles.map((name) => (
                <li
                  key={name}
                  className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer transition ${
                    selected === name
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                  onClick={() => setSelected(name)}
                >
                  <span className="truncate">{name}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(name);
                    }}
                    className="shrink-0 w-5 h-5 text-error/60 hover:text-error transition text-xs"
                    title={`Delete ${name}`}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Upload form */}
          <form onSubmit={handleUpload} className="space-y-3">
            <div>
              <label
                htmlFor="pdf-file"
                className="block text-sm font-medium text-on-surface-variant mb-1"
              >
                Upload PDF
              </label>
              <input
                id="pdf-file"
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-on-surface-variant file:mr-4 file:px-4 file:py-2 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
            </div>

            {message && (
              <p
                className={`text-sm ${
                  message.includes("success")
                    ? "text-tertiary"
                    : "text-error"
                }`}
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={uploading || !file}
              className="px-6 py-2 bg-primary text-on-primary rounded-lg font-medium hover:bg-primary-dim disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {uploading ? "Uploading..." : "Upload PDF"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
