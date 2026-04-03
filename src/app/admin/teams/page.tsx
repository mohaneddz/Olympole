import { AdminTeamsDashboard } from "@/components/admin/AdminTeamsDashboard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PlusCircle, UsersRound } from "lucide-react";
import Link from "next/link";

export default async function AdminTeamsPage() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const [{ data: sports }, { data: teams }] = await Promise.all([
    supabase.from("sports").select("id,name").order("name", { ascending: true }),
    supabase
      .from("teams")
      .select("id, name, sport_id, short_code, city, coach_name, is_active, created_at, sports(name)")
      .order("name", { ascending: true }),
  ]);

  const normalizedTeams = (teams ?? []).map((team) => {
    const sport = Array.isArray(team.sports) ? team.sports[0] : team.sports;
    return {
      id: team.id,
      name: team.name,
      sport_id: team.sport_id,
      sport_name: sport?.name ?? "Unknown",
      short_code: team.short_code,
      city: team.city,
      coach_name: team.coach_name,
      is_active: team.is_active,
      created_at: team.created_at,
    };
  });

  return (
    <div className="space-y-8">
      <AdminPageHeader
        icon={<UsersRound className="h-3.5 w-3.5" />}
        title="Teams"
        description="Manage teams and their sport associations."
        actions={
          <Link href="/admin/teams/new" className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/40 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-100">
            <PlusCircle className="h-4 w-4" />
            New Team
          </Link>
        }
        stats={[
          { label: "Teams", value: normalizedTeams.length },
          { label: "Sports", value: sports?.length ?? 0 },
        ]}
      />
      <AdminTeamsDashboard sports={sports ?? []} teams={normalizedTeams} />
    </div>
  );
}
