import { createLiveStreamAction } from "@/app/actions/events";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CameraPreview } from "@/components/live/CameraPreview";
import { requireAdmin } from "@/lib/auth";
import { getAllAdminEvents } from "@/lib/queries";
import { PlusCircle, Radio } from "lucide-react";

export default async function AdminNewLiveStreamPage() {
  await requireAdmin();
  const events = await getAllAdminEvents();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        icon={<Radio className="h-3.5 w-3.5" />}
        title="New Stream"
        description="Create a new stream and configure schedule/playback."
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <form
          action={createLiveStreamAction}
          className="space-y-4 rounded-2xl border border-cyan-300/20 bg-[linear-gradient(145deg,rgba(5,12,30,0.96),rgba(7,16,42,0.94))] p-5 md:p-6 xl:col-span-8"
        >
          <div className="grid grid-cols-1 gap-4">
            <label className="space-y-1 text-sm text-cyan-100/75">
              <span>Stream title</span>
              <input
                name="title"
                required
                placeholder="Football Finals - Main Feed"
                className="h-11 w-full rounded-xl border border-cyan-300/20 bg-[#101a34] px-3 outline-none transition focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/25"
              />
            </label>

            <label className="space-y-1 text-sm text-cyan-100/75">
              <span>Description</span>
              <textarea
                name="description"
                placeholder="Broadcast details, commentators, notes..."
                className="min-h-24 w-full rounded-xl border border-cyan-300/20 bg-[#101a34] px-3 py-2 outline-none transition focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/25"
              />
            </label>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="space-y-1 text-sm text-cyan-100/75">
                <span>Linked event</span>
                <select
                  name="event_id"
                  className="h-11 w-full rounded-xl border border-cyan-300/20 bg-[#101a34] px-3 outline-none transition focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/25"
                >
                  <option value="">No linked event</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-sm text-cyan-100/75">
                <span>Playback URL</span>
                <input
                  name="playback_url"
                  placeholder="https://..."
                  className="h-11 w-full rounded-xl border border-cyan-300/20 bg-[#101a34] px-3 outline-none transition focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/25"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="space-y-1 text-sm text-cyan-100/75">
                <span>Stream state</span>
                <select
                  name="status"
                  defaultValue="draft"
                  className="h-11 w-full rounded-xl border border-cyan-300/20 bg-[#101a34] px-3 outline-none transition focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/25"
                >
                  <option value="draft">draft</option>
                  <option value="live">live</option>
                  <option value="ended">ended</option>
                </select>
              </label>

              <label className="space-y-1 text-sm text-cyan-100/75">
                <span>Visibility</span>
                <select
                  name="access"
                  defaultValue="public"
                  className="h-11 w-full rounded-xl border border-cyan-300/20 bg-[#101a34] px-3 outline-none transition focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/25"
                >
                  <option value="public">public</option>
                  <option value="private">private</option>
                </select>
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="space-y-1 text-sm text-cyan-100/75">
                <span>Starts at</span>
                <input
                  type="datetime-local"
                  name="starts_at"
                  className="h-11 w-full rounded-xl border border-cyan-300/20 bg-[#101a34] px-3 outline-none transition focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/25"
                />
              </label>
              <label className="space-y-1 text-sm text-cyan-100/75">
                <span>Ends at</span>
                <input
                  type="datetime-local"
                  name="ends_at"
                  className="h-11 w-full rounded-xl border border-cyan-300/20 bg-[#101a34] px-3 outline-none transition focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/25"
                />
              </label>
            </div>
          </div>

          <button className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/50 bg-cyan-400/10 px-4 py-2 font-semibold text-cyan-100 transition hover:bg-cyan-300 hover:text-[#05203e]">
            <PlusCircle className="h-4 w-4" />
            Save Stream
          </button>
        </form>

        <div className="xl:col-span-4">
          <CameraPreview />
        </div>
      </div>
    </div>
  );
}
