"use server";

import { cookies } from "next/headers";
import { failure, success, type ActionResponse } from "@/lib/actions";
import { getAllowedActivityRegistrationTables, getManagedActivityBySlug } from "@/lib/activity-registry";
import { getCurrentProfile, requireAdmin, requireAuth } from "@/lib/auth";
import { getRegistrationDraftCookieName } from "@/lib/cookie-drafts";
import { getAppSettings } from "@/lib/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { activityRegistrationSchema, registrationBatchSchema } from "@/lib/validators";
import { logAdminAction, revalidateAdminRegistrationPages, revalidateMany } from "@/server/_shared";

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

  if (activitySlug === "talent-show") {
    if (!details.talent_type) {
      return "Please select your talent type.";
    }
    if (details.talent_type.toLowerCase() === "other" && !details.talent_type_other) {
      return "Please specify your talent type when selecting Other.";
    }
    if (!details.performance_description) {
      return "Please provide a short performance description.";
    }
  }

  if (activitySlug === "art-exhibition" && !details.art_category) {
    return "Please choose an art category.";
  }

  if (activitySlug === "writing-contest" && !details.writing_category) {
    return "Please choose a writing category.";
  }

  if (activitySlug === "running" && !details.running_distance) {
    return "Please choose your running distance.";
  }

  if (activitySlug === "football") {
    const normalizedRole = preferredRole.trim().toLowerCase();
    const allowedRoles = new Set(["field player", "goalkeeper", "goal keeper"]);
    if (!allowedRoles.has(normalizedRole)) {
      return "Preferred role must be one of: Field Player, Goalkeeper.";
    }
  }

  if (activitySlug === "handball") {
    const normalizedRole = preferredRole.trim().toLowerCase();
    const allowedRoles = new Set(["field player", "goalkeeper", "goal keeper"]);
    if (!allowedRoles.has(normalizedRole)) {
      return "Preferred role must be one of: Field Player, Goalkeeper.";
    }
  }

  return null;
}

function normalizeProfileGenderToCategory(value: unknown): "men" | "women" | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  if (["man", "male", "men"].includes(normalized)) return "men";
  if (["woman", "female", "women"].includes(normalized)) return "women";
  return null;
}

