import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminScheduleDashboard } from "@/components/admin/AdminScheduleDashboard";
import { EventFormDialog } from "@/components/admin/EventFormDialog";
import { requireAdmin } from "@/lib/auth";
import { getAdminActivities, getAllAdminEvents } from "@/lib/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CalendarClock, CalendarPlus2 } from "lucide-react";

function getEventCategory(
  event: Awaited<ReturnType<typeof getAllAdminEvents>>[number]
): "collective_sport" | "individual_sport" | "culture" {
  const activity = Array.isArray(event.activities) ? event.activities[0] : event.activities;
  if (activity?.category === "collective_sport" || activity?.category === "individual_sport" || activity?.category === "culture") {
    return activity.category;
  }
  return event.type === "culture" ? "culture" : "collective_sport";
}

export default async function AdminSchedulePage() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const [events, sports, activities] = await Promise.all([
    getAllAdminEvents(),
    supabase.from("sports").select("id, name").order("name", { ascending: true }),
    getAdminActivities(),
  ]);

  const nowTime = new Date().getTime();
  const collectiveCount = events.filter((event) => getEventCategory(event) === "collective_sport").length;
  const individualCount = events.filter((event) => getEventCategory(event) === "individual_sport").length;
  const cultureCount = events.filter((event) => getEventCategory(event) === "culture").length;
  const shownUpcomingCount = events.filter(
    (event) => event.show_in_schedule && new Date(event.starts_at).getTime() >= nowTime
  ).length;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        icon={<CalendarClock className="h-3.5 w-3.5" />}
        title="Schedule Management"
        description="Control which upcoming events appear on the public schedule and manage them by category."
        actions={
          <EventFormDialog
            mode="create"
            sports={sports.data ?? []}
            activities={activities}
            trigger={
              <>
                <CalendarPlus2 className="h-4 w-4" />
                Create New Event
              </>
            }
          />
        }
        stats={[
          { label: "Collective Events", value: collectiveCount },
          { label: "Individual Events", value: individualCount },
          { label: "Culture Events", value: cultureCount },
          { label: "Shown Upcoming", value: shownUpcomingCount, tone: "success" },
        ]}
      />

      <AdminScheduleDashboard
        events={events as never[]}
        sports={sports.data ?? []}
        activities={activities as never[]}
      />
    </div>
  );
}

