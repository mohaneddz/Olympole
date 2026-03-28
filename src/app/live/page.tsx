import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";
import { getAppSettings, getPublicLiveStreams } from "@/lib/queries";

function isEmbeddable(url: string) {
  return url.includes("youtube.com/embed") || url.includes("player.vimeo.com");
}

export default async function LivePage() {
  const [settings, streams, profile] = await Promise.all([
    getAppSettings(),
    getPublicLiveStreams(),
    getCurrentProfile(),
  ]);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 space-y-8 flex-1">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Live Streams</h1>
        <p className="text-foreground/70">
          Watch live event feeds and official broadcasts managed by organizers.
        </p>
      </div>

      {!settings.live_streaming_enabled ? (
        <div className="rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-4 text-yellow-100">
          Live streaming is currently disabled by administrators.
        </div>
      ) : streams.length === 0 ? (
        <div className="rounded-xl border border-card-border p-4 text-foreground/70">
          No live streams are available right now.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {streams.map((stream) => {
            const eventRelation = stream.events as { title?: string; slug?: string; starts_at?: string } | Array<{ title?: string; slug?: string; starts_at?: string }> | null;
            const event = Array.isArray(eventRelation) ? eventRelation[0] : eventRelation;
            return (
              <article key={stream.id} className="rounded-xl border border-card-border bg-card-bg/20 p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold">{stream.title}</h2>
                  <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs uppercase">
                    {stream.status}
                  </span>
                </div>
                <p className="text-sm text-foreground/70">{stream.description ?? "No description."}</p>
                {event ? (
                  <p className="text-sm text-foreground/60">
                    Event: {event.title} • {event.starts_at ? new Date(event.starts_at).toLocaleString() : "TBD"}
                  </p>
                ) : null}
                {stream.playback_url ? (
                  isEmbeddable(stream.playback_url) ? (
                    <iframe
                      src={stream.playback_url}
                      title={stream.title}
                      className="w-full aspect-video rounded-lg border border-card-border"
                      allow="autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="space-y-2">
                      <video controls className="w-full aspect-video rounded-lg border border-card-border">
                        <source src={stream.playback_url} />
                      </video>
                      <Link
                        href={stream.playback_url}
                        target="_blank"
                        className="text-sm text-primary underline-offset-4 hover:underline"
                      >
                        Open stream in new tab
                      </Link>
                    </div>
                  )
                ) : (
                  <p className="text-sm text-foreground/60">Playback link not set yet.</p>
                )}
              </article>
            );
          })}
        </div>
      )}

      {profile?.role === "admin" ? (
        <p className="text-sm text-foreground/60">
          Admin shortcut:{" "}
          <Link href="/admin/live" className="text-primary underline-offset-4 hover:underline">
            manage live streams
          </Link>
          .
        </p>
      ) : null}
    </div>
  );
}
