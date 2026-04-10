"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { failure, success, type ActionResponse } from "@/lib/actions";
import { getCurrentUser, requireAdmin } from "@/lib/auth";
import { normalizeEventIconKey } from "@/lib/event-icons";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  eventSchema,
  liveStreamSchema,
  matchSchema,
  resultSchema,
  sportSchema,
  teamSchema,
} from "@/lib/validators";

function toBoolean(value: FormDataEntryValue | null, fallback = false) {
  if (value === null) {
    return fallback;
  }
  return String(value) === "true";
}

function toOptionalNumber(value: FormDataEntryValue | null) {
  if (!value) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toIsoString(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function normalizeActivitySlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function resolveActivityForEvent(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  formData: FormData,
  fallbackActivityId?: string | null
) {
  const selectedActivityId = String(formData.get("activity_id") ?? "").trim() || fallbackActivityId || "";
  const newActivityTitle = String(formData.get("new_activity_title") ?? "").trim();
  const newActivitySlug = normalizeActivitySlug(String(formData.get("new_activity_slug") ?? ""));
  const newActivityCategory = String(formData.get("new_activity_category") ?? "").trim();

  let activityId = selectedActivityId;
  if (!activityId && newActivityTitle && newActivitySlug && ["collective_sport", "individual_sport", "culture"].includes(newActivityCategory)) {
    const { data: createdActivity } = await supabase
      .from("activities")
      .upsert(
        {
          title: newActivityTitle,
          slug: newActivitySlug,
          category: newActivityCategory,
          is_active: true,
        },
        { onConflict: "slug" }
      )
      .select("id")
      .single();

    activityId = createdActivity?.id ?? "";
  }

  if (!activityId) {
    return null;
  }

  const { data: activity } = await supabase
    .from("activities")
    .select("id, slug, title, category")
    .eq("id", activityId)
    .single();

  return activity ?? null;
}

async function logAdmin(
  action: string,
  entityType: string,
  entityId: string | null,
  payload?: Record<string, unknown>
) {
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
    payload: payload ?? null,
  });
}

export async function createEventAction(_: ActionResponse, formData: FormData): Promise<ActionResponse> {
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
    sport_id: formData.get("sport_id"),
    activity_id: formData.get("activity_id"),
    registration_deadline: formData.get("registration_deadline"),
    max_participants: toOptionalNumber(formData.get("max_participants")),
    is_registration_open: toBoolean(formData.get("is_registration_open"), true),
    show_in_schedule: toBoolean(formData.get("show_in_schedule"), false),
    is_featured: toBoolean(formData.get("is_featured"), false),
    visibility: formData.get("visibility") || "public",
    current_round: formData.get("current_round"),
    icon_key: formData.get("icon_key"),
  });

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Failed to create event.");
  }

  const supabase = await createSupabaseServerClient();
  const activity = await resolveActivityForEvent(supabase, formData, parsed.data.activity_id || null);
  const eventType = activity ? (activity.category === "culture" ? "culture" : "sport") : parsed.data.type;
  const eventCategory = activity?.title ?? parsed.data.category;

  const { data, error } = await supabase
    .from("events")
    .insert({
      title: parsed.data.title,
      slug: parsed.data.slug,
      type: eventType,
      category: eventCategory,
      venue: parsed.data.venue,
      starts_at: toIsoString(parsed.data.starts_at),
      ends_at: toIsoString(parsed.data.ends_at),
      status: parsed.data.status,
      description: parsed.data.description || null,
      sport_id: parsed.data.sport_id || null,
      activity_id: (activity?.id ?? parsed.data.activity_id) || null,
      registration_deadline: parsed.data.registration_deadline
        ? toIsoString(parsed.data.registration_deadline)
        : null,
      max_participants: parsed.data.max_participants ?? null,
      is_registration_open: parsed.data.is_registration_open ?? true,
      show_in_schedule: parsed.data.show_in_schedule ?? false,
      is_featured: parsed.data.is_featured ?? false,
      visibility: parsed.data.visibility ?? "public",
      current_round: parsed.data.current_round || null,
      icon_key: normalizeEventIconKey(parsed.data.icon_key),
    })
    .select("id")
    .single();

  if (error) {
    return failure(error.message);
  }

  await logAdmin("event_create", "event", data?.id ?? null, { slug: parsed.data.slug });
  revalidatePath("/admin/events");
  revalidatePath("/admin/schedule");
  revalidatePath("/admin/sports");
  revalidatePath("/schedule");
  revalidatePath("/sports");
  return success("Event created.");
}

