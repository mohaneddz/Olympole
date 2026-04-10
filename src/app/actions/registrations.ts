"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { failure, success, type ActionResponse } from "@/lib/actions";
import { getCurrentProfile, getCurrentUser, requireAdmin, requireAuth } from "@/lib/auth";
import { getRegistrationDraftCookieName } from "@/lib/cookie-drafts";
import { getAppSettings } from "@/lib/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { activityRegistrationSchema, registrationBatchSchema } from "@/lib/validators";

function sanitizeDetailsFromFormData(formData: FormData) {
  const details: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("detail_")) {
      continue;
    }

    const cleanedKey = key.replace(/^detail_/, "").trim();
    const cleanedValue = String(value).trim();
    if (!cleanedKey || !cleanedValue) {
      continue;
    }
    details[cleanedKey] = cleanedValue;
  }
  return details;
}

function validateActivitySpecificDetails(
  activitySlug: string,
  categoryType: "collective_sport" | "individual_sport" | "culture",
  details: Record<string, string>,
  preferredRole: string
) {
  if (categoryType === "collective_sport") {
    const gender = (details.gender ?? "").toLowerCase();
    if (!gender) {
      return "Please select a gender category for this team sport.";
    }
    if (activitySlug === "football" && gender !== "men") {
      return "Football registrations are currently limited to men's category.";
    }
  }

  if (activitySlug === "swimming" && !details.race_category) {
    return "Please choose a swimming race category.";
  }

  if (activitySlug === "talent-show") {
    if (!details.talent_type) {
      return "Please select your talent type.";
    }
    if (!details.performance_description) {
      return "Please provide a short performance description.";
    }
  }

  if (activitySlug === "art-exhibition" && !details.art_category) {
    return "Please choose an art category.";
  }

  if (activitySlug === "football") {
    const normalizedRole = preferredRole.trim().toLowerCase();
    const allowedRoles = new Set(["field player", "goal keeper"]);
    if (!allowedRoles.has(normalizedRole)) {
      return "Preferred role must be one of: Field Player, Goal Keeper.";
    }
  }

  return null;
}

function parseActivityRegistrationPayload(formData: FormData) {
  const details = sanitizeDetailsFromFormData(formData);
  const parsed = activityRegistrationSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    department_or_school: formData.get("department_or_school"),
    category_type: formData.get("category_type"),
    event_id: formData.get("event_id"),
    team_name: formData.get("team_name"),
    additional_notes: formData.get("additional_notes"),
    emergency_contact: formData.get("emergency_contact"),
    activity_slug: formData.get("activity_slug"),
    previous_experience: formData.get("previous_experience"),
    motivation: formData.get("motivation"),
    availability_date: formData.get("availability_date"),
    preferred_role: formData.get("preferred_role"),
    registration_details: details,
  });

  return { parsed, details };
}

async function assertRegistrationLimit(userId: string, requestedEventCount: number) {
  const supabase = await createSupabaseServerClient();
  const settings = await getAppSettings();

  const { data: existingRegistrations } = await supabase
    .from("registrations")
    .select("id, event_id")
    .eq("user_id", userId);

  const existingCount = existingRegistrations?.length ?? 0;
  if (existingCount + requestedEventCount > settings.registration_max_events_per_user) {
    return {
      ok: false as const,
      message: `You can register for up to ${settings.registration_max_events_per_user} events only.`,
      existingEventIds: new Set((existingRegistrations ?? []).map((row) => row.event_id)),
    };
  }

  return {
    ok: true as const,
    existingEventIds: new Set((existingRegistrations ?? []).map((row) => row.event_id)),
  };
}

