import { AdminLiveStreamsDashboard } from "@/components/admin/AdminLiveStreamsDashboard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CreateLiveStreamDialog } from "@/components/admin/CreateLiveStreamDialog";
import { requireAdmin } from "@/lib/auth";
import { getAdminLiveStreams, getAllAdminEvents } from "@/lib/queries";
import { Radio } from "lucide-react";

export default async function AdminLiveStreamsPage() {
  await requireAdmin();
  const [streams, events] = await Promise.all([getAdminLiveStreams(), getAllAdminEvents()]);

  const normalizedStreams = streams.map((stream) => {
    const event = Array.isArray(stream.events) ? stream.events[0] : stream.events;
    return {
      id: stream.id,
      title: stream.title,
      description: stream.description,
      status: stream.status,
      access: stream.access,
      playback_url: stream.playback_url,
      starts_at: stream.starts_at,
      ends_at: stream.ends_at,
      event_id: stream.event_id,
      event_title: event?.title ?? null,
    };
  });

  return (
    <div className="space-y-8">
      <AdminPageHeader
        icon={<Radio className="h-3.5 w-3.5" />}
        title="Live Streams"
        description="Manage stream rows from one table and keep publishing controls simple."
        actions={
          <CreateLiveStreamDialog 
            events={events.map((event) => ({ id: event.id, title: event.title }))} 
          />
        }
        stats={[
          { label: "Total", value: normalizedStreams.length },
          { label: "Live", value: normalizedStreams.filter((row) => row.status === "live").length, tone: "success" },
          { label: "Draft", value: normalizedStreams.filter((row) => row.status === "draft").length },
          { label: "Ended", value: normalizedStreams.filter((row) => row.status === "ended").length, tone: "warning" },
        ]}
      />

      <AdminLiveStreamsDashboard
        streams={normalizedStreams as never[]}
        events={events.map((event) => ({ id: event.id, title: event.title }))}
      />
    </div>
  );
}

