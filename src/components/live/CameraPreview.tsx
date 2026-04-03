"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CircleDot, Mic } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function CameraPreview() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");

  async function startPreview() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setStreaming(true);
    } catch {
      setError("Camera access denied or unavailable on this device.");
    }
  }

  function stopPreview() {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStreaming(false);
  }

  useEffect(() => {
    return () => stopPreview();
  }, []);

  return (
    <aside className="space-y-4 rounded-2xl border border-cyan-300/20 bg-[linear-gradient(145deg,rgba(6,14,36,0.95),rgba(4,10,28,0.96))] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-white">Admin Camera Preview</h3>
          <p className="mt-1 text-sm text-cyan-100/70">
            Verify camera/audio quality before publishing.
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold ${
            streaming
              ? "border-emerald-300/40 bg-emerald-400/10 text-emerald-200"
              : "border-cyan-300/30 bg-cyan-300/10 text-cyan-100"
          }`}
        >
          <CircleDot className="h-3.5 w-3.5" />
          {streaming ? "live preview" : "idle"}
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-cyan-300/20 bg-black">
        <video ref={videoRef} autoPlay muted playsInline className="aspect-video w-full object-cover" />
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-cyan-300/15 bg-[#0e1736]/70 p-2.5 text-xs text-cyan-100/75">
          <p className="mb-1 inline-flex items-center gap-1 font-semibold text-cyan-100">
            <Camera className="h-3.5 w-3.5" />
            Video
          </p>
          <p>{streaming ? "Detected" : "Not active"}</p>
        </div>
        <div className="rounded-lg border border-cyan-300/15 bg-[#0e1736]/70 p-2.5 text-xs text-cyan-100/75">
          <p className="mb-1 inline-flex items-center gap-1 font-semibold text-cyan-100">
            <Mic className="h-3.5 w-3.5" />
            Audio
          </p>
          <p>{streaming ? "Detected" : "Not active"}</p>
        </div>
      </div>

      <div className="flex gap-2">
        {!streaming ? (
          <Button type="button" variant="outline" onClick={startPreview}>
            Start Preview
          </Button>
        ) : (
          <Button type="button" variant="outline" onClick={stopPreview}>
            Stop Preview
          </Button>
        )}
      </div>

      {error ? (
        <p className="rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-300">{error}</p>
      ) : null}
    </aside>
  );
}