export async function createRegistrationAction(_: ActionResponse, formData: FormData): Promise<ActionResponse> {
  const user = await requireAuth();

  const eventIds = Array.from(
    new Set(
      formData
        .getAll("event_ids")
        .map((value) => String(value))
        .filter(Boolean)
    )
  );

  if (eventIds.length === 0) {
    const fallbackSingle = String(formData.get("event_id") ?? "");
    if (fallbackSingle) {
      eventIds.push(fallbackSingle);
    }
  }

  const parsed = registrationBatchSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    department_or_school: formData.get("department_or_school"),
    category_type: formData.get("category_type"),
    event_id: eventIds[0] ?? "",
    event_ids: eventIds,
    team_name: formData.get("team_name"),
    additional_notes: formData.get("additional_notes"),
    emergency_contact: formData.get("emergency_contact"),
  });

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Invalid registration payload.");
  }

  const supabase = await createSupabaseServerClient();
  const limitState = await assertRegistrationLimit(user.id, parsed.data.event_ids.length);
  if (!limitState.ok) {
    return failure(limitState.message);
  }

  const newEventIds = parsed.data.event_ids.filter((eventId) => !limitState.existingEventIds.has(eventId));
  if (newEventIds.length === 0) {
    return failure("You are already registered for the selected event(s).");
  }

  const { data: events, error: eventError } = await supabase
    .from("events")
    .select("id, is_registration_open, status")
    .in("id", newEventIds);

  if (eventError) {
    return failure(eventError.message);
  }

  const openEventIds = new Set(
    (events ?? [])
      .filter((event) => event.is_registration_open && ["scheduled", "live"].includes(event.status))
      .map((event) => event.id)
  );

  const blockedEventIds = newEventIds.filter((eventId) => !openEventIds.has(eventId));
  if (blockedEventIds.length > 0) {
    return failure("Some selected events are closed or not available for registration.");
  }

  const payload = newEventIds.map((eventId) => ({
    full_name: parsed.data.full_name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    department_or_school: parsed.data.department_or_school,
    category_type: parsed.data.category_type,
    event_id: eventId,
    team_name: parsed.data.team_name || null,
    additional_notes: parsed.data.additional_notes || null,
    emergency_contact: parsed.data.emergency_contact || null,
    user_id: user.id,
    profile_id: user.id,
    activity_slug: null,
    previous_experience: null,
    motivation: null,
    availability_date: null,
    preferred_role: null,
    registration_details: {},
  }));

  const { error } = await supabase
    .from("registrations")
    .upsert(payload, { onConflict: "user_id,event_id" });

  if (error) {
    return failure(error.message);
  }

  revalidatePath("/register");
  revalidatePath("/profile");
  revalidatePath("/admin/registrations");
  return success(`Registration submitted for ${newEventIds.length} event(s).`);
}

export async function createActivityRegistrationAction(
  _: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  const user = await requireAuth();
  const profile = await getCurrentProfile();

  if (!profile?.full_name || !profile?.school || !profile?.year_of_study || !profile?.student_id) {
    return failure("Please complete your profile first before registering to activities.");
  }

  const { parsed, details } = parseActivityRegistrationPayload(formData);

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Invalid activity registration payload.");
  }

  const detailsValidationError = validateActivitySpecificDetails(
    parsed.data.activity_slug,
    parsed.data.category_type,
    parsed.data.registration_details ?? details,
    parsed.data.preferred_role ?? ""
  );
  if (detailsValidationError) {
    return failure(detailsValidationError);
  }

  const supabase = await createSupabaseServerClient();
  const limitState = await assertRegistrationLimit(user.id, 1);
  if (!limitState.ok) {
    return failure(limitState.message);
  }
  if (limitState.existingEventIds.has(parsed.data.event_id)) {
    return failure("You are already registered for this activity.");
  }

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id, status, is_registration_open, max_participants, sports(slug)")
    .eq("id", parsed.data.event_id)
    .single();

  if (eventError || !event) {
    return failure(eventError?.message ?? "Event is unavailable.");
  }

  const linkedSport = Array.isArray(event.sports) ? event.sports[0] : event.sports;
  if (linkedSport?.slug !== parsed.data.activity_slug) {
    return failure("The selected event does not match the requested activity.");
  }

  if (!event.is_registration_open || !["scheduled", "live"].includes(event.status)) {
    return failure("This activity is closed for registration right now.");
  }

  if (event.max_participants) {
    const { count } = await supabase
      .from("registrations")
      .select("id", { count: "exact", head: true })
      .eq("event_id", event.id);

    if ((count ?? 0) >= event.max_participants) {
      return failure("This activity has reached maximum participants.");
    }
  }

  const { error } = await supabase.from("registrations").insert({
    user_id: user.id,
    profile_id: user.id,
    full_name: parsed.data.full_name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    department_or_school: parsed.data.department_or_school,
    category_type: parsed.data.category_type,
    event_id: parsed.data.event_id,
    team_name: parsed.data.team_name || null,
    additional_notes: parsed.data.additional_notes || null,
    emergency_contact: parsed.data.emergency_contact || null,
    activity_slug: parsed.data.activity_slug,
    previous_experience: parsed.data.previous_experience,
    motivation: parsed.data.motivation,
    availability_date: parsed.data.availability_date || null,
    preferred_role: parsed.data.preferred_role || null,
    registration_details: parsed.data.registration_details ?? details,
    status: "pending",
    attendance_status: "pending",
  });

  if (error) {
    if (error.message.toLowerCase().includes("duplicate")) {
      return failure("You are already registered for this activity.");
    }
    return failure(error.message);
  }

  const cookieStore = await cookies();
  cookieStore.delete(getRegistrationDraftCookieName(parsed.data.activity_slug));

  revalidatePath(`/register/${parsed.data.activity_slug}`);
  revalidatePath("/register");
  revalidatePath("/profile");
  revalidatePath("/admin/registrations");
  return success("Registration submitted and saved successfully.");
}

