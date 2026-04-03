import { AdminSportsMembershipsDashboard } from "@/components/admin/AdminSportsMembershipsDashboard";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminSportsMembershipsPage() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const [{ data: teams }, { data: profiles }, { data: memberships }] = await Promise.all([
    supabase
      .from("teams")
      .select("id, name, sport_id, sports(name)")
      .order("name", { ascending: true }),
    supabase
      .from("profiles")
      .select("id, full_name, email")
      .order("created_at", { ascending: false })
      .limit(400),
    supabase
      .from("team_memberships")
      .select("id, team_id, profile_id, role, created_at, teams(name), profiles(full_name,email)")
      .order("created_at", { ascending: false })
      .limit(1000),
  ]);

  const normalizedTeams = (teams ?? []).map((team) => {
    const sport = Array.isArray(team.sports) ? team.sports[0] : team.sports;
    return {
      id: team.id,
      name: team.name,
      sport_name: sport?.name ?? "Unknown",
    };
  });

  const normalizedProfiles = (profiles ?? []).map((profile) => ({
    id: profile.id,
    label: `${profile.full_name ?? "Unknown"} (${profile.email})`,
  }));

  const normalizedMemberships = (memberships ?? []).map((membership) => {
    const team = Array.isArray(membership.teams) ? membership.teams[0] : membership.teams;
    const profile = Array.isArray(membership.profiles) ? membership.profiles[0] : membership.profiles;
    return {
      id: membership.id,
      team_id: membership.team_id,
      team_name: team?.name ?? "-",
      profile_id: membership.profile_id,
      profile_name: profile?.full_name || profile?.email || "Unknown",
      role: membership.role,
      created_at: membership.created_at,
    };
  });

  return (
    <AdminSportsMembershipsDashboard
      teams={normalizedTeams}
      profiles={normalizedProfiles}
      memberships={normalizedMemberships}
    />
  );
}
