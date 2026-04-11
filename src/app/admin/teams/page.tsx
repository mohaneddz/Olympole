import { Shield } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTeamsManagementDashboard, CreateTeamButton } from "@/components/admin/AdminTeamsManagementDashboard";
import { ACTIVITY_COLUMNS } from "@/data/activities";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminTeamsPage() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const allowedSportSlugs = new Set(["football", "basketball", "volleyball", "handball", "knowledge-cup"]);
  const allowedSportsFromActivities = ACTIVITY_COLUMNS.flatMap((column) =>
    column.items
      .map((item) => {
        const slug = item.href.split("/").filter(Boolean).pop() ?? "";
        if (!allowedSportSlugs.has(slug)) {
          return null;
        }
        return {
          slug,
          name: item.name,
          sport_type: column.title === "Cultural Events" ? "culture" : "collective",
        } as const;
      })
      .filter((item): item is { slug: string; name: string; sport_type: "collective" | "culture" } => item !== null)
  );

  const uniqueAllowedSports = Array.from(
    new Map(allowedSportsFromActivities.map((sport) => [sport.slug, sport])).values()
  );

  if (uniqueAllowedSports.length > 0) {
    await supabase.from("sports").upsert(
      uniqueAllowedSports.map((sport) => ({
        slug: sport.slug,
        name: sport.name,
        sport_type: sport.sport_type,
        is_team_based: true,
      })),
      { onConflict: "slug" }
    );
  }

  const [sportsRes, profilesRes, membershipsRes] = await Promise.all([
    supabase
      .from("sports")
      .select("id, name, slug, sport_type")
      .in("slug", Array.from(allowedSportSlugs))
      .order("name", { ascending: true }),
    supabase
      .from("profiles")
      .select("id, full_name, email")
      .order("full_name", { ascending: true })
      .limit(3000),
    supabase
      .from("team_memberships")
      .select("id, team_id, profile_id, role, created_at, teams(name), profiles(full_name, email)")
      .order("created_at", { ascending: false })
      .limit(4000),
  ]);

  const teamSelectWithCategory = await supabase
    .from("teams")
    .select("id, name, category, sport_id, sports(name, slug, sport_type)")
    .in("sport_id", (sportsRes.data ?? []).map((sport) => sport.id))
    .order("name", { ascending: true });

  const teamsRes =
    teamSelectWithCategory.error && teamSelectWithCategory.error.message.toLowerCase().includes("category")
      ? await supabase
          .from("teams")
          .select("id, name, sport_id, sports(name, slug, sport_type)")
          .in("sport_id", (sportsRes.data ?? []).map((sport) => sport.id))
          .order("name", { ascending: true })
      : teamSelectWithCategory;

  const membershipsByTeamId = new Map<string, number>();
  for (const membership of membershipsRes.data ?? []) {
    const current = membershipsByTeamId.get(membership.team_id) ?? 0;
    membershipsByTeamId.set(membership.team_id, current + 1);
  }

  const teams = (teamsRes.data ?? []).map((team) => {
    const sport = Array.isArray(team.sports) ? team.sports[0] : team.sports;
    const rawCategory = "category" in team ? team.category : null;
    const category = (
      rawCategory === "collective" ||
      rawCategory === "individual" ||
      rawCategory === "culture"
        ? rawCategory
        : sport?.sport_type === "culture"
          ? "culture"
          : "collective"
    ) as "collective" | "individual" | "culture";
    return {
      id: team.id,
      name: team.name,
      category,
      sport_id: team.sport_id,
      sport_name: sport?.name ?? "Unknown",
      members_count: membershipsByTeamId.get(team.id) ?? 0,
    };
  });

  const memberships = (membershipsRes.data ?? []).map((membership) => {
    const team = Array.isArray(membership.teams) ? membership.teams[0] : membership.teams;
    const profile = Array.isArray(membership.profiles) ? membership.profiles[0] : membership.profiles;
    return {
      id: membership.id,
      team_id: membership.team_id,
      team_name: team?.name ?? "Unknown Team",
      profile_id: membership.profile_id,
      profile_name: profile?.full_name || profile?.email || "Unknown User",
      role: membership.role,
      created_at: membership.created_at,
    };
  });

  const profiles = (profilesRes.data ?? []).map((profile) => ({
    id: profile.id,
    label: profile.full_name ? `${profile.full_name} (${profile.email})` : profile.email,
  }));

  return (
    <div className="space-y-8">
      <AdminPageHeader
        icon={<Shield className="h-3.5 w-3.5" />}
        title="Team Management"
        description="Create teams, assign members, and maintain team rosters from one place."
        stats={[
          { label: "Teams", value: teams.length },
          { label: "Memberships", value: memberships.length },
          { label: "Sports", value: uniqueAllowedSports.length },
        ]}
      />
      <AdminTeamsManagementDashboard
        sports={sportsRes.data ?? []}
        teams={teams}
        profiles={profiles}
        memberships={memberships}
      />
    </div>
  );
}
