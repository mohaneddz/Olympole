"use client";

import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="antialiased dark bg-black text-white selection:bg-cyan-500/30">
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
          <div className="absolute inset-0 z-0 select-none pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
          </div>

          <div className="relative z-10 flex max-w-md flex-col items-center space-y-6 rounded-3xl border border-red-900/30 bg-black/80 p-8 shadow-2xl backdrop-blur-md">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
              <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tight text-white drop-shadow-md">Critical System Error</h2>
              <p className="text-gray-400 text-sm">A critical layout error occurred affecting the entire application structure.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full pt-4">
              <button
                onClick={() => reset()}
                className="inline-flex w-full flex-1 items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500 disabled:pointer-events-none disabled:opacity-50 bg-red-600 text-white shadow hover:bg-red-600/90 h-10 px-4 py-2"
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Recover System
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="inline-flex w-full flex-1 items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20 disabled:pointer-events-none disabled:opacity-50 border border-white/10 bg-transparent hover:bg-white/10 text-white shadow-sm h-10 px-4 py-2"
              >
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}