"use client";

import { useState } from "react";

export default function AdminBadge() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed top-4 left-4 z-50">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-blue-600 hover:border-blue-300 transition shadow-lg"
      >
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        Admin
      </button>

      <div
        className={`absolute top-full left-0 mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden transition-all duration-200 origin-top-left ${
          open
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
        }`}
      >
        <a
          href="/"
          className="flex items-center gap-2 px-4 py-3 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          CV
        </a>
        <a
          href="/admin/tokens"
          className="flex items-center gap-2 px-4 py-3 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition border-t border-gray-100"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
          </svg>
          Tokens
        </a>
        <a
          href="/admin/editor"
          className="flex items-center gap-2 px-4 py-3 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition border-t border-gray-100"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zM16.862 4.487L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
          Editor
        </a>
      </div>
    </div>
  );
}
