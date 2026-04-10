/**
 * CaptureButton.jsx
 * ------------------
 * Bonus feature – snapshot button that captures the current
 * canvas frame and lets the user download it as a PNG.
 *
 * Props:
 *  - canvasSelector {string} – CSS selector for the canvas element
 */

import { useCallback } from "react";

export default function CaptureButton({ canvasSelector = ".camera-canvas" }) {
  const handleCapture = useCallback(() => {
    const canvas = document.querySelector(canvasSelector);
    if (!canvas) return;

    // Convert canvas content to a downloadable PNG
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `face-filter-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, "image/png");
  }, [canvasSelector]);

  return (
    <button className="capture-btn" onClick={handleCapture} title="Capture photo">
      <svg
        viewBox="0 0 24 24"
        width="28"
        height="28"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="13" r="4" />
        <path d="M9 2L7.17 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2h-3.17L15 2H9z" />
      </svg>
    </button>
  );
}