export async function updateEventAction(_: ActionResponse, formData: FormData): Promise<ActionResponse> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) {
    return failure("Missing event id.");
  }

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
    sport_id: formData.get("sport_id"),
    activity_id: formData.get("activity_id"),
    registration_deadline: formData.get("registration_deadline"),
    max_participants: toOptionalNumber(formData.get("max_participants")),
    is_registration_open: toBoolean(formData.get("is_registration_open"), true),
    show_in_schedule: toBoolean(formData.get("show_in_schedule"), false),
    is_featured: toBoolean(formData.get("is_featured"), false),
    visibility: formData.get("visibility") || "public",
    current_round: formData.get("current_round"),
    icon_key: formData.get("icon_key"),
  });

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Failed to update event.");
  }

  const supabase = await createSupabaseServerClient();
  const activity = await resolveActivityForEvent(supabase, formData, parsed.data.activity_id || null);
  const eventType = activity ? (activity.category === "culture" ? "culture" : "sport") : parsed.data.type;
  const eventCategory = activity?.title ?? parsed.data.category;

  const { error } = await supabase
    .from("events")
    .update({
      title: parsed.data.title,
      slug: parsed.data.slug,
      type: eventType,
      category: eventCategory,
      venue: parsed.data.venue,
      starts_at: toIsoString(parsed.data.starts_at),
      ends_at: toIsoString(parsed.data.ends_at),
      status: parsed.data.status,
      description: parsed.data.description || null,
      sport_id: parsed.data.sport_id || null,
      activity_id: (activity?.id ?? parsed.data.activity_id) || null,
      registration_deadline: parsed.data.registration_deadline
        ? toIsoString(parsed.data.registration_deadline)
        : null,
      max_participants: parsed.data.max_participants ?? null,
      is_registration_open: parsed.data.is_registration_open ?? true,
      show_in_schedule: parsed.data.show_in_schedule ?? false,
      is_featured: parsed.data.is_featured ?? false,
      visibility: parsed.data.visibility ?? "public",
      current_round: parsed.data.current_round || null,
      icon_key: normalizeEventIconKey(parsed.data.icon_key),
    })
    .eq("id", id);

  if (error) {
    return failure(error.message);
  }

  await logAdmin("event_update", "event", id, { slug: parsed.data.slug });
  revalidatePath("/admin/events");
  revalidatePath("/admin/schedule");
  revalidatePath(`/admin/events/${id}/edit`);
  revalidatePath("/admin/sports");
  revalidatePath("/schedule");
  revalidatePath("/sports");
  return success("Event updated.");
}

export async function updateEventIconAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) {
    return;
  }

  const iconKey = normalizeEventIconKey(formData.get("icon_key"));

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("events")
    .update({ icon_key: iconKey })
    .eq("id", id);

  if (error) {
    return;
  }

  await logAdmin("event_icon_update", "event", id, { icon_key: iconKey });
  revalidatePath("/admin/events");
  revalidatePath("/schedule");
  revalidatePath("/sports");
}

export async function deleteEventAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) {
    return;
  }

  await logAdmin("event_delete", "event", id);
  revalidatePath("/admin/events");
  revalidatePath("/schedule");
  revalidatePath("/sports");
}

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

  await logAdmin("match_create", "match", data?.id ?? null);
  revalidatePath("/admin/events");
  revalidatePath("/match-center");
  revalidatePath("/predictions");
  revalidatePath("/predictions/match");
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

  await logAdmin("match_update", "match", id);
  revalidatePath("/admin/events");
  revalidatePath("/match-center");
  revalidatePath("/results");
  revalidatePath("/predictions");
  revalidatePath("/predictions/match");
}

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

  await logAdmin("result_create", "result", data?.id ?? null);
  revalidatePath("/admin/events");
  revalidatePath("/results");
  return success("Result created.");
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

  const winner =
    match.score_a === match.score_b
      ? "DRAW"
      : match.score_a > match.score_b
        ? match.team_a
        : match.team_b;

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

  await logAdmin("prediction_score_rerun", "match", matchId);
  revalidatePath("/predictions");
  revalidatePath("/predictions/match");
  revalidatePath("/profile");
  revalidatePath("/admin/events");
}

export async function createSportAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const parsed = sportSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    sport_type: formData.get("sport_type"),
    is_team_based: toBoolean(formData.get("is_team_based"), false),
    gender_division: formData.get("gender_division"),
    description: formData.get("description"),
    is_active: toBoolean(formData.get("is_active"), true),
  });

  if (!parsed.success) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("sports")
    .upsert(
      {
        name: parsed.data.name,
        slug: parsed.data.slug,
        sport_type: parsed.data.sport_type,
        is_team_based: parsed.data.is_team_based ?? false,
        gender_division: parsed.data.gender_division || "mixed",
        description: parsed.data.description || null,
        is_active: parsed.data.is_active ?? true,
      },
      { onConflict: "slug" }
    )
    .select("id")
    .single();

  if (error) {
    return;
  }

  await logAdmin("sport_upsert", "sport", data?.id ?? null);
  revalidatePath("/admin/sports");
  revalidatePath("/sports");
  revalidatePath("/register");
}