export async function updateActivityRegistrationAction(
  _: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  const user = await requireAuth();
  const registrationId = String(formData.get("registration_id") ?? "");
  if (!registrationId) {
    return failure("Missing registration id.");
  }

  const { parsed, details } = parseActivityRegistrationPayload(formData);
  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Invalid activity registration payload.");
  }

  const detailsValidationError = validateActivitySpecificDetails(
    parsed.data.activity_slug,
    parsed.data.category_type,
    parsed.data.registration_details ?? details,
    parsed.data.preferred_role ?? ""
  );
  if (detailsValidationError) {
    return failure(detailsValidationError);
  }

  const supabase = await createSupabaseServerClient();
  const { data: existing, error: existingError } = await supabase
    .from("registrations")
    .select("id, event_id, activity_slug, status")
    .eq("id", registrationId)
    .eq("user_id", user.id)
    .single();

  if (existingError || !existing) {
    return failure(existingError?.message ?? "Registration not found.");
  }

  if (existing.activity_slug !== parsed.data.activity_slug) {
    return failure("The selected registration does not match this activity.");
  }

  if (existing.status === "approved") {
    return failure("Approved registrations cannot be edited.");
  }

  if (parsed.data.event_id !== existing.event_id) {
    const { data: duplicateRows } = await supabase
      .from("registrations")
      .select("id")
      .eq("user_id", user.id)
      .eq("event_id", parsed.data.event_id)
      .neq("id", existing.id)
      .limit(1);

    if ((duplicateRows?.length ?? 0) > 0) {
      return failure("You are already registered for the selected event.");
    }

    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, status, is_registration_open, max_participants, sports(slug)")
      .eq("id", parsed.data.event_id)
      .single();

    if (eventError || !event) {
      return failure(eventError?.message ?? "Event is unavailable.");
    }

    const linkedSport = Array.isArray(event.sports) ? event.sports[0] : event.sports;
    if (linkedSport?.slug !== parsed.data.activity_slug) {
      return failure("The selected event does not match the requested activity.");
    }

    if (!event.is_registration_open || !["scheduled", "live"].includes(event.status)) {
      return failure("This activity is closed for registration right now.");
    }

    if (event.max_participants) {
      const { count } = await supabase
        .from("registrations")
        .select("id", { count: "exact", head: true })
        .eq("event_id", event.id);

      if ((count ?? 0) >= event.max_participants) {
        return failure("This activity has reached maximum participants.");
      }
    }
  }

  const { error } = await supabase
    .from("registrations")
    .update({
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      department_or_school: parsed.data.department_or_school,
      category_type: parsed.data.category_type,
      event_id: parsed.data.event_id,
      team_name: parsed.data.team_name || null,
      additional_notes: parsed.data.additional_notes || null,
      emergency_contact: parsed.data.emergency_contact || null,
      activity_slug: parsed.data.activity_slug,
      previous_experience: parsed.data.previous_experience,
      motivation: parsed.data.motivation,
      availability_date: parsed.data.availability_date || null,
      preferred_role: parsed.data.preferred_role || null,
      registration_details: parsed.data.registration_details ?? details,
      status: "pending",
      attendance_status: "pending",
    })
    .eq("id", registrationId)
    .eq("user_id", user.id);

  if (error) {
    return failure(error.message);
  }

  revalidatePath(`/register/${parsed.data.activity_slug}`);
  revalidatePath("/register");
  revalidatePath("/profile");
  revalidatePath("/admin/registrations");
  return success("Registration updated successfully.");
}

export async function deleteActivityRegistrationAction(formData: FormData): Promise<void> {
  const user = await requireAuth();
  const registrationId = String(formData.get("registration_id") ?? "");
  const activitySlug = String(formData.get("activity_slug") ?? "");
  if (!registrationId || !activitySlug) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { data: existing } = await supabase
    .from("registrations")
    .select("id, activity_slug, status")
    .eq("id", registrationId)
    .eq("user_id", user.id)
    .single();

  if (!existing || existing.activity_slug !== activitySlug || existing.status === "approved") {
    return;
  }

  await supabase.from("registrations").delete().eq("id", registrationId).eq("user_id", user.id);

  revalidatePath(`/register/${activitySlug}`);
  revalidatePath("/register");
  revalidatePath("/profile");
  revalidatePath("/admin/registrations");
}

export async function updateRegistrationStatusAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !["pending", "approved", "rejected"].includes(status)) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const user = await getCurrentUser();

  const { error } = await supabase.from("registrations").update({ status }).eq("id", id);
  if (error) {
    return;
  }

  if (user) {
    await supabase.from("admin_activity_logs").insert({
      admin_user_id: user.id,
      action: `registration_status_${status}`,
      entity_type: "registration",
      entity_id: id,
    });
  }

  revalidatePath("/admin/registrations");
  revalidatePath("/profile");
}
