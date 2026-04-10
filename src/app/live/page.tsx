import Link from "next/link";
import Image from "next/image";
import { getCurrentProfile } from "@/lib/auth";
import { SHARED_DECORATIVE_ELEMENTS } from "@/data/decoration";
import { getAppSettings, getPublicLiveStreams } from "@/lib/queries";

type StreamEvent = {
  title?: string | null;
  slug?: string | null;
  starts_at?: string | null;
} | null;

function getEmbeddableUrl(url: string) {
  const value = url.trim();

  if (value.includes("youtube.com/embed") || value.includes("player.vimeo.com")) {
    return value;
  }

  try {
    const parsed = new URL(value);

    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      if (id) {
        return `https://www.youtube.com/embed/${id}`;
      }

      const shortsId = parsed.pathname.startsWith("/shorts/")
        ? parsed.pathname.replace("/shorts/", "")
        : null;
      if (shortsId) {
        return `https://www.youtube.com/embed/${shortsId}`;
      }
    }

    if (parsed.hostname.includes("vimeo.com")) {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {
    return null;
  }

  return null;
}

function resolveEvent(eventRelation: unknown): StreamEvent {
  if (!eventRelation) {
    return null;
  }

  const first = Array.isArray(eventRelation) ? eventRelation[0] : eventRelation;
  if (!first || typeof first !== "object") {
    return null;
  }

  const event = first as { title?: string; slug?: string; starts_at?: string };
  return {
    title: event.title,
    slug: event.slug,
    starts_at: event.starts_at,
  };
}

function formatStreamDate(value?: string | null) {
  if (!value) {
    return "TBD";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "TBD";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsed);
}

export default async function LivePage() {
  const [settings, streams, profile] = await Promise.all([
    getAppSettings(),
    getPublicLiveStreams(),
    getCurrentProfile(),
  ]);
  const liveStreams = streams.filter((stream) => stream.status === "live");
  const upcomingStreams = streams.filter((stream) => stream.status === "draft");
  const previousStreams = streams.filter((stream) => stream.status === "ended");

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <section className="relative flex min-h-[60vh] flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/backgrounds/hero.avif"
            alt=""
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(5,5,15,0.4)_80%,rgba(5,5,15,0.5)_100%)] z-0" />
          <div className="absolute inset-0 bg-background/10 backdrop-blur-[1px]" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "40px 40px" }}
          />
        </div>

        <div className="container relative z-10 mx-auto flex flex-col items-center justify-center gap-4 px-4 text-center">
          <Image
            src="/images/brand/fire.png"
            alt=""
            width={292}
            height={362}
            aria-hidden
            className="mb-2 h-auto w-32 md:w-40 animate-fade-in-up"
          />
          <Image
            src="/images/brand/circles.png"
            alt=""
            width={243}
            height={134}
            aria-hidden
            className="mb-6 h-auto w-16 md:w-20 animate-fade-in-up"
          />
          <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
              LIVE STREAMS
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-base text-white/85 md:text-xl">
            Watch active broadcasts first, then browse ended streams in compact replay cards.
          </p>
        </div>
      </section>

      <section id="live-streams" className="relative z-10 w-full bg-background pt-16 mt-4 pb-20">
        {SHARED_DECORATIVE_ELEMENTS.map((el, i) => (
          <Image
            key={i}
            src={el.src}
            alt=""
            width={120}
            height={120}
            aria-hidden
            className={`pointer-events-none ${el.className}`}
          />
        ))}

        <div className="z-10 mx-auto w-full max-w-7xl px-4">
          {!settings.live_streaming_enabled ? (
            <div className="rounded-2xl border border-yellow-300/45 bg-yellow-500/10 p-8 text-center text-yellow-100">
              <p className="text-lg font-semibold">Live streaming is currently disabled by administrators.</p>
            </div>
          ) : streams.length === 0 ? (
            <div className="rounded-2xl border border-cyan-300/45 bg-[#1c2f67]/50 p-10 text-center text-white/70">
              <p className="text-lg">No streams are available right now.</p>
            </div>
          ) : (
            <div className="space-y-14">
              {liveStreams.length > 0 && (
                <section className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-cyan-300/35 pb-4">
                    <span className="relative flex h-3.5 w-3.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-70" />
                      <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-red-500" />
                    </span>
                    <h2 className="font-heading text-3xl font-black tracking-tight text-white">Live Now</h2>
                  </div>
                  <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
                    {liveStreams.map((stream) => {
                      const event = resolveEvent(stream.events);
                      const embedUrl = stream.playback_url ? getEmbeddableUrl(stream.playback_url) : null;

                      return (
                        <article
                          key={stream.id}
                          className="rounded-3xl border border-cyan-300/60 bg-[#1c2f67]/95 p-6 shadow-[0_0_0_1px_rgba(114,223,255,0.35),0_10px_40px_rgba(0,0,0,0.35)] md:p-7"
                        >
                          <div className="mb-5 flex items-start justify-between gap-4">
                            <div className="space-y-2">
                              <h3 className="text-2xl font-black tracking-tight text-white">{stream.title}</h3>
                              <p className="text-sm leading-relaxed text-white/75 md:text-base">
                                {stream.description ?? "Live coverage in progress."}
                              </p>
                            </div>
                            <span className="shrink-0 rounded-full border border-red-400/60 bg-red-500/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-red-300">
                              Live
                            </span>
                          </div>

                          {event?.title ? (
                            <p className="mb-4 text-sm text-cyan-200">
                              {event.title}
                              {event.starts_at ? ` - ${formatStreamDate(event.starts_at)}` : ""}
                            </p>
                          ) : null}

                          {stream.playback_url ? (
                            <>
                              {embedUrl ? (
                                <iframe
                                  src={embedUrl}
                                  title={stream.title}
                                  className="w-full aspect-video rounded-2xl border border-cyan-300/35 bg-black/30"
                                  allow="autoplay; encrypted-media; picture-in-picture"
                                  allowFullScreen
                                />
                              ) : (
                                <video
                                  controls
                                  className="w-full aspect-video rounded-2xl border border-cyan-300/35 bg-black/30"
                                >
                                  <source src={stream.playback_url} />
                                </video>
                              )}
                              <Link
                                href={stream.playback_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 inline-flex rounded-lg border border-cyan-300/50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-cyan-100 transition hover:bg-cyan-300/10"
                              >
                                Open stream link
                              </Link>
                            </>
                          ) : (
                            <div className="rounded-2xl border border-dashed border-white/20 bg-black/20 p-10 text-center text-sm text-white/60">
                              Stream link will appear here shortly.
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                </section>
              )}

              {upcomingStreams.length > 0 && (
                <section className="space-y-5">
                  <h2 className="font-heading text-2xl font-black tracking-tight text-white/90">Upcoming Streams</h2>
                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    {upcomingStreams.map((stream) => {
                      const event = resolveEvent(stream.events);

                      return (
                        <article key={stream.id} className="rounded-2xl border border-cyan-300/35 bg-[#1a2b5f]/80 p-5">
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <h3 className="text-xl font-bold text-white">{stream.title}</h3>
                            <span className="rounded-full border border-amber-300/50 bg-amber-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-200">
                              Upcoming
                            </span>
                          </div>
                          <p className="text-sm text-white/70">{stream.description ?? "Waiting for stream start."}</p>
                          <p className="mt-3 text-xs text-cyan-100/90">
                            {event?.title ? `${event.title} - ` : ""}
                            {formatStreamDate(stream.starts_at || event?.starts_at)}
                          </p>
                        </article>
                      );
                    })}
                  </div>
                </section>
              )}

              {previousStreams.length > 0 && (
                <section className="space-y-5">
                  <h2 className="font-heading text-2xl font-black tracking-tight text-white/80">Ended Streams</h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {previousStreams.map((stream) => {
                      const event = resolveEvent(stream.events);

                      return (
                        <article
                          key={stream.id}
                          className="rounded-xl border border-white/15 bg-white/[0.04] p-4 transition-colors hover:border-cyan-300/35 hover:bg-white/[0.06]"
                        >
                          <div className="mb-3 flex items-start justify-between gap-3">
                            <h3 className="line-clamp-2 text-base font-semibold text-white/90">{stream.title}</h3>
                            <span className="shrink-0 rounded-full border border-white/25 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/60">
                              Ended
                            </span>
                          </div>

                          <p className="line-clamp-2 text-xs leading-relaxed text-white/60">
                            {stream.description ?? "No replay description."}
                          </p>

                          <div className="mt-3 space-y-1 text-[11px] text-white/55">
                            {event?.title ? <p className="line-clamp-1">{event.title}</p> : null}
                            <p>{formatStreamDate(stream.ends_at || stream.starts_at || event?.starts_at)}</p>
                          </div>

                          {stream.playback_url ? (
                            <Link
                              href={stream.playback_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-4 inline-flex rounded-md border border-cyan-300/45 px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-cyan-100 transition hover:bg-cyan-300/10"
                            >
                              Watch replay
                            </Link>
                          ) : (
                            <p className="mt-4 text-[11px] text-white/40">Replay unavailable</p>
                          )}
                        </article>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>
          )}

          {profile?.role === "admin" ? (
            <div className="mt-10 flex justify-center">
              <p className="w-full border-t border-white/10 pt-5 text-center text-sm text-white/55">
                Admin shortcut{" "}
                <Link href="/admin/live-streams" className="font-semibold text-cyan-200 transition hover:text-cyan-100">
                  Manage live streams
                </Link>
              </p>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
