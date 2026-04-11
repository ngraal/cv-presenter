"use client";

import { useState, useEffect } from "react";

export default function ProfileImageUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [hasImage, setHasImage] = useState(false);
  const [imageKey, setImageKey] = useState(0);

  useEffect(() => {
    fetch("/api/image", { method: "HEAD" })
      .then((res) => setHasImage(res.ok))
      .catch(() => {});
  }, []);

  async function handleDelete() {
    try {
      const res = await fetch("/api/image", { method: "DELETE" });
      if (res.ok) {
        setHasImage(false);
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
    formData.append("image", file);

    try {
      const res = await fetch("/api/image/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setMessage("Image uploaded!");
        setHasImage(true);
        setFile(null);
        setImageKey((k) => k + 1);
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
      <h2 className="text-lg font-semibold text-gray-900">Profile Image</h2>

      <div className="flex gap-4">
        {/* Preview thumbnail */}
        {hasImage && (
          <div className="shrink-0 w-28 relative">
            <img
              key={imageKey}
              src={`/api/image?v=${imageKey}`}
              alt="Current profile"
              className="w-28 h-36 rounded-lg object-contain bg-gray-100 border border-gray-200"
            />
            <button
              type="button"
              onClick={handleDelete}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 transition shadow"
              title="Delete image"
            >
              ✕
            </button>
          </div>
        )}

        {/* Upload form */}
        <div className="flex-1 space-y-3">
          <form onSubmit={handleUpload} className="space-y-3">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-gray-700 file:mr-4 file:px-4 file:py-2 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {message && (
              <p className={`text-sm ${message.includes("uploaded") ? "text-green-600" : "text-red-600"}`}>
                {message}
              </p>
            )}
            <button
              type="submit"
              disabled={uploading || !file}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {uploading ? "Uploading..." : "Upload Image"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
