import {
  createLiveStreamAction,
  deleteLiveStreamAction,
  updateLiveStreamStatusAction,
} from "@/app/actions/events";
import { CameraPreview } from "@/components/live/CameraPreview";
import { requireAdmin } from "@/lib/auth";
import { getAllAdminEvents, getPublicLiveStreams } from "@/lib/queries";

export default async function AdminLivePage() {
  await requireAdmin();
  const [events, streams] = await Promise.all([getAllAdminEvents(), getPublicLiveStreams()]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Live Streaming Control</h1>
        <p className="text-foreground/60">
          Manage stream metadata, publish links, and control stream lifecycle.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <form action={createLiveStreamAction} className="rounded-xl border border-card-border p-4 space-y-3 xl:col-span-2">
          <h2 className="font-semibold">Create Stream</h2>
          <input
            name="title"
            required
            placeholder="Stream title"
            className="w-full h-10 px-3 rounded bg-background border border-card-border"
          />
          <textarea
            name="description"
            placeholder="Description (optional)"
            className="w-full min-h-20 px-3 py-2 rounded bg-background border border-card-border"
          />
          <select name="event_id" className="w-full h-10 px-3 rounded bg-background border border-card-border">
            <option value="">No linked event</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
          <input
            name="playback_url"
            placeholder="Playback URL (YouTube embed / HLS / MP4)"
            className="w-full h-10 px-3 rounded bg-background border border-card-border"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select name="status" defaultValue="draft" className="h-10 px-3 rounded bg-background border border-card-border">
              <option value="draft">draft</option>
              <option value="live">live</option>
              <option value="ended">ended</option>
            </select>
            <select name="access" defaultValue="public" className="h-10 px-3 rounded bg-background border border-card-border">
              <option value="public">public</option>
              <option value="private">private</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="datetime-local"
              name="starts_at"
              className="h-10 px-3 rounded bg-background border border-card-border"
            />
            <input
              type="datetime-local"
              name="ends_at"
              className="h-10 px-3 rounded bg-background border border-card-border"
            />
          </div>
          <button className="px-4 py-2 rounded border border-primary/50">Save Stream</button>
        </form>

        <CameraPreview />
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Existing Streams</h2>
        {streams.length === 0 ? (
          <div className="rounded-xl border border-card-border p-4 text-foreground/70">
            No streams yet.
          </div>
        ) : (
          streams.map((stream) => (
            <div key={stream.id} className="rounded-xl border border-card-border p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="font-medium">{stream.title}</p>
                <p className="text-sm text-foreground/60">
                  {stream.status} • {stream.access} • {stream.playback_url ? "Playback URL set" : "No playback URL"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <form action={updateLiveStreamStatusAction}>
                  <input type="hidden" name="id" value={stream.id} />
                  <input type="hidden" name="status" value="draft" />
                  <button className="px-3 py-1 rounded border border-card-border text-sm">Draft</button>
                </form>
                <form action={updateLiveStreamStatusAction}>
                  <input type="hidden" name="id" value={stream.id} />
                  <input type="hidden" name="status" value="live" />
                  <button className="px-3 py-1 rounded border border-green-500/50 text-sm text-green-300">Go Live</button>
                </form>
                <form action={updateLiveStreamStatusAction}>
                  <input type="hidden" name="id" value={stream.id} />
                  <input type="hidden" name="status" value="ended" />
                  <button className="px-3 py-1 rounded border border-yellow-500/50 text-sm text-yellow-200">End</button>
                </form>
                <form action={deleteLiveStreamAction}>
                  <input type="hidden" name="id" value={stream.id} />
                  <button className="px-3 py-1 rounded border border-red-500/50 text-sm text-red-300">Delete</button>
                </form>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
