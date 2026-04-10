"use server";

import { revalidatePath } from "next/cache";
import { failure, success, type ActionResponse } from "@/lib/actions";
import { requireAuth } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { predictionSchema } from "@/lib/validators";

export async function submitPredictionAction(_: ActionResponse, formData: FormData): Promise<ActionResponse> {
  const user = await requireAuth();

  const parsed = predictionSchema.safeParse({
    match_id: formData.get("match_id"),
    predicted_winner: formData.get("predicted_winner"),
    predicted_score_a: formData.get("predicted_score_a"),
    predicted_score_b: formData.get("predicted_score_b"),
    predicted_mvp_player: formData.get("predicted_mvp_player"),
    stake_points: formData.get("stake_points"),
  });

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Invalid prediction payload.");
  }

  const supabase = await createSupabaseServerClient();

  const { data: match } = await supabase
    .from("matches")
    .select("status, team_a, team_b, is_prediction_locked")
    .eq("id", parsed.data.match_id)
    .single();

  if (!match || match.status === "completed" || match.is_prediction_locked) {
    return failure("Predictions are closed for this match.");
  }

  const allowedWinners = [match.team_a, match.team_b, "DRAW"];
  if (!allowedWinners.includes(parsed.data.predicted_winner)) {
    return failure("Pick a valid winner from the available teams or DRAW.");
  }

  const { error } = await supabase.from("predictions").upsert({
    user_id: user.id,
    match_id: parsed.data.match_id,
    predicted_winner: parsed.data.predicted_winner,
    predicted_score_a: parsed.data.predicted_score_a,
    predicted_score_b: parsed.data.predicted_score_b,
    predicted_mvp_player: parsed.data.predicted_mvp_player || null,
    stake_points: parsed.data.stake_points,
    outcome: "pending",
    points_awarded: null,
  }, { onConflict: "user_id,match_id" });

  if (error) {
    return failure(error.message);
  }

  revalidatePath("/predictions");
  revalidatePath("/predictions/match");
  revalidatePath("/profile");
  return success("Prediction submitted successfully.");
}