export async function deleteSportAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("sports").delete().eq("id", id);
  if (error) {
    return;
  }

  await logAdmin("sport_delete", "sport", id);
  revalidatePath("/admin/sports");
  revalidatePath("/sports");
  revalidatePath("/register");
}

export async function createTeamAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const parsed = teamSchema.safeParse({
    sport_id: formData.get("sport_id"),
    name: formData.get("name"),
    category: formData.get("category") || "collective",
  });

  if (!parsed.success) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("teams")
    .upsert(
      {
        sport_id: parsed.data.sport_id,
        name: parsed.data.name,
        category: parsed.data.category,
      },
      { onConflict: "sport_id,name" }
    )
    .select("id")
    .single();

  if (error) {
    return;
  }

  await logAdmin("team_upsert", "team", data?.id ?? null);
  revalidatePath("/admin/sports");
  revalidatePath("/admin/teams");
  revalidatePath("/sports");
}

export async function updateTeamAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) {
    return;
  }

  const parsed = teamSchema.safeParse({
    sport_id: formData.get("sport_id"),
    name: formData.get("name"),
    category: formData.get("category") || "collective",
  });

  if (!parsed.success) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("teams")
    .update({
      sport_id: parsed.data.sport_id,
      name: parsed.data.name,
      category: parsed.data.category,
    })
    .eq("id", id);

  if (error) {
    return;
  }

  await logAdmin("team_update", "team", id);
  revalidatePath("/admin/sports");
  revalidatePath("/admin/teams");
  revalidatePath("/sports");
}

export async function deleteTeamAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("teams").delete().eq("id", id);
  if (error) {
    return;
  }

  await logAdmin("team_delete", "team", id);
  revalidatePath("/admin/sports");
  revalidatePath("/admin/teams");
  revalidatePath("/sports");
}

export async function createLiveStreamAction(formData: FormData): Promise<void> {
  const adminUser = await requireAdmin();
  const parsed = liveStreamSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    event_id: formData.get("event_id"),
    playback_url: formData.get("playback_url"),
    status: formData.get("status"),
    access: formData.get("access"),
    starts_at: formData.get("starts_at"),
    ends_at: formData.get("ends_at"),
  });

  if (!parsed.success) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("live_streams")
    .insert({
      title: parsed.data.title,
      description: parsed.data.description || null,
      event_id: parsed.data.event_id || null,
      host_profile_id: adminUser.id,
      playback_url: parsed.data.playback_url || null,
      status: parsed.data.status,
      access: parsed.data.access,
      starts_at: parsed.data.starts_at ? toIsoString(parsed.data.starts_at) : null,
      ends_at: parsed.data.ends_at ? toIsoString(parsed.data.ends_at) : null,
    })
    .select("id")
    .single();

  if (error) {
    return;
  }

  await logAdmin("live_stream_create", "live_stream", data?.id ?? null);
  revalidatePath("/admin/live-streams");
  revalidatePath("/live");
  redirect("/admin/live-streams");
}

export async function updateLiveStreamDetailsAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) {
    return;
  }

  const parsed = liveStreamSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    event_id: formData.get("event_id"),
    playback_url: formData.get("playback_url"),
    status: formData.get("status"),
    access: formData.get("access"),
    starts_at: formData.get("starts_at"),
    ends_at: formData.get("ends_at"),
  });

  if (!parsed.success) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("live_streams")
    .update({
      title: parsed.data.title,
      description: parsed.data.description || null,
      event_id: parsed.data.event_id || null,
      playback_url: parsed.data.playback_url || null,
      status: parsed.data.status,
      access: parsed.data.access,
      starts_at: parsed.data.starts_at ? toIsoString(parsed.data.starts_at) : null,
      ends_at: parsed.data.ends_at ? toIsoString(parsed.data.ends_at) : null,
    })
    .eq("id", id);

  if (error) {
    return;
  }

  await logAdmin("live_stream_update", "live_stream", id);
  revalidatePath("/admin/live-streams");
  revalidatePath("/live");
}

export async function updateLiveStreamStatusAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !["draft", "live", "ended"].includes(status)) {
    return;
  }

  const payload: Record<string, unknown> = { status };
  if (status === "live") payload.starts_at = new Date().toISOString();
  if (status === "ended") payload.ends_at = new Date().toISOString();

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("live_streams").update(payload).eq("id", id);
  if (error) {
    return;
  }

  await logAdmin(`live_stream_${status}`, "live_stream", id);
  revalidatePath("/admin/live-streams");
  revalidatePath("/live");
}

export async function deleteLiveStreamAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("live_streams").delete().eq("id", id);
  if (error) {
    return;
  }

  await logAdmin("live_stream_delete", "live_stream", id);
  revalidatePath("/admin/live-streams");
  revalidatePath("/live");
}
