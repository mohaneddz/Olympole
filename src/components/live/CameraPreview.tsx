"use client";

import { useEffect, useRef, useState } from "react";
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
    <div className="space-y-3 rounded-xl border border-card-border bg-card-bg/20 p-4">
      <h3 className="font-semibold">Admin Camera Preview</h3>
      <p className="text-sm text-foreground/70">
        Use this to verify camera/audio before publishing a stream URL.
      </p>

      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full aspect-video rounded-lg border border-card-border bg-black"
      />

      <div className="flex gap-2">
        {!streaming ? (
          <Button type="button" variant="outline" onClick={startPreview}>
            Start Camera Preview
          </Button>
        ) : (
          <Button type="button" variant="outline" onClick={stopPreview}>
            Stop Camera Preview
          </Button>
        )}
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </div>
  );
}