function normalizeDetailBoolean(value: string | undefined) {
  const normalized = (value ?? "").trim().toLowerCase();
  if (["yes", "true", "1", "on"].includes(normalized)) return true;
  if (["no", "false", "0", "off", ""].includes(normalized)) return false;
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

function getSafeRegistrationTableFromSlug(slug: string) {
  const activity = getManagedActivityBySlug(slug);
  return activity?.tableName ?? null;
}

async function resolveActivityEventId(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  activitySlug: string,
  requestedEventId?: string
) {
  const normalizedRequestedEventId = (requestedEventId ?? "").trim();

  if (normalizedRequestedEventId) {
    const { data: requestedEvent, error: requestedEventError } = await supabase
      .from("events")
      .select("id, activities(slug)")
      .eq("id", normalizedRequestedEventId)
      .single();

    if (requestedEventError || !requestedEvent) {
      return { ok: false as const, message: requestedEventError?.message ?? "Activity schedule is unavailable." };
    }

    const linkedActivity = Array.isArray(requestedEvent.activities)
      ? requestedEvent.activities[0]
      : requestedEvent.activities;

    if (linkedActivity?.slug !== activitySlug) {
      return { ok: false as const, message: "The selected schedule does not match the requested activity." };
    }

    return { ok: true as const, eventId: requestedEvent.id as string | null };
  }

  const { data: candidateEvents, error: candidateEventsError } = await supabase
    .from("events")
    .select("id, status, activities!inner(slug)")
    .eq("activities.slug", activitySlug)
    .neq("status", "cancelled")
    .order("starts_at", { ascending: true })
    .limit(1);

  if (candidateEventsError) {
    return { ok: false as const, message: candidateEventsError.message };
  }

  const fallbackEventId = candidateEvents?.[0]?.id;
  if (!fallbackEventId) {
    return { ok: true as const, eventId: null as string | null };
  }

  return { ok: true as const, eventId: fallbackEventId as string | null };
}

async function assertRegistrationLimit(userId: string, requestedEventCount: number) {
  const supabase = await createSupabaseServerClient();
  const settings = await getAppSettings();

  const { data: existingRegistrations } = await supabase
    .from("v_activity_registrations_all")
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

  const { error } = await supabase.from("registrations").upsert(payload, { onConflict: "user_id,event_id" });

  if (error) {
    return failure(error.message);
  }

  revalidateMany(["/register", "/profile"]);
  revalidateAdminRegistrationPages();
  return success(`Registration submitted for ${newEventIds.length} event(s).`);
}

export async function createActivityRegistrationAction(
  _: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  const user = await requireAuth();
  const profile = await getCurrentProfile();

  if (!profile?.full_name || !profile?.school || !profile?.year_of_study || !profile?.gender || !profile?.student_id) {
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

  const normalizedProfileCategory = normalizeProfileGenderToCategory(profile?.gender);
  if (parsed.data.category_type === "collective_sport") {
    if (!normalizedProfileCategory) {
      return failure("Please set a valid profile gender to register for collective sports.");
    }

    const submittedCategory = (parsed.data.registration_details?.gender ?? details.gender ?? "").trim().toLowerCase();
    if (submittedCategory && submittedCategory !== normalizedProfileCategory) {
      return failure("Category is locked based on your profile gender.");
    }

    details.gender = normalizedProfileCategory;
  }

  const registrationTable = getSafeRegistrationTableFromSlug(parsed.data.activity_slug);
  if (!registrationTable) {
    return failure("This activity is currently unavailable for registration.");
  }

  const supabase = await createSupabaseServerClient();
  const limitState = await assertRegistrationLimit(user.id, 1);
  if (!limitState.ok) {
    return failure(limitState.message);
  }

  const { data: existingActivityRegistration } = await supabase
    .from(registrationTable)
    .select("id")
    .eq("user_id", user.id)
    .limit(1);

  if ((existingActivityRegistration?.length ?? 0) > 0) {
    return failure("You are already registered for this activity.");
  }

  const resolvedEventState = await resolveActivityEventId(supabase, parsed.data.activity_slug, parsed.data.event_id);
  if (!resolvedEventState.ok) {
    return failure(resolvedEventState.message);
  }

  const basePayload = {
    user_id: user.id,
    profile_id: user.id,
    full_name: parsed.data.full_name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    department_or_school: parsed.data.department_or_school,
    event_id: resolvedEventState.eventId,
    team_name: parsed.data.team_name || null,
    additional_notes: parsed.data.additional_notes || null,
    emergency_contact: parsed.data.emergency_contact || null,
    previous_experience: parsed.data.previous_experience || "",
    motivation: parsed.data.motivation || "",
    preferred_role: parsed.data.preferred_role || null,
    status: "pending",
    attendance_status: "pending",
  };

  const typedDetails: Record<string, string | boolean | null> = {};
  if (
    registrationTable.includes("football") ||
    registrationTable.includes("basketball") ||
    registrationTable.includes("handball") ||
    registrationTable.includes("volleyball")
  ) {
    typedDetails.detail_gender = (parsed.data.registration_details?.gender ?? details.gender ?? "").trim() || null;
  }
  if (registrationTable.includes("chess")) {
    typedDetails.detail_elo_rating = (parsed.data.registration_details?.elo_rating ?? details.elo_rating ?? "").trim() || null;
    typedDetails.detail_participated_before = normalizeDetailBoolean(
      parsed.data.registration_details?.participated_before ?? details.participated_before
    );
  }
  if (registrationTable.includes("running")) {
    typedDetails.detail_running_distance =
      (parsed.data.registration_details?.running_distance ?? details.running_distance ?? "").trim() || null;
    typedDetails.detail_joined_marathon_before = normalizeDetailBoolean(
      parsed.data.registration_details?.joined_marathon_before ?? details.joined_marathon_before
    );
  }
  if (registrationTable.includes("talent_show")) {
    typedDetails.detail_talent_type = (parsed.data.registration_details?.talent_type ?? details.talent_type ?? "").trim() || null;
    typedDetails.detail_talent_type_other =
      (parsed.data.registration_details?.talent_type_other ?? details.talent_type_other ?? "").trim() || null;
    typedDetails.detail_performance_description =
      (parsed.data.registration_details?.performance_description ?? details.performance_description ?? "").trim() || null;
    typedDetails.detail_participated_before = normalizeDetailBoolean(
      parsed.data.registration_details?.participated_before ?? details.participated_before
    );
  }
  if (registrationTable.includes("art_exhibition")) {
    typedDetails.detail_art_category = (parsed.data.registration_details?.art_category ?? details.art_category ?? "").trim() || null;
    typedDetails.detail_participated_before = normalizeDetailBoolean(
      parsed.data.registration_details?.participated_before ?? details.participated_before
    );
  }
  if (registrationTable.includes("writing_contest")) {
    typedDetails.detail_writing_category =
      (parsed.data.registration_details?.writing_category ?? details.writing_category ?? "").trim() || null;
    typedDetails.detail_participated_before = normalizeDetailBoolean(
      parsed.data.registration_details?.participated_before ?? details.participated_before
    );
  }

  const { error } = await supabase.from(registrationTable).insert({ ...basePayload, ...typedDetails });
  if (error) {
    if (error.message.toLowerCase().includes("duplicate")) {
      return failure("You are already registered for this activity.");
    }
    return failure(error.message);
  }

  const cookieStore = await cookies();
  cookieStore.delete(getRegistrationDraftCookieName(parsed.data.activity_slug));

  revalidateMany([`/register/${parsed.data.activity_slug}`, "/register", "/profile"]);
  revalidateAdminRegistrationPages();
  return success("Registration submitted and saved successfully.");
}

export async function updateActivityRegistrationAction(
  _: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  const user = await requireAuth();
  const profile = await getCurrentProfile();
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

  const normalizedProfileCategory = normalizeProfileGenderToCategory(profile?.gender);
  if (parsed.data.category_type === "collective_sport") {
    if (!normalizedProfileCategory) {
      return failure("Please set a valid profile gender to register for collective sports.");
    }

    const submittedCategory = (parsed.data.registration_details?.gender ?? details.gender ?? "").trim().toLowerCase();
    if (submittedCategory && submittedCategory !== normalizedProfileCategory) {
      return failure("Category is locked based on your profile gender.");
    }

    details.gender = normalizedProfileCategory;
  }

  const registrationTable = getSafeRegistrationTableFromSlug(parsed.data.activity_slug);
  if (!registrationTable) {
    return failure("This activity is currently unavailable for registration.");
  }

  const supabase = await createSupabaseServerClient();
  const { data: existing, error: existingError } = await supabase
    .from(registrationTable)
    .select("id, event_id, status")
    .eq("id", registrationId)
    .eq("user_id", user.id)
    .single();

  if (existingError || !existing) {
    return failure(existingError?.message ?? "Registration not found.");
  }

  if (existing.status === "approved") {
    return failure("Approved registrations cannot be edited.");
  }

  const typedDetails: Record<string, string | boolean | null> = {};
  if (
    registrationTable.includes("football") ||
    registrationTable.includes("basketball") ||
    registrationTable.includes("handball") ||
    registrationTable.includes("volleyball")
  ) {
    typedDetails.detail_gender = (parsed.data.registration_details?.gender ?? details.gender ?? "").trim() || null;
  }
  if (registrationTable.includes("chess")) {
    typedDetails.detail_elo_rating = (parsed.data.registration_details?.elo_rating ?? details.elo_rating ?? "").trim() || null;
    typedDetails.detail_participated_before = normalizeDetailBoolean(
      parsed.data.registration_details?.participated_before ?? details.participated_before
    );
  }
  if (registrationTable.includes("running")) {
    typedDetails.detail_running_distance =
      (parsed.data.registration_details?.running_distance ?? details.running_distance ?? "").trim() || null;
    typedDetails.detail_joined_marathon_before = normalizeDetailBoolean(
      parsed.data.registration_details?.joined_marathon_before ?? details.joined_marathon_before
    );
  }
  if (registrationTable.includes("talent_show")) {
    typedDetails.detail_talent_type = (parsed.data.registration_details?.talent_type ?? details.talent_type ?? "").trim() || null;
    typedDetails.detail_talent_type_other =
      (parsed.data.registration_details?.talent_type_other ?? details.talent_type_other ?? "").trim() || null;
    typedDetails.detail_performance_description =
      (parsed.data.registration_details?.performance_description ?? details.performance_description ?? "").trim() || null;
    typedDetails.detail_participated_before = normalizeDetailBoolean(
      parsed.data.registration_details?.participated_before ?? details.participated_before
    );
  }
  if (registrationTable.includes("art_exhibition")) {
    typedDetails.detail_art_category = (parsed.data.registration_details?.art_category ?? details.art_category ?? "").trim() || null;
    typedDetails.detail_participated_before = normalizeDetailBoolean(
      parsed.data.registration_details?.participated_before ?? details.participated_before
    );
  }
  if (registrationTable.includes("writing_contest")) {
    typedDetails.detail_writing_category =
      (parsed.data.registration_details?.writing_category ?? details.writing_category ?? "").trim() || null;
    typedDetails.detail_participated_before = normalizeDetailBoolean(
      parsed.data.registration_details?.participated_before ?? details.participated_before
    );
  }

  const { error } = await supabase
    .from(registrationTable)
    .update({
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      department_or_school: parsed.data.department_or_school,
      event_id: existing.event_id,
      team_name: parsed.data.team_name || null,
      additional_notes: parsed.data.additional_notes || null,
      emergency_contact: parsed.data.emergency_contact || null,
      previous_experience: parsed.data.previous_experience || "",
      motivation: parsed.data.motivation || "",
      preferred_role: parsed.data.preferred_role || null,
      status: "pending",
      attendance_status: "pending",
      ...typedDetails,
    })
    .eq("id", registrationId)
    .eq("user_id", user.id);

  if (error) {
    return failure(error.message);
  }

  revalidateMany([`/register/${parsed.data.activity_slug}`, "/register", "/profile"]);
  revalidateAdminRegistrationPages();
  return success("Registration updated successfully.");
}

export async function deleteActivityRegistrationAction(formData: FormData): Promise<void> {
  const user = await requireAuth();
  const registrationId = String(formData.get("registration_id") ?? "");
  const activitySlug = String(formData.get("activity_slug") ?? "");
  if (!registrationId || !activitySlug) {
    return;
  }

  const registrationTable = getSafeRegistrationTableFromSlug(activitySlug);
  if (!registrationTable) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { data: existing } = await supabase
    .from(registrationTable)
    .select("id, status")
    .eq("id", registrationId)
    .eq("user_id", user.id)
    .single();

  if (!existing || existing.status === "approved") {
    return;
  }

  await supabase.from(registrationTable).delete().eq("id", registrationId).eq("user_id", user.id);

  revalidateMany([`/register/${activitySlug}`, "/register", "/profile"]);
  revalidateAdminRegistrationPages();
}

export async function updateRegistrationStatusAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const registrationTable = String(formData.get("registration_table") ?? "");
  const allowedTables = new Set(getAllowedActivityRegistrationTables());
  if (!id || !["pending", "approved", "rejected"].includes(status) || !allowedTables.has(registrationTable)) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from(registrationTable).update({ status }).eq("id", id);
  if (error) {
    return;
  }

  await logAdminAction(`registration_status_${status}`, "registration", id);
  revalidateAdminRegistrationPages();
  revalidateMany(["/profile"]);
}

export async function updateRegistrationStatusWithFeedbackAction(
  _: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  try {
    await requireAdmin();
    const id = String(formData.get("id") ?? "");
    const status = String(formData.get("status") ?? "");
    const registrationTable = String(formData.get("registration_table") ?? "");
    const allowedTables = new Set(getAllowedActivityRegistrationTables());

    if (!id || !["pending", "approved", "rejected"].includes(status) || !allowedTables.has(registrationTable)) {
      return failure("Invalid registration status payload.");
    }

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from(registrationTable).update({ status }).eq("id", id);
    if (error) {
      return failure(error.message);
    }

    await logAdminAction(`registration_status_${status}`, "registration", id);
    revalidateAdminRegistrationPages();
    revalidateMany(["/profile"]);

    return success("Registration status updated.");
  } catch (error) {
    return failure(error instanceof Error ? error.message : "Failed to update status.");
  }
}

export async function deleteRegistrationAdminAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("registration_id") ?? "");
  const registrationTable = String(formData.get("registration_table") ?? "");
  const allowedTables = new Set(getAllowedActivityRegistrationTables());
  if (!id || !allowedTables.has(registrationTable)) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from(registrationTable).delete().eq("id", id);
  if (error) {
    return;
  }

  await logAdminAction("registration_delete", "registration", id);
  revalidateAdminRegistrationPages();
  revalidateMany(["/profile"]);
}

