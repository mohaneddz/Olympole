"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { tournamentAssignmentSchema, tournamentSchema } from "@/lib/validators";
import {
  buildGroupLabel,
  logAdminAction,
  revalidateMany,
  shuffle,
  toOptionalIso,
  toOptionalNumberOrNull,
} from "@/server/_shared";

export async function createTournamentAction(formData: FormData): Promise<void> {
  const adminUser = await requireAdmin();
  const parsed = tournamentSchema.safeParse({
    name: formData.get("name"),
    sport_id: formData.get("sport_id"),
    event_id: formData.get("event_id"),
    format: formData.get("format"),
    status: formData.get("status"),
    starts_at: formData.get("starts_at"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tournaments")
    .insert({
      name: parsed.data.name,
      sport_id: parsed.data.sport_id || null,
      event_id: parsed.data.event_id || null,
      format: parsed.data.format,
      status: parsed.data.status,
      starts_at: parsed.data.starts_at ? toOptionalIso(parsed.data.starts_at) : null,
      notes: parsed.data.notes || null,
      created_by: adminUser.id,
    })
    .select("id")
    .single();

  if (error) {
    return;
  }

  await logAdminAction("tournament_create", "tournament", data?.id ?? null);
  revalidateMany(["/admin/schedule"]);
}

export async function deleteTournamentAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("tournament_id") ?? "");
  if (!id) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("tournaments").delete().eq("id", id);
  if (error) {
    return;
  }

  await logAdminAction("tournament_delete", "tournament", id);
  revalidateMany(["/admin/schedule"]);
}

export async function assignTeamToTournamentAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const parsed = tournamentAssignmentSchema.safeParse({
    tournament_id: formData.get("tournament_id"),
    team_id: formData.get("team_id"),
  });

  if (!parsed.success || !parsed.data.team_id) {
    return;
  }

  const seed = toOptionalNumberOrNull(formData.get("seed"));
  const groupLabel = String(formData.get("group_label") ?? "").trim() || null;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("tournament_teams").upsert(
    {
      tournament_id: parsed.data.tournament_id,
      team_id: parsed.data.team_id,
      seed,
      group_label: groupLabel,
    },
    { onConflict: "tournament_id,team_id" }
  );

  if (error) {
    return;
  }

  await logAdminAction("tournament_assign_team", "tournament", parsed.data.tournament_id, {
    team_id: parsed.data.team_id,
    seed,
    group_label: groupLabel,
  });
  revalidateMany(["/admin/schedule"]);
}

export async function removeTournamentTeamAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const assignmentId = String(formData.get("assignment_id") ?? "");
  if (!assignmentId) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("tournament_teams").delete().eq("id", assignmentId);
  if (error) {
    return;
  }

  await logAdminAction("tournament_assignment_remove", "tournament_team", assignmentId);
  revalidateMany(["/admin/schedule"]);
}

export async function clearTournamentDistributionAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const tournamentId = String(formData.get("tournament_id") ?? "");
  if (!tournamentId) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  await supabase.from("tournament_teams").delete().eq("tournament_id", tournamentId);
  await logAdminAction("tournament_clear_distribution", "tournament", tournamentId);
  revalidateMany(["/admin/schedule"]);
}

export async function randomDistributeTournamentTeamsAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const tournamentId = String(formData.get("tournament_id") ?? "");
  if (!tournamentId) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { data: tournament } = await supabase
    .from("tournaments")
    .select("id, sport_id, format")
    .eq("id", tournamentId)
    .single();

  if (!tournament?.sport_id) {
    return;
  }

  const { data: teams } = await supabase
    .from("teams")
    .select("id")
    .eq("sport_id", tournament.sport_id)
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (!teams?.length) {
    return;
  }

  const randomized = shuffle(teams);
  await supabase.from("tournament_teams").delete().eq("tournament_id", tournamentId);

  const rows = randomized.map((team, index) => ({
    tournament_id: tournamentId,
    team_id: team.id,
    seed: index + 1,
    group_label: tournament.format === "group" ? buildGroupLabel(index, randomized.length) : null,
  }));

  await supabase.from("tournament_teams").insert(rows);
  await logAdminAction("tournament_random_distribution", "tournament", tournamentId, {
    assigned_teams: rows.length,
  });
  revalidateMany(["/admin/schedule"]);
}