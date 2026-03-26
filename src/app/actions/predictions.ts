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
  });

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Invalid prediction payload.");
  }

  const supabase = await createSupabaseServerClient();

  const { data: match } = await supabase
    .from("matches")
    .select("status")
    .eq("id", parsed.data.match_id)
    .single();

  if (!match || match.status === "completed") {
    return failure("Predictions are closed for this match.");
  }

  const { error } = await supabase.from("predictions").upsert({
    user_id: user.id,
    match_id: parsed.data.match_id,
    predicted_winner: parsed.data.predicted_winner,
    points_awarded: null,
  });

  if (error) {
    return failure(error.message);
  }

  revalidatePath("/predictions");
  return success("Prediction submitted.");
}
