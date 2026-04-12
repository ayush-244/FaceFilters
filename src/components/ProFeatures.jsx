/**
 * ProFeatures.jsx
 * ================
 * Advanced controls: video recording, fullscreen, mirror mode, etc.
 */

import { useRef, useState, useCallback } from "react";

export default function ProFeatures({ canvasRef }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isMirror, setIsMirror] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingIntervalRef = useRef(null);

  // ── Video Recording ──────────────────────────────────────────
  const startRecording = useCallback(() => {
    const canvas = typeof canvasRef === 'function' ? canvasRef() : canvasRef?.current;
    if (!canvas) return;

    recordedChunksRef.current = [];
    const stream = canvas.captureStream(30);
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "video/webm;codecs=vp9",
      videoBitsPerSecond: 2500000,
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `face-filter-${Date.now()}.webm`;
      link.click();
      URL.revokeObjectURL(url);
    };

    mediaRecorder.start();
    mediaRecorderRef.current = mediaRecorder;
    setIsRecording(true);
    setRecordingTime(0);

    recordingIntervalRef.current = setInterval(() => {
      setRecordingTime((t) => t + 1);
    }, 1000);
  }, [canvasRef]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingIntervalRef.current);
      setRecordingTime(0);
    }
  }, [isRecording]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  // ── Mirror Mode ──────────────────────────────────────────────
  const toggleMirror = useCallback(() => {
    setIsMirror((prev) => !prev);
  }, []);

  // ── Fullscreen ───────────────────────────────────────────────
  const toggleFullscreen = useCallback(() => {
    const elem = document.querySelector(".camera-wrapper");
    if (!elem) return;

    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(() => {
        console.warn("Fullscreen request failed");
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  // Format time (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="pro-features">
      {/* Recording Button */}
      <button
        className={`pro-btn pro-record ${isRecording ? "recording" : ""}`}
        onClick={toggleRecording}
        title={isRecording ? "Stop recording" : "Start recording"}
      >
        <span className="pro-icon">{isRecording ? "⏹️" : "🎥"}</span>
        {isRecording && <span className="recording-time">{formatTime(recordingTime)}</span>}
      </button>

      {/* Mirror Button */}
      <button
        className={`pro-btn pro-mirror ${isMirror ? "active" : ""}`}
        onClick={toggleMirror}
        title="Toggle mirror mode"
      >
        <span className="pro-icon">🔄</span>
      </button>

      {/* Fullscreen Button */}
      <button className="pro-btn pro-fullscreen" onClick={toggleFullscreen} title="Fullscreen">
        <span className="pro-icon">⛶</span>
      </button>
    </div>
  );
}
