"use server";

import { failure, success, type ActionResponse } from "@/lib/actions";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { matchSchema } from "@/lib/validators";
import { logAdminAction, revalidateMany, toBoolean, toIsoString, toOptionalNumber } from "@/server/_shared";

export async function createMatchAction(_: ActionResponse, formData: FormData): Promise<ActionResponse> {
  await requireAdmin();

  const parsed = matchSchema.safeParse({
    event_id: formData.get("event_id"),
    sport: formData.get("sport"),
    team_a: formData.get("team_a"),
    team_b: formData.get("team_b"),
    score_a: formData.get("score_a"),
    score_b: formData.get("score_b"),
    status: formData.get("status"),
    round: formData.get("round"),
    venue: formData.get("venue"),
    starts_at: formData.get("starts_at"),
    team_a_id: formData.get("team_a_id"),
    team_b_id: formData.get("team_b_id"),
    event_phase: formData.get("event_phase"),
    mvp_player: formData.get("mvp_player"),
    live_minute: toOptionalNumber(formData.get("live_minute")),
    is_prediction_locked: toBoolean(formData.get("is_prediction_locked"), false),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Failed to create match.");
  }

  const winningTeamId =
    parsed.data.status === "completed"
      ? parsed.data.score_a > parsed.data.score_b
        ? parsed.data.team_a_id || null
        : parsed.data.score_b > parsed.data.score_a
          ? parsed.data.team_b_id || null
          : null
      : null;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("matches")
    .insert({
      event_id: parsed.data.event_id,
      sport: parsed.data.sport,
      team_a: parsed.data.team_a,
      team_b: parsed.data.team_b,
      score_a: parsed.data.score_a,
      score_b: parsed.data.score_b,
      status: parsed.data.status,
      round: parsed.data.round,
      venue: parsed.data.venue,
      starts_at: toIsoString(parsed.data.starts_at),
      team_a_id: parsed.data.team_a_id || null,
      team_b_id: parsed.data.team_b_id || null,
      event_phase: parsed.data.event_phase || "group",
      mvp_player: parsed.data.mvp_player || null,
      live_minute: parsed.data.live_minute ?? null,
      is_prediction_locked: parsed.data.is_prediction_locked ?? false,
      notes: parsed.data.notes || null,
      winning_team_id: winningTeamId,
    })
    .select("id")
    .single();

  if (error) {
    return failure(error.message);
  }

  await logAdminAction("match_create", "match", data?.id ?? null);
  revalidateMany(["/admin/events", "/match-center", "/predictions", "/predictions/match"]);
  return success("Match created.");
}

export async function updateMatchAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) {
    return;
  }

  const payload = matchSchema.safeParse({
    event_id: formData.get("event_id"),
    sport: formData.get("sport"),
    team_a: formData.get("team_a"),
    team_b: formData.get("team_b"),
    score_a: formData.get("score_a"),
    score_b: formData.get("score_b"),
    status: formData.get("status"),
    round: formData.get("round"),
    venue: formData.get("venue"),
    starts_at: formData.get("starts_at"),
    team_a_id: formData.get("team_a_id"),
    team_b_id: formData.get("team_b_id"),
    event_phase: formData.get("event_phase"),
    mvp_player: formData.get("mvp_player"),
    live_minute: toOptionalNumber(formData.get("live_minute")),
    is_prediction_locked: toBoolean(formData.get("is_prediction_locked"), false),
    notes: formData.get("notes"),
  });

  if (!payload.success) {
    return;
  }

  const winningTeamId =
    payload.data.status === "completed"
      ? payload.data.score_a > payload.data.score_b
        ? payload.data.team_a_id || null
        : payload.data.score_b > payload.data.score_a
          ? payload.data.team_b_id || null
          : null
      : null;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("matches")
    .update({
      event_id: payload.data.event_id,
      sport: payload.data.sport,
      team_a: payload.data.team_a,
      team_b: payload.data.team_b,
      score_a: payload.data.score_a,
      score_b: payload.data.score_b,
      status: payload.data.status,
      round: payload.data.round,
      venue: payload.data.venue,
      starts_at: toIsoString(payload.data.starts_at),
      team_a_id: payload.data.team_a_id || null,
      team_b_id: payload.data.team_b_id || null,
      event_phase: payload.data.event_phase || "group",
      mvp_player: payload.data.mvp_player || null,
      live_minute: payload.data.live_minute ?? null,
      is_prediction_locked: payload.data.is_prediction_locked ?? false,
      notes: payload.data.notes || null,
      winning_team_id: winningTeamId,
    })
    .eq("id", id);

  if (error) {
    return;
  }

  await logAdminAction("match_update", "match", id);
  revalidateMany(["/admin/events", "/match-center", "/results", "/predictions", "/predictions/match"]);
}

export async function scoreMatchPredictionsAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const matchId = String(formData.get("match_id") ?? "");
  if (!matchId) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { data: match } = await supabase
    .from("matches")
    .select("id, team_a, team_b, score_a, score_b, status, mvp_player")
    .eq("id", matchId)
    .single();

  if (!match || match.status !== "completed") {
    return;
  }

  const winner = match.score_a === match.score_b ? "DRAW" : match.score_a > match.score_b ? match.team_a : match.team_b;

  const { data: predictions, error } = await supabase
    .from("predictions")
    .select("id, predicted_winner, predicted_score_a, predicted_score_b, predicted_mvp_player, stake_points")
    .eq("match_id", matchId);

  if (error) {
    return;
  }

  for (const prediction of predictions ?? []) {
    const winnerPoints = prediction.predicted_winner === winner ? 3 : 0;
    const exactScorePoints =
      prediction.predicted_score_a === match.score_a && prediction.predicted_score_b === match.score_b ? 2 : 0;
    const mvpPoints =
      match.mvp_player &&
      prediction.predicted_mvp_player &&
      prediction.predicted_mvp_player.trim().toLowerCase() === match.mvp_player.trim().toLowerCase()
        ? 1
        : 0;

    const basePoints = winnerPoints + exactScorePoints + mvpPoints;
    const totalPoints = basePoints * Math.max(1, prediction.stake_points ?? 1);

    await supabase
      .from("predictions")
      .update({
        points_awarded: totalPoints,
        outcome: basePoints > 0 ? "won" : "lost",
      })
      .eq("id", prediction.id);
  }

  await logAdminAction("prediction_score_rerun", "match", matchId);
  revalidateMany(["/predictions", "/predictions/match", "/profile", "/admin/events"]);
}