/**
 * Camera.jsx
 * ----------
 * Core component that:
 *  1. Requests webcam access
 *  2. Renders live video + overlay canvas
 *  3. Initializes MediaPipe FaceMesh
 *  4. Drives the render loop via requestAnimationFrame
 *  5. Applies the currently-selected filter every frame
 *
 * Props:
 *  - activeFilter {string|null} – the id of the active filter
 *  - onFpsUpdate  {function}    – optional callback receiving current FPS
 */

import React, { useRef, useEffect, useState, useCallback } from "react";
import { createFaceMesh, startCamera, LandmarkSmoother } from "../utils/faceDetection";
import { renderAnimatedFilter } from "../utils/animatedFilters";
import { loadAssets } from "../utils/assetLoader";

const CANVAS_W = 640;
const CANVAS_H = 480;

const Camera = React.forwardRef(({ activeFilter, onFpsUpdate, filterIntensity = 100 }, ref) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const assetsRef = useRef(null);
  const cameraRef = useRef(null);
  const faceMeshRef = useRef(null);
  const latestResults = useRef(null);
  const smootherRef = useRef(new LandmarkSmoother(0.2)); // Smooth factor: 0.2 = balance between smooth & responsive
  const rafId = useRef(null);
  const fpsFrames = useRef([]);

  const [permissionDenied, setPermissionDenied] = useState(false);
  const [loading, setLoading] = useState(true);

  // Forward canvas ref
  useEffect(() => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(canvasRef.current);
      } else {
        ref.current = canvasRef.current;
      }
    }
  }, [ref]);

  // ── Preload assets once (async – real PNG images) ─────────────
  useEffect(() => {
    let cancelled = false;
    loadAssets().then((assets) => {
      if (!cancelled) assetsRef.current = assets;
    });
    return () => { cancelled = true; };
  }, []);

  // ── MediaPipe results callback ─────────────────────────────────
  const onResults = useCallback((results) => {
    latestResults.current = results;
  }, []);

  // ── Render loop (decoupled from MediaPipe callback) ────────────
  useEffect(() => {
    let running = true;

    function renderFrame() {
      if (!running) return;

      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) {
        rafId.current = requestAnimationFrame(renderFrame);
        return;
      }

      const ctx = canvas.getContext("2d");
      const w = canvas.width;
      const h = canvas.height;

      // Draw mirror-flipped video frame
      ctx.save();
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, w, h);
      ctx.restore();

      // Apply active filter if face landmarks are available
      const results = latestResults.current;
      if (results && results.multiFaceLandmarks) {
        for (let landmarkSet of results.multiFaceLandmarks) {
          // Mirror landmarks on x-axis to match the flipped video
          const mirrored = landmarkSet.map((lm) => ({
            x: 1 - lm.x,
            y: lm.y,
            z: lm.z,
          }));

          // ✨ APPLY SMOOTHING TO REDUCE JITTER ✨
          const smoothedLandmarks = smootherRef.current.smooth(mirrored);

          applyFilter(ctx, smoothedLandmarks, w, h, activeFilter, assetsRef.current, filterIntensity);
        }
      }

      // FPS tracking
      const now = performance.now();
      fpsFrames.current.push(now);
      // Keep only last 1 second of timestamps
      fpsFrames.current = fpsFrames.current.filter((t) => now - t < 1000);
      if (onFpsUpdate) {
        onFpsUpdate(fpsFrames.current.length);
      }

      rafId.current = requestAnimationFrame(renderFrame);
    }

    rafId.current = requestAnimationFrame(renderFrame);

    return () => {
      running = false;
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [activeFilter, onFpsUpdate, filterIntensity]);

  // ── Initialize FaceMesh + camera ───────────────────────────────
  useEffect(() => {
    let cam = null;
    let cancelled = false;

    async function init() {
      try {
        // First, request camera permission explicitly so we can
        // distinguish "permission denied" from other errors.
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
        });
        // Stop the temporary stream — MediaPipe Camera will open its own
        stream.getTracks().forEach((t) => t.stop());

        if (cancelled) return;

        const faceMesh = createFaceMesh(onResults);
        faceMeshRef.current = faceMesh;

        const video = videoRef.current;
        if (!video) return;

        cam = startCamera(video, faceMesh);
        cameraRef.current = cam;
        setLoading(false);
      } catch (err) {
        console.error("Camera / FaceMesh init error:", err);
        if (!cancelled) {
          setPermissionDenied(true);
          setLoading(false);
        }
      }
    }

    init();

    // Cleanup on unmount – prevent memory leaks
    return () => {
      cancelled = true;
      if (cam) cam.stop();
      if (faceMeshRef.current) faceMeshRef.current.close();
    };
  }, [onResults]);

  // ── Permission denied UI ───────────────────────────────────────
  if (permissionDenied) {
    return (
      <div className="camera-error">
        <div className="error-icon">📷</div>
        <h2>Camera Access Required</h2>
        <p>
          Please allow camera access in your browser settings to use
          face filters. Reload the page after granting permission.
        </p>
        <button onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="camera-container">
      {loading && (
        <div className="camera-loading">
          <div className="spinner" />
          <p>Loading face detection model…</p>
        </div>
      )}

      {/* Hidden video element – MediaPipe feeds frames from this */}
      <video
        ref={videoRef}
        style={{ display: "none" }}
        autoPlay
        playsInline
        muted
      />

      {/* Visible canvas – we draw the mirrored video + overlays here */}
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="camera-canvas"
      />
    </div>
  );
});

// ── Apply the correct filter renderer ────────────────────────────

function applyFilter(ctx, landmarks, w, h, filterId, assets, intensity = 100) {
  if (!filterId) return;
  
  // Apply filter with opacity adjustment for intensity
  ctx.save();
  ctx.globalAlpha = (intensity / 100) * ctx.globalAlpha;
  renderAnimatedFilter(ctx, landmarks, w, h, filterId);
  ctx.restore();
}

export default Camera;
