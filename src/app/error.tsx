"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, Home, RefreshCcw } from "lucide-react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <Image
          src="/images/backgrounds/hero.avif"
          alt="Error background"
          fill
          className="object-cover opacity-10"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      <div className="relative z-10 flex max-w-md flex-col items-center space-y-6 rounded-3xl border border-red-900/30 bg-black/40 p-8 shadow-2xl backdrop-blur-md">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
          <AlertTriangle className="h-10 w-10 text-red-500" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-3xl font-black tracking-tight text-white drop-shadow-md">Oops! Something cracked</h2>
          <p className="text-muted-foreground text-sm">{error.message || "An unexpected system error occurred."}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full pt-4">
          <Button variant="neonPill" onClick={() => reset()} className="w-full flex-1">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button variant="outline" asChild className="w-full flex-1 rounded-full border-white/10 hover:bg-white/5 text-foreground">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
