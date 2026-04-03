import Link from "next/link";
import Image from "next/image";
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
    <div className="relative min-h-screen overflow-hidden bg-[#030b2b]">
      {/* Background Artifacts */}
      <Image
        src="/svgs/artifacts/yellow-zigzag.svg"
        alt=""
        width={400}
        height={400}
        aria-hidden
        className="pointer-events-none absolute -right-[6%] top-[10%] h-auto w-50 opacity-100 md:w-90"
      />
      <Image
        src="/svgs/artifacts/small-circles.svg"
        alt=""
        width={400}
        height={400}
        aria-hidden
        className="pointer-events-none absolute left-[12%] top-[10%] h-auto w-20 opacity-100 md:w-70"
      />
      <Image
        src="/svgs/artifacts/big-circles.svg"
        alt=""
        width={400}
        height={400}
        aria-hidden
        className="pointer-events-none absolute -left-[6%] bottom-[30%] h-auto w-20 opacity-100 md:w-70"
      />
      <Image
        src="/svgs/artifacts/yellow-zigzag.svg"
        alt=""
        width={400}
        height={400}
        aria-hidden
        className="pointer-events-none absolute -left-[6%] bottom-[10%] h-auto w-50 opacity-100 md:w-90"
      />

      <div className="container relative z-10 mx-auto max-w-7xl px-4 py-16 space-y-12">
        <div className="mx-auto max-w-4xl text-center space-y-6">
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-6xl">
            Live{" "}
            <span className="relative inline-block text-[#9fe8ff]">
              Streams
              <span className="absolute -bottom-2 left-1/2 h-1.5 w-full -translate-x-1/2 rounded-full bg-[#86deff]" />
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-white/90 md:text-2xl">
            Watch live event feeds and official broadcasts managed by organizers.
          </p>
        </div>

        {!settings.live_streaming_enabled ? (
          <div className="rounded-2xl border border-yellow-500/40 bg-yellow-500/10 p-8 text-center text-yellow-100 shadow-[0_0_22px_rgba(234,179,8,0.2)]">
            <p className="text-xl font-medium">Live streaming is currently disabled by administrators.</p>
          </div>
        ) : streams.length === 0 ? (
          <div className="rounded-2xl border border-[#72dfff]/30 bg-[#1b2a62]/40 p-12 text-center text-white/70 shadow-[0_0_22px_rgba(0,224,255,0.1)]">
            <p className="text-xl">No live streams are available right now.</p>
          </div>
        ) : (
          <div className="space-y-20">
            {/* LIVE NOW */}
            {streams.filter(s => s.status === 'live').length > 0 && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-white border-b border-[#72dfff]/20 pb-4 flex items-center gap-3">
                  <span className="relative flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                  </span>
                  Live Now
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {streams.filter(s => s.status === 'live').map((stream) => {
                    const eventRelation = stream.events as { title?: string; slug?: string; starts_at?: string } | Array<{ title?: string; slug?: string; starts_at?: string }> | null;
                    const event = Array.isArray(eventRelation) ? eventRelation[0] : eventRelation;
                    return (
                      <article 
                        key={stream.id} 
                        className="rounded-2xl border border-[#72dfff] bg-[#1b2a62] p-6 space-y-4 shadow-[0_0_0_1px_rgba(114,223,255,0.5),0_0_30px_rgba(0,224,255,0.4)] relative overflow-hidden"
                      >
                        <div className="flex items-start justify-between gap-4 relative z-10">
                          <div className="space-y-1">
                            <h3 className="text-2xl font-bold text-white tracking-tight">{stream.title}</h3>
                            <p className="text-white/80 text-lg leading-relaxed">{stream.description ?? "No description."}</p>
                          </div>
                          <span className="shrink-0 rounded-full border border-red-500/50 bg-red-500/20 px-4 py-1 text-xs font-bold uppercase tracking-wider text-red-400 animate-pulse">
                            LIVE
                          </span>
                        </div>
                        
                        {event ? (
                          <div className="flex items-center gap-2 text-sm text-[#9fe8ff] relative z-10">
                            <span className="font-semibold px-2 py-0.5 rounded bg-[#9fe8ff]/10">EVENT</span>
                            <span className="font-medium">{event.title}</span>
                          </div>
                        ) : null}

                        {stream.playback_url ? (
                          <div className="mt-4 relative z-10">
                            {isEmbeddable(stream.playback_url) ? (
                              <iframe
                                src={stream.playback_url}
                                title={stream.title}
                                className="w-full aspect-video rounded-xl border border-[#72dfff]/50 shadow-[0_0_15px_rgba(114,223,255,0.3)]"
                                allow="autoplay; encrypted-media; picture-in-picture"
                                allowFullScreen
                              />
                            ) : (
                              <div className="space-y-3">
                                <video controls className="w-full aspect-video rounded-xl border border-[#72dfff]/50 shadow-[0_0_15px_rgba(114,223,255,0.3)]">
                                  <source src={stream.playback_url} />
                                </video>
                                <Link
                                  href={stream.playback_url}
                                  target="_blank"
                                  className="inline-flex items-center gap-2 text-sm text-primary font-bold uppercase tracking-wide hover:opacity-80 transition-opacity"
                                >
                                  Open stream in new tab
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </Link>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center relative z-10">
                            <p className="text-white/60 italic font-medium">Stream will begin shortly.</p>
                          </div>
                        )}
                        {/* Internal Neon Glow */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#72dfff] to-transparent opacity-70"></div>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}

            {/* UPCOMING STREAMS */}
            {streams.filter(s => s.status === 'scheduled' || s.status === 'draft').length > 0 && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-white border-b border-white/10 pb-4 text-white/90">Upcoming Streams</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {streams.filter(s => s.status === 'scheduled' || s.status === 'draft').map((stream) => {
                    const eventRelation = stream.events as { title?: string; slug?: string; starts_at?: string } | Array<{ title?: string; slug?: string; starts_at?: string }> | null;
                    const event = Array.isArray(eventRelation) ? eventRelation[0] : eventRelation;
                    return (
                      <article 
                        key={stream.id} 
                        className="rounded-2xl border border-[#72dfff]/40 bg-[#1b2a62]/80 p-6 space-y-4 opacity-90 transition-opacity hover:opacity-100 hover:border-[#72dfff]/80"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <h3 className="text-2xl font-bold text-white tracking-tight">{stream.title}</h3>
                            <p className="text-white/60 text-lg leading-relaxed">{stream.description ?? "No description."}</p>
                          </div>
                          <span className="shrink-0 rounded-full border border-yellow-500/40 bg-yellow-500/10 px-4 py-1 text-xs font-bold uppercase tracking-wider text-yellow-400">
                            UPCOMING
                          </span>
                        </div>
                        
                        {event ? (
                          <div className="flex items-center gap-2 text-sm text-[#9fe8ff]/80">
                            <span className="font-semibold px-2 py-0.5 rounded bg-[#9fe8ff]/10">EVENT</span>
                            <span className="font-medium">{event.title}</span>
                            <span className="text-white/30">•</span>
                            <span>{event.starts_at ? new Date(event.starts_at).toLocaleString() : "TBD"}</span>
                          </div>
                        ) : null}

                        {stream.playback_url ? (
                          <div className="mt-4 rounded-xl border border-white/10 bg-[#030b2b]/50 p-6 flex flex-col items-center justify-center gap-3">
                            <svg className="w-8 h-8 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            <p className="text-white/50 text-sm font-medium">Link acquired. Stream will appear here.</p>
                          </div>
                        ) : (
                          <div className="mt-4 rounded-xl border border-dashed border-white/10 bg-transparent p-6 text-center">
                            <p className="text-white/40 italic font-medium">Waiting for broadcast link...</p>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PREVIOUS STREAMS */}
            {streams.filter(s => s.status === 'completed').length > 0 && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-white/60 border-b border-white/5 pb-4">Previous Streams</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {streams.filter(s => s.status === 'completed').map((stream) => {
                    const eventRelation = stream.events as { title?: string; slug?: string; starts_at?: string } | Array<{ title?: string; slug?: string; starts_at?: string }> | null;
                    const event = Array.isArray(eventRelation) ? eventRelation[0] : eventRelation;
                    return (
                      <article 
                        key={stream.id} 
                        className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4 grayscale-[0.2] opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <h3 className="text-xl font-bold text-white/80 tracking-tight">{stream.title}</h3>
                            <p className="text-white/50 text-base leading-relaxed line-clamp-2">{stream.description ?? "No description."}</p>
                          </div>
                          <span className="shrink-0 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white/50">
                            COMPLETED
                          </span>
                        </div>
                        
                        {event ? (
                          <div className="flex items-center gap-2 text-sm text-white/40">
                            <span className="font-semibold px-2 py-0.5 rounded bg-white/5 text-xs">EVENT</span>
                            <span className="font-medium">{event.title}</span>
                          </div>
                        ) : null}

                        {stream.playback_url ? (
                          <div className="mt-4">
                            {isEmbeddable(stream.playback_url) ? (
                              <iframe
                                src={stream.playback_url}
                                title={stream.title}
                                className="w-full aspect-video rounded-xl border border-white/10 opacity-70 hover:opacity-100 transition-opacity"
                                allow="autoplay; encrypted-media; picture-in-picture"
                                allowFullScreen
                              />
                            ) : (
                              <div className="space-y-3">
                                <video controls className="w-full aspect-video rounded-xl border border-white/10 opacity-70 hover:opacity-100 transition-opacity">
                                  <source src={stream.playback_url} />
                                </video>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="mt-4 rounded-xl border border-white/5 bg-transparent p-4 text-center">
                            <p className="text-white/30 text-sm italic">Recording unavailable.</p>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {profile?.role === "admin" ? (
          <div className="flex justify-center pt-8">
            <p className="text-sm text-white/50 border-t border-white/10 pt-4 w-full text-center">
              Admin shortcut:{" "}
              <Link href="/admin/live" className="text-primary font-bold hover:underline transition-all">
                MANAGE LIVE STREAMS
              </Link>
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
