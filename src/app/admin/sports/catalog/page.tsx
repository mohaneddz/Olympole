import { AdminSportsCatalogDashboard } from "@/components/admin/AdminSportsCatalogDashboard";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminSportsCatalogPage() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const [{ data: sports }, { data: teams }] = await Promise.all([
    supabase
      .from("sports")
      .select("id, name, slug, sport_type, is_team_based, gender_division, is_active, created_at")
      .order("name", { ascending: true }),
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

  return <AdminSportsCatalogDashboard sports={sports ?? []} teams={normalizedTeams} />;
}