export async function assignRegistrationTeamAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const registrationId = String(formData.get("registration_id") ?? "");
  const registrationTable = String(formData.get("registration_table") ?? "");
  const teamId = String(formData.get("team_id") ?? "");
  const membershipRole = String(formData.get("membership_role") ?? "player");
  const allowedTables = new Set(getAllowedActivityRegistrationTables());
  if (!registrationId || !allowedTables.has(registrationTable)) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  let teamName: string | null = null;
  if (teamId) {
    const { data: team } = await supabase.from("teams").select("id,name").eq("id", teamId).single();
    teamName = team?.name ?? null;
  }

  const { data: registration, error } = await supabase
    .from(registrationTable)
    .update({
      team_id: teamId || null,
      team_name: teamName,
    })
    .eq("id", registrationId)
    .select("id, profile_id")
    .single();

  if (error || !registration) {
    return;
  }

  if (teamId && registration.profile_id) {
    await supabase.from("team_memberships").upsert(
      {
        team_id: teamId,
        profile_id: registration.profile_id,
        role: membershipRole || "player",
      },
      { onConflict: "team_id,profile_id" }
    );
  }

  await logAdminAction("registration_assign_team", "registration", registrationId, {
    registration_table: registrationTable,
    team_id: teamId || null,
  });

  revalidateAdminRegistrationPages();
  revalidateMany(["/admin/schedule", "/profile"]);
}

