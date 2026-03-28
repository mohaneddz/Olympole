import Link from "next/link";
import { getPublicEvents, getPublicLiveStreams } from "@/lib/queries";

export default async function ArtExhibitionPage() {
  const [events, liveStreams] = await Promise.all([getPublicEvents(), getPublicLiveStreams()]);
  const artEvents = events.filter(
    (event) => {
      const sport = event.sports as { slug?: string } | Array<{ slug?: string }> | null;
      const sportSlug = Array.isArray(sport) ? sport[0]?.slug : sport?.slug;
      return sportSlug === "art-exhibition";
    }
  );

  const artStreams = liveStreams.filter((stream) => {
    const linkedEventRelation = stream.events as { slug?: string } | Array<{ slug?: string }> | null;
    const linkedEvent = Array.isArray(linkedEventRelation) ? linkedEventRelation[0] : linkedEventRelation;
    return linkedEvent?.slug === "art-exhibition-2026";
  });

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl flex flex-col gap-8 flex-1">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-secondary">
          Art Exhibition
        </h1>
        <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
          Event metadata, schedule windows, and optional live viewing are powered directly from Supabase.
        </p>
      </div>

      {artEvents.length === 0 ? (
        <div className="rounded-xl border border-card-border p-6 text-foreground/70">
          No art exhibition event has been scheduled yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {artEvents.map((event) => (
            <article key={event.id} className="rounded-xl border border-card-border bg-card-bg/20 p-5 space-y-2">
              <h2 className="text-xl font-semibold">{event.title}</h2>
              <p className="text-sm text-foreground/70">{event.description ?? "No description available."}</p>
              <p className="text-sm text-foreground/60">
                {new Date(event.starts_at).toLocaleString()} - {new Date(event.ends_at).toLocaleString()}
              </p>
              <p className="text-sm text-foreground/60">Venue: {event.venue}</p>
              <span className="inline-block rounded-full border border-card-border px-2 py-1 text-xs uppercase">
                {event.status}
              </span>
            </article>
          ))}
        </div>
      )}

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Related Live Feeds</h2>
        {artStreams.length === 0 ? (
          <p className="text-foreground/70">
            No dedicated art stream available. Check the{" "}
            <Link href="/live" className="text-primary underline-offset-4 hover:underline">
              live page
            </Link>
            .
          </p>
        ) : (
          <div className="space-y-3">
            {artStreams.map((stream) => (
              <div key={stream.id} className="rounded-xl border border-card-border p-4">
                <p className="font-medium">{stream.title}</p>
                <p className="text-sm text-foreground/70">{stream.description ?? "No description."}</p>
                {stream.playback_url ? (
                  <Link href={stream.playback_url} target="_blank" className="text-sm text-primary underline-offset-4 hover:underline">
                    Open playback link
                  </Link>
                ) : (
                  <p className="text-sm text-foreground/60">Playback URL not configured.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
