"use client";

export default function FloatingDownloadButton() {
  return (
    <div className="fixed bottom-6 right-6 z-60">
      <a
        href="/api/pdf"
        className="group flex items-center justify-end h-14 w-14 hover:w-56 bg-linear-to-br from-primary to-secondary text-on-primary-fixed rounded-full shadow-lg transition-all duration-300 overflow-hidden"
      >
        <span className="whitespace-nowrap text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 pl-5 pr-2">
          Download as PDF
        </span>
        <span className="flex items-center justify-center w-14 h-14 shrink-0">
          <span className="material-symbols-outlined text-2xl">download</span>
        </span>
      </a>
    </div>
  );
}
