"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser, requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { eventSchema, matchSchema, resultSchema } from "@/lib/validators";

async function logAdmin(action: string, entityType: string, entityId: string | null) {
  const user = await getCurrentUser();
  if (!user) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  await supabase.from("admin_activity_logs").insert({
    admin_user_id: user.id,
    action,
    entity_type: entityType,
    entity_id: entityId,
  });
}

export async function createEventAction(formData: FormData) {
  await requireAdmin();

  const parsed = eventSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    type: formData.get("type"),
    category: formData.get("category"),
    venue: formData.get("venue"),
    starts_at: formData.get("starts_at"),
    ends_at: formData.get("ends_at"),
    status: formData.get("status"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("events")
    .insert({ ...parsed.data, description: parsed.data.description || null })
    .select("id")
    .single();

  await logAdmin("event_create", "event", data?.id ?? null);
  revalidatePath("/admin/events");
  revalidatePath("/schedule");
}

export async function deleteEventAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  await supabase.from("events").delete().eq("id", id);

  await logAdmin("event_delete", "event", id);
  revalidatePath("/admin/events");
  revalidatePath("/schedule");
}

export async function createMatchAction(formData: FormData) {
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
  });

  if (!parsed.success) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("matches").insert(parsed.data).select("id").single();

  await logAdmin("match_create", "match", data?.id ?? null);
  revalidatePath("/admin/events");
  revalidatePath("/match-center");
}

export async function updateMatchAction(formData: FormData) {
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
  });

  if (!payload.success) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  await supabase.from("matches").update(payload.data).eq("id", id);

  await logAdmin("match_update", "match", id);
  revalidatePath("/admin/events");
  revalidatePath("/match-center");
  revalidatePath("/results");
}

export async function createResultAction(formData: FormData) {
  await requireAdmin();

  const parsed = resultSchema.safeParse({
    event_id: formData.get("event_id"),
    participant_or_team_name: formData.get("participant_or_team_name"),
    placement: formData.get("placement"),
    medal: formData.get("medal"),
    score_summary: formData.get("score_summary"),
  });

  if (!parsed.success) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const medal = parsed.data.medal === "none" ? null : parsed.data.medal;

  const { data } = await supabase
    .from("results")
    .insert({
      ...parsed.data,
      medal,
      score_summary: parsed.data.score_summary || null,
      published_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  await logAdmin("result_create", "result", data?.id ?? null);
  revalidatePath("/admin/events");
  revalidatePath("/results");
}

export async function scoreMatchPredictionsAction(formData: FormData) {
  await requireAdmin();

  const matchId = String(formData.get("match_id") ?? "");
  if (!matchId) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { data: match } = await supabase
    .from("matches")
    .select("id, team_a, team_b, score_a, score_b, status")
    .eq("id", matchId)
    .single();

  if (!match || match.status !== "completed") {
    return;
  }

  const winner = match.score_a === match.score_b ? "DRAW" : match.score_a > match.score_b ? match.team_a : match.team_b;

  const { data: predictions } = await supabase
    .from("predictions")
    .select("id, predicted_winner")
    .eq("match_id", matchId);

  for (const prediction of predictions ?? []) {
    const points = prediction.predicted_winner === winner ? 3 : 0;
    await supabase.from("predictions").update({ points_awarded: points }).eq("id", prediction.id);
  }

  await logAdmin("prediction_score_rerun", "match", matchId);
  revalidatePath("/predictions");
  revalidatePath("/admin/events");
}
