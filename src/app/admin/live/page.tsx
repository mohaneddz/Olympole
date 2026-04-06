import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  deleteLiveStreamAction,
  updateLiveStreamDetailsAction,
  updateLiveStreamStatusAction,
} from "@/app/actions/events";
import { requireAdmin } from "@/lib/auth";
import { getAdminLiveStreams, getAllAdminEvents } from "@/lib/queries";
import { PlusCircle, Radio } from "lucide-react";

function badgeClasses(status: string) {
  if (status === "live") {
    return "border-emerald-300/40 bg-emerald-400/10 text-emerald-200";
  }
  if (status === "ended") {
    return "border-amber-300/40 bg-amber-300/10 text-amber-200";
  }
  return "border-cyan-300/30 bg-cyan-300/10 text-cyan-100";
}

function toDateTimeLocalValue(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export default async function AdminLivePage() {
  await requireAdmin();
  const [streams, events] = await Promise.all([getAdminLiveStreams(), getAllAdminEvents()]);

  const totalStreams = streams.length;
  const liveCount = streams.filter((stream) => stream.status === "live").length;
  const draftCount = streams.filter((stream) => stream.status === "draft").length;
  const endedCount = streams.filter((stream) => stream.status === "ended").length;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        icon={<Radio className="h-3.5 w-3.5" />}
        title="Live Streams"
        description="Manage stream metadata, status, and playback links."
        actions={
          <Link href="/admin/live/new" className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/40 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-100">
            <PlusCircle className="h-4 w-4" />
            New Stream
          </Link>
        }
        stats={[
          { label: "Total", value: totalStreams },
          { label: "Live", value: liveCount, tone: "success" },
          { label: "Draft", value: draftCount },
          { label: "Ended", value: endedCount, tone: "warning" },
        ]}
      />

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-black text-white">Existing Streams</h2>
          <p className="text-sm text-cyan-100/70">{streams.length} stream(s)</p>
        </div>

        {streams.length === 0 ? (
          <div className="rounded-2xl border border-cyan-300/20 bg-[#07112a]/80 p-6 text-cyan-100/70">
            No streams yet. Create your first stream to start broadcasting.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {streams.map((stream) => {
              const linkedEvent = Array.isArray(stream.events) ? stream.events[0] : stream.events;

              return (
                <article
                  key={stream.id}
                  className="space-y-4 rounded-2xl border border-cyan-300/20 bg-[linear-gradient(145deg,rgba(8,18,44,0.92),rgba(5,12,30,0.94))] p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-white">{stream.title}</h3>
                      <p className="text-sm text-cyan-100/70">
                        {linkedEvent?.title ?? "No linked event"}
                      </p>
                    </div>
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold uppercase ${badgeClasses(stream.status)}`}>
                      {stream.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs text-cyan-100/75">
                    <div className="rounded-lg border border-cyan-300/15 bg-[#0d1838]/70 p-2.5">
                      <p className="text-cyan-100/55">Access</p>
                      <p className="mt-1 font-semibold text-cyan-100">{stream.access}</p>
                    </div>
                    <div className="rounded-lg border border-cyan-300/15 bg-[#0d1838]/70 p-2.5">
                      <p className="text-cyan-100/55">Playback</p>
                      <p className="mt-1 font-semibold text-cyan-100">
                        {stream.playback_url ? "configured" : "not set"}
                      </p>
                    </div>
                    <div className="col-span-2 rounded-lg border border-cyan-300/15 bg-[#0d1838]/70 p-2.5">
                      <p className="text-cyan-100/55">Schedule</p>
                      <p className="mt-1 font-semibold text-cyan-100">
                        {stream.starts_at ? new Date(stream.starts_at).toLocaleString() : "Start TBD"}
                        {"  "}→{"  "}
                        {stream.ends_at ? new Date(stream.ends_at).toLocaleString() : "End TBD"}
                      </p>
                    </div>
                  </div>

                  <form action={updateLiveStreamDetailsAction} className="grid grid-cols-1 gap-3 rounded-xl border border-cyan-300/15 bg-[#0d1838]/60 p-3">
                    <input type="hidden" name="id" value={stream.id} />
                    <input type="hidden" name="status" value={stream.status} />
                    <label className="text-xs text-cyan-100/75">
                      <span className="mb-1 block">Title</span>
                      <input
                        name="title"
                        required
                        defaultValue={stream.title}
                        className="h-9 w-full rounded-lg border border-cyan-300/20 bg-[#101a34] px-2.5 text-sm outline-none transition focus:border-cyan-300/60"
                      />
                    </label>
                    <label className="text-xs text-cyan-100/75">
                      <span className="mb-1 block">Description</span>
                      <textarea
                        name="description"
                        defaultValue={stream.description ?? ""}
                        className="min-h-16 w-full rounded-lg border border-cyan-300/20 bg-[#101a34] px-2.5 py-2 text-sm outline-none transition focus:border-cyan-300/60"
                      />
                    </label>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <label className="text-xs text-cyan-100/75">
                        <span className="mb-1 block">Playback URL</span>
                        <input
                          name="playback_url"
                          defaultValue={stream.playback_url ?? ""}
                          placeholder="https://..."
                          className="h-9 w-full rounded-lg border border-cyan-300/20 bg-[#101a34] px-2.5 text-sm outline-none transition focus:border-cyan-300/60"
                        />
                      </label>
                      <label className="text-xs text-cyan-100/75">
                        <span className="mb-1 block">Visibility</span>
                        <select
                          name="access"
                          defaultValue={stream.access}
                          className="h-9 w-full rounded-lg border border-cyan-300/20 bg-[#101a34] px-2.5 text-sm outline-none transition focus:border-cyan-300/60"
                        >
                          <option value="public">public</option>
                          <option value="private">private</option>
                        </select>
                      </label>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <label className="text-xs text-cyan-100/75">
                        <span className="mb-1 block">Starts at</span>
                        <input
                          type="datetime-local"
                          name="starts_at"
                          defaultValue={toDateTimeLocalValue(stream.starts_at)}
                          className="h-9 w-full rounded-lg border border-cyan-300/20 bg-[#101a34] px-2.5 text-sm outline-none transition focus:border-cyan-300/60"
                        />
                      </label>
                      <label className="text-xs text-cyan-100/75">
                        <span className="mb-1 block">Ends at</span>
                        <input
                          type="datetime-local"
                          name="ends_at"
                          defaultValue={toDateTimeLocalValue(stream.ends_at)}
                          className="h-9 w-full rounded-lg border border-cyan-300/20 bg-[#101a34] px-2.5 text-sm outline-none transition focus:border-cyan-300/60"
                        />
                      </label>
                    </div>
                    <label className="text-xs text-cyan-100/75">
                      <span className="mb-1 block">Linked event</span>
                      <select
                        name="event_id"
                        defaultValue={stream.event_id ?? ""}
                        className="h-9 w-full rounded-lg border border-cyan-300/20 bg-[#101a34] px-2.5 text-sm outline-none transition focus:border-cyan-300/60"
                      >
                        <option value="">No linked event</option>
                        {events.map((event) => (
                          <option key={event.id} value={event.id}>
                            {event.title}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button className="rounded-lg border border-cyan-300/35 px-3 py-1.5 text-sm font-medium text-cyan-100 hover:bg-cyan-300/10">
                      Save Details
                    </button>
                  </form>

                  <div className="flex flex-wrap items-center gap-2">
                    <form action={updateLiveStreamStatusAction}>
                      <input type="hidden" name="id" value={stream.id} />
                      <input type="hidden" name="status" value="draft" />
                      <button className="rounded-lg border border-cyan-300/30 px-3 py-1.5 text-sm text-cyan-100/90 hover:bg-cyan-300/10">
                        Draft
                      </button>
                    </form>
                    <form action={updateLiveStreamStatusAction}>
                      <input type="hidden" name="id" value={stream.id} />
                      <input type="hidden" name="status" value="live" />
                      <button className="rounded-lg border border-emerald-300/40 px-3 py-1.5 text-sm text-emerald-200 hover:bg-emerald-400/10">
                        Go Live
                      </button>
                    </form>
                    <form action={updateLiveStreamStatusAction}>
                      <input type="hidden" name="id" value={stream.id} />
                      <input type="hidden" name="status" value="ended" />
                      <button className="rounded-lg border border-amber-300/40 px-3 py-1.5 text-sm text-amber-200 hover:bg-amber-300/10">
                        End
                      </button>
                    </form>
                    <form action={deleteLiveStreamAction}>
                      <input type="hidden" name="id" value={stream.id} />
                      <button className="rounded-lg border border-red-400/40 px-3 py-1.5 text-sm text-red-300 hover:bg-red-400/10">
                        Delete
                      </button>
                    </form>
                    {stream.playback_url ? (
                      <Link
                        href={stream.playback_url}
                        target="_blank"
                        className="rounded-lg border border-cyan-300/30 px-3 py-1.5 text-sm text-cyan-100/90 hover:bg-cyan-300/10"
                      >
                        Open Playback
                      </Link>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