export async function assignRegistrationTeamWithFeedbackAction(
  _: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  try {
    await requireAdmin();
    const registrationId = String(formData.get("registration_id") ?? "");
    const registrationTable = String(formData.get("registration_table") ?? "");
    const teamId = String(formData.get("team_id") ?? "");
    const membershipRole = String(formData.get("membership_role") ?? "player");
    const allowedTables = new Set(getAllowedActivityRegistrationTables());

    if (!registrationId || !allowedTables.has(registrationTable)) {
      return failure("Invalid team assignment payload.");
    }

    const supabase = await createSupabaseServerClient();
    let teamName: string | null = null;
    if (teamId) {
      const { data: team } = await supabase.from("teams").select("id,name").eq("id", teamId).single();
      teamName = team?.name ?? null;
    }

    const { data: registration, error } = await supabase
      .from(registrationTable)
      .update({
        team_id: teamId || null,
        team_name: teamName,
      })
      .eq("id", registrationId)
      .select("id, profile_id")
      .single();

    if (error || !registration) {
      return failure(error?.message ?? "Failed to assign team.");
    }

    if (teamId && registration.profile_id) {
      await supabase.from("team_memberships").upsert(
        {
          team_id: teamId,
          profile_id: registration.profile_id,
          role: membershipRole || "player",
        },
        { onConflict: "team_id,profile_id" }
      );
    }

    await logAdminAction("registration_assign_team", "registration", registrationId, {
      registration_table: registrationTable,
      team_id: teamId || null,
    });

    revalidateAdminRegistrationPages();
    revalidateMany(["/admin/schedule", "/profile"]);

    return success("Team assignment updated.");
  } catch (error) {
    return failure(error instanceof Error ? error.message : "Failed to assign team.");
  }
}
