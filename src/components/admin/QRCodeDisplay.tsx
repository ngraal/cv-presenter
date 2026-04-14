"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

export default function QRCodeDisplay({ url }: { url: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && url) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 256,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
      });
    }
  }, [url]);

  return (
    <div>
      <label className="block text-sm font-medium text-on-surface-variant mb-2">
        QR Code
      </label>
      <div className="inline-block p-4 bg-white rounded-lg">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
