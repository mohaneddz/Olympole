import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EventFormDialog } from "@/components/admin/EventFormDialog";
import {
  deleteEventAction,
  updateEventIconAction,
} from "@/app/actions/events";
import {
  getEventIconComponent,
  getNextEventIconKey,
} from "@/lib/event-icons";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CalendarPlus2, Medal, Pencil, Trophy } from "lucide-react";

function getStatusTone(status: string) {
  if (status === "live") {
    return "border-emerald-300/35 bg-emerald-400/10 text-emerald-100";
  }
  if (status === "completed") {
    return "border-cyan-300/35 bg-cyan-400/10 text-cyan-100";
  }
  if (status === "scheduled") {
    return "border-sky-300/35 bg-sky-400/10 text-sky-100";
  }
  return "border-white/15 bg-white/5 text-white/80";
}

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function AdminEventsPage(props: Props) {
  const searchParams = await props.searchParams;
  const showCompleted = searchParams.showCompleted === "true";

  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const [{ data: events }, { data: sports }] =
    await Promise.all([
      supabase.from("events").select("*").order("starts_at", { ascending: true }),
      supabase.from("sports").select("id,name").order("name", { ascending: true }),
    ]);

  const totalEvents = events?.length ?? 0;
  const liveEvents = (events ?? []).filter((event) => event.status === "live").length;

  return (
    <div className="space-y-10">
      <AdminPageHeader
        icon={<Trophy className="h-3.5 w-3.5" />}
        title="Event Management"
        description="Manage events, scheduling details, and visibility."
        actions={
          <>
            <Link href="/admin/events/create-result" className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/40 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-100">
              <Medal className="h-4 w-4" />
              Create Result
            </Link>
          </>
        }
        stats={[
          { label: "Events", value: totalEvents },
          { label: "Live Events", value: liveEvents, tone: "success" },
        ]}
      />

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold">Events</h2>
            <Link
              href={showCompleted ? "/admin/events" : "?showCompleted=true"}
              className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm transition hover:bg-white/10"
            >
              {showCompleted ? "Hide Completed" : "Show Completed"}
            </Link>
          </div>
          <EventFormDialog
            mode="create"
            sports={sports ?? []}
            trigger={
              <>
                <CalendarPlus2 className="h-4 w-4" />
                Add New Event
              </>
            }
          />
        </div>
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {(events ?? [])
            .filter((event) => showCompleted || event.status !== "completed")
            .map((event) => {
              const EventIcon = getEventIconComponent(event.icon_key);
              const nextIconKey = getNextEventIconKey(event.icon_key);
              const isCompleted = event.status === "completed";

              return (
                <div
                  key={event.id}
                  className={`rounded-2xl border border-cyan-200/15 bg-[linear-gradient(160deg,rgba(12,27,66,0.88),rgba(7,15,40,0.9))] p-4 shadow-[0_10px_28px_rgba(2,10,28,0.45)] transition-opacity ${
                    isCompleted ? "opacity-50 grayscale hover:opacity-100 hover:grayscale-0" : ""
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <form action={updateEventIconAction}>
                    <input type="hidden" name="id" value={event.id} />
                    <input type="hidden" name="icon_key" value={nextIconKey} />
                    <button
                      title="Click to change icon"
                      className="group mt-0.5 flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-cyan-300/30 bg-cyan-400/10 text-cyan-100 transition hover:-translate-y-0.5 hover:border-cyan-200/60 hover:bg-cyan-400/20"
                    >
                      <EventIcon className="h-5 w-5 transition group-hover:scale-110" />
                    </button>
                  </form>
                  <div>
                    <p className="font-semibold text-white">{event.title}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className={`rounded-md border px-2 py-1 ${getStatusTone(event.status)}`}>{event.status}</span>
                      <span className="rounded-md border border-white/15 bg-white/5 px-2 py-1 text-white/75">{event.venue}</span>
                      <span className="rounded-md border border-white/15 bg-white/5 px-2 py-1 text-white/75">
                        visibility: {event.visibility}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <EventFormDialog
                    mode="edit"
                    sports={sports ?? []}
                    event={event}
                    trigger={
                      <>
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </>
                    }
                  />
                  <form action={deleteEventAction}>
                    <input type="hidden" name="id" value={event.id} />
                    <button className="rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-1.5 text-sm text-red-200 transition hover:bg-red-500/20">
                      Delete
                    </button>
                  </form>
                </div>
              </div>
              <p className="mt-3 text-xs text-cyan-100/65">Tip: click the icon to switch to the next icon in the library.</p>
            </div>
          );
          })}
        </div>
      </section>

    </div>
  );
}
