"use server";

import { revalidatePath } from "next/cache";
import { failure, success, type ActionResponse } from "@/lib/actions";
import { getCurrentUser, requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { registrationSchema } from "@/lib/validators";

export async function createRegistrationAction(_: ActionResponse, formData: FormData): Promise<ActionResponse> {
  const parsed = registrationSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    department_or_school: formData.get("department_or_school"),
    category_type: formData.get("category_type"),
    event_id: formData.get("event_id"),
    team_name: formData.get("team_name"),
    additional_notes: formData.get("additional_notes"),
  });

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Invalid registration payload.");
  }

  const user = await getCurrentUser();
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("registrations").insert({
    ...parsed.data,
    team_name: parsed.data.team_name || null,
    additional_notes: parsed.data.additional_notes || null,
    user_id: user?.id ?? null,
  });

  if (error) {
    return failure(error.message);
  }

  revalidatePath("/register");
  revalidatePath("/admin/users");
  return success("Registration submitted successfully.");
}

export async function updateRegistrationStatusAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !["pending", "approved", "rejected"].includes(status)) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const user = await getCurrentUser();

  await supabase.from("registrations").update({ status }).eq("id", id);

  if (user) {
    await supabase.from("admin_activity_logs").insert({
      admin_user_id: user.id,
      action: `registration_status_${status}`,
      entity_type: "registration",
      entity_id: id,
    });
  }

  revalidatePath("/admin/users");
}
