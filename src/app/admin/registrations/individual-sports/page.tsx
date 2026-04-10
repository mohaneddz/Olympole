import { AdminCategoryRegistrationsDashboard } from "@/components/admin/AdminCategoryRegistrationsDashboard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getActivitiesByCategory } from "@/lib/activity-registry";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Dumbbell } from "lucide-react";

export default async function AdminIndividualRegistrationsPage() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const [registrationsRes, teamsRes] = await Promise.all([
    supabase
      .from("v_admin_activity_registrations_individual")
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
  const tabs = getActivitiesByCategory("individual_sport").map((activity) => ({
    slug: activity.slug,
    title: activity.title,
  }));

  const approvedCount = (registrationsRes.data ?? []).filter((row) => row.status === "approved").length;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        icon={<Dumbbell className="h-3.5 w-3.5" />}
        title="Individual Sports Registrations"
        description="Review and manage individual sport registrations by activity tabs."
        stats={[
          { label: "Total", value: registrationsRes.data?.length ?? 0 },
          { label: "Approved", value: approvedCount, tone: "success" },
        ]}
      />
      <AdminCategoryRegistrationsDashboard
        title="Individual Sports"
        rows={rows}
        activityTabs={tabs}
        teams={teams}
      />
    </div>
  );
}
