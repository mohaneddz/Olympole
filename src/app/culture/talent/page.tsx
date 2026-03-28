import Link from "next/link";
import { getPublicEvents, getPublicLiveStreams, getPublicResults } from "@/lib/queries";

export default async function TalentShowPage() {
  const [events, streams, results] = await Promise.all([
    getPublicEvents(),
    getPublicLiveStreams(),
    getPublicResults(),
  ]);

  const talentEvents = events.filter(
    (event) => {
      const sport = event.sports as { slug?: string } | Array<{ slug?: string }> | null;
      const sportSlug = Array.isArray(sport) ? sport[0]?.slug : sport?.slug;
      return sportSlug === "talent-show";
    }
  );

  const talentEventIds = new Set(talentEvents.map((event) => event.id));
  const talentResults = results.filter((result) => talentEventIds.has(result.event_id)).slice(0, 6);

  const talentStreams = streams.filter((stream) => {
    const linkedEventRelation = stream.events as { slug?: string } | Array<{ slug?: string }> | null;
    const linkedEvent = Array.isArray(linkedEventRelation) ? linkedEventRelation[0] : linkedEventRelation;
    return linkedEvent?.slug === "talent-show-finals-2026";
  });

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl flex flex-col gap-10 flex-1">
      <div className="text-center space-y-4">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-primary">
          Talent Show
        </h1>
        <p className="text-lg text-foreground/70 max-w-3xl mx-auto">
          Live stage data, schedule, and rankings are now fed by the event database with no hardcoded contestants.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Scheduled Talent Events</h2>
        {talentEvents.length === 0 ? (
          <div className="rounded-xl border border-card-border p-4 text-foreground/70">
            No talent show events available yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {talentEvents.map((event) => (
              <div key={event.id} className="rounded-xl border border-card-border bg-card-bg/20 p-5 space-y-2">
                <p className="text-xl font-semibold">{event.title}</p>
                <p className="text-sm text-foreground/70">{event.description ?? "No description."}</p>
                <p className="text-sm text-foreground/60">
                  {new Date(event.starts_at).toLocaleString()} • {event.venue}
                </p>
                <span className="inline-block rounded-full border border-card-border px-2 py-1 text-xs uppercase">
                  {event.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Live Broadcast</h2>
        {talentStreams.length === 0 ? (
          <p className="text-foreground/70">
            No active talent stream yet. Visit{" "}
            <Link href="/live" className="text-primary underline-offset-4 hover:underline">
              /live
            </Link>{" "}
            for all broadcasts.
          </p>
        ) : (
          talentStreams.map((stream) => (
            <div key={stream.id} className="rounded-xl border border-card-border bg-card-bg/20 p-4 space-y-3">
              <p className="font-semibold">{stream.title}</p>
              <p className="text-sm text-foreground/70">{stream.description ?? "No description."}</p>
              {stream.playback_url ? (
                <Link href={stream.playback_url} target="_blank" className="text-sm text-primary underline-offset-4 hover:underline">
                  Open stream
                </Link>
              ) : (
                <p className="text-sm text-foreground/60">Playback URL not configured.</p>
              )}
            </div>
          ))
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Published Rankings</h2>
        {talentResults.length === 0 ? (
          <div className="rounded-xl border border-card-border p-4 text-foreground/70">
            Rankings are not published yet.
          </div>
        ) : (
          <div className="space-y-3">
            {talentResults.map((result) => (
              <div key={result.id} className="rounded-xl border border-card-border p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{result.participant_or_team_name}</p>
                  <p className="text-sm text-foreground/60">{result.score_summary ?? "No summary."}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm uppercase text-foreground/60">{result.medal ?? "rank"}</p>
                  <p className="text-xl font-semibold">#{result.placement}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
