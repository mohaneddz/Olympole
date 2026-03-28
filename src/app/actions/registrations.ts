"use server";

import { revalidatePath } from "next/cache";
import { failure, success, type ActionResponse } from "@/lib/actions";
import { getCurrentUser, requireAdmin, requireAuth } from "@/lib/auth";
import { getAppSettings } from "@/lib/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { registrationBatchSchema } from "@/lib/validators";

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
  const settings = await getAppSettings();

  const { data: existingRegistrations } = await supabase
    .from("registrations")
    .select("id, event_id")
    .eq("user_id", user.id);

  const existingEventIds = new Set((existingRegistrations ?? []).map((row) => row.event_id));
  const newEventIds = parsed.data.event_ids.filter((eventId) => !existingEventIds.has(eventId));
  if (newEventIds.length === 0) {
    return failure("You are already registered for the selected event(s).");
  }

  if ((existingRegistrations?.length ?? 0) + newEventIds.length > settings.registration_max_events_per_user) {
    return failure(
      `You can register for up to ${settings.registration_max_events_per_user} events only.`
    );
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
  }));

  const { error } = await supabase
    .from("registrations")
    .upsert(payload, { onConflict: "user_id,event_id" });

  if (error) {
    return failure(error.message);
  }

  revalidatePath("/register");
  revalidatePath("/profile");
  revalidatePath("/admin/users");
  return success(`Registration submitted for ${newEventIds.length} event(s).`);
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

  revalidatePath("/admin/users");
  revalidatePath("/profile");
}
