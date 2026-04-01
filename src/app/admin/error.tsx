"use client";

export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-4 text-center">
      <h2 className="text-2xl font-bold">Admin section error</h2>
      <p className="text-foreground/70">{error.message}</p>
      <button className="px-4 py-2 rounded border border-card-border" onClick={reset}>Retry</button>
    </div>
  );
}
