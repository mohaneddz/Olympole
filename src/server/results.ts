"use server";

import { failure, success, type ActionResponse } from "@/lib/actions";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resultSchema } from "@/lib/validators";
import { logAdminAction, revalidateMany } from "@/server/_shared";

export async function createResultAction(_: ActionResponse, formData: FormData): Promise<ActionResponse> {
  await requireAdmin();

  const parsed = resultSchema.safeParse({
    event_id: formData.get("event_id"),
    participant_or_team_name: formData.get("participant_or_team_name"),
    placement: formData.get("placement"),
    medal: formData.get("medal"),
    score_summary: formData.get("score_summary"),
  });

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Failed to create result.");
  }

  const supabase = await createSupabaseServerClient();
  const medal = parsed.data.medal === "none" ? null : parsed.data.medal;

  const { data, error } = await supabase
    .from("results")
    .insert({
      event_id: parsed.data.event_id,
      participant_or_team_name: parsed.data.participant_or_team_name,
      placement: parsed.data.placement,
      medal,
      score_summary: parsed.data.score_summary || null,
      published_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    return failure(error.message);
  }

  await logAdminAction("result_create", "result", data?.id ?? null);
  revalidateMany(["/admin/events", "/results"]);
  return success("Result created.");
}