"use client";

import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8 text-center bg-zinc-950 rounded-xl border border-zinc-800 m-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 mb-6">
        <AlertTriangle className="h-8 w-8 text-red-500" />
      </div>
      
      <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Admin Panel Error</h2>
      <p className="text-zinc-400 max-w-lg mb-8">{error.message || "An unexpected error occurred while loading the dashboard."}</p>
      
      <Button variant="neonPill" onClick={() => reset()} className="w-full sm:w-auto min-w-[150px]">
        <RefreshCcw className="mr-2 h-4 w-4" />
        Retry Dashboard
      </Button>
    </div>
  );
}
