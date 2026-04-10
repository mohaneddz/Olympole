import { AdminCategoryRegistrationsDashboard } from "@/components/admin/AdminCategoryRegistrationsDashboard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getActivitiesByCategory } from "@/lib/activity-registry";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Palette } from "lucide-react";

export default async function AdminCultureRegistrationsPage() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const [registrationsRes, teamsRes] = await Promise.all([
    supabase
      .from("v_admin_activity_registrations_culture")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(2000),
    supabase.from("teams").select("id, name, sports(name)").order("name", { ascending: true }),
  ]);

  const teams = (teamsRes.data ?? []).map((team) => {
    const sport = Array.isArray(team.sports) ? team.sports[0] : team.sports;
    return { id: team.id, name: team.name, sport_name: sport?.name ?? "Unknown" };
  });

  const rows = (registrationsRes.data ?? []) as never[];
  const tabs = getActivitiesByCategory("culture").map((activity) => ({
    slug: activity.slug,
    title: activity.title,
  }));

  const pendingCount = (registrationsRes.data ?? []).filter((row) => row.status === "pending").length;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        icon={<Palette className="h-3.5 w-3.5" />}
        title="Culture Events Registrations"
        description="Review and manage culture event registrations by activity tabs."
        stats={[
          { label: "Total", value: registrationsRes.data?.length ?? 0 },
          { label: "Pending", value: pendingCount, tone: "warning" },
        ]}
      />
      <AdminCategoryRegistrationsDashboard
        title="Culture Events"
        rows={rows}
        activityTabs={tabs}
        teams={teams}
      />
    </div>
  );
}
