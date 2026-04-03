import { AdminSportsTournamentsDashboard } from "@/components/admin/AdminSportsTournamentsDashboard";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminSportsTournamentsPage() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const [{ data: sports }, { data: teams }, { data: tournaments }, { data: assignments }, { data: events }] =
    await Promise.all([
      supabase.from("sports").select("id, name").order("name", { ascending: true }),
      supabase.from("teams").select("id, name, sport_id").order("name", { ascending: true }),
      supabase
        .from("tournaments")
        .select("id, name, sport_id, event_id, format, status, starts_at, notes, sports(name), events(title)")
        .order("created_at", { ascending: false }),
      supabase
        .from("tournament_teams")
        .select("id, tournament_id, team_id, seed, group_label, tournaments(name), teams(name)")
        .order("assigned_at", { ascending: false }),
      supabase.from("events").select("id, title").order("starts_at", { ascending: true }),
    ]);

  const assignmentCountMap = new Map<string, number>();
  for (const assignment of assignments ?? []) {
    assignmentCountMap.set(
      assignment.tournament_id,
      (assignmentCountMap.get(assignment.tournament_id) ?? 0) + 1
    );
  }

  const normalizedTournaments = (tournaments ?? []).map((tournament) => {
    const sport = Array.isArray(tournament.sports) ? tournament.sports[0] : tournament.sports;
    const event = Array.isArray(tournament.events) ? tournament.events[0] : tournament.events;
    return {
      id: tournament.id,
      name: tournament.name,
      sport_id: tournament.sport_id,
      sport_name: sport?.name ?? "-",
      event_id: tournament.event_id,
      event_title: event?.title ?? "-",
      format: tournament.format,
      status: tournament.status,
      starts_at: tournament.starts_at,
      notes: tournament.notes,
      assignments_count: assignmentCountMap.get(tournament.id) ?? 0,
    };
  });

  const normalizedAssignments = (assignments ?? []).map((assignment) => {
    const tournament = Array.isArray(assignment.tournaments) ? assignment.tournaments[0] : assignment.tournaments;
    const team = Array.isArray(assignment.teams) ? assignment.teams[0] : assignment.teams;
    return {
      id: assignment.id,
      tournament_id: assignment.tournament_id,
      tournament_name: tournament?.name ?? "-",
      team_id: assignment.team_id,
      team_name: team?.name ?? "-",
      seed: assignment.seed,
      group_label: assignment.group_label,
    };
  });

  return (
    <AdminSportsTournamentsDashboard
      sports={sports ?? []}
      teams={teams ?? []}
      tournaments={normalizedTournaments}
      assignments={normalizedAssignments}
      events={events ?? []}
    />
  );
}
