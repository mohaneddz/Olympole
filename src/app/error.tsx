"use client";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold mb-3">Something went wrong</h2>
      <p className="text-foreground/70 mb-6">{error.message}</p>
      <button className="px-4 py-2 rounded border border-card-border" onClick={reset}>Try again</button>
    </div>
  );
}
