"use server";

import { failure, success, type ActionResponse } from "@/lib/actions";
import { requireAdmin } from "@/lib/auth";
import { normalizeEventIconKey } from "@/lib/event-icons";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { eventSchema } from "@/lib/validators";
import {
  logAdminAction,
  normalizeActivitySlug,
  revalidateMany,
  toBoolean,
  toIsoString,
  toOptionalNumber,
} from "@/server/_shared";

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
  if (
    !activityId &&
    newActivityTitle &&
    newActivitySlug &&
    ["collective_sport", "individual_sport", "culture"].includes(newActivityCategory)
  ) {
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
      registration_deadline: parsed.data.registration_deadline ? toIsoString(parsed.data.registration_deadline) : null,
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

  await logAdminAction("event_create", "event", data?.id ?? null, { slug: parsed.data.slug });
  revalidateMany(["/admin/events", "/admin/schedule", "/admin/sports", "/schedule", "/sports"]);
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
      registration_deadline: parsed.data.registration_deadline ? toIsoString(parsed.data.registration_deadline) : null,
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

  await logAdminAction("event_update", "event", id, { slug: parsed.data.slug });
  revalidateMany(["/admin/events", "/admin/schedule", `/admin/events/${id}/edit`, "/admin/sports", "/schedule", "/sports"]);
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
  const { error } = await supabase.from("events").update({ icon_key: iconKey }).eq("id", id);

  if (error) {
    return;
  }

  await logAdminAction("event_icon_update", "event", id, { icon_key: iconKey });
  revalidateMany(["/admin/events", "/schedule", "/sports"]);
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

  await logAdminAction("event_delete", "event", id);
  revalidateMany(["/admin/events", "/schedule", "/sports"]);
}