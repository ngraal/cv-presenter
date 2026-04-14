"use client";

import { useState, useRef, useEffect } from "react";

export default function FloatingDownloadButton({
  pdfFiles,
}: {
  pdfFiles: string[];
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click (for mobile)
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", handleClickOutside);
    return () =>
      document.removeEventListener("pointerdown", handleClickOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed bottom-6 right-6 z-60 flex flex-col items-end gap-3"
      onMouseLeave={() => setOpen(false)}
    >
      {/* Speed-dial options */}
      <div
        className={`flex flex-col items-end gap-3 mb-2 transition-all duration-300 ${
          open
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        {pdfFiles.map((name) => (
          <a
            key={name}
            href={`/api/pdf?file=${encodeURIComponent(name)}`}
            className="flex items-center gap-3 h-12 pl-5 pr-4 bg-surface-container-high text-on-surface rounded-full shadow-lg hover:bg-surface-bright transition-colors duration-200"
          >
            <span className="whitespace-nowrap text-sm font-semibold">
              {name}
            </span>
            <span className="material-symbols-outlined text-xl">
              picture_as_pdf
            </span>
          </a>
        ))}
      </div>

      {/* Main FAB */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        onMouseEnter={() => setOpen(true)}
        className={`flex items-center justify-center w-14 h-14 bg-linear-to-br from-primary to-secondary text-on-primary-fixed rounded-full shadow-lg transition-transform duration-300 cursor-pointer ${
          open ? "rotate-45" : ""
        }`}
        aria-label="Download options"
      >
        <span className={`material-symbols-outlined text-2xl transition-transform duration-300 ${
          open ? "-rotate-45" : ""
        }`}>file_save</span>
      </button>
    </div>
  );
}
