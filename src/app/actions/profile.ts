"use server";

import { redirect } from "next/navigation";
import { failure, success, type ActionResponse } from "@/lib/actions";
import { getCurrentUserRoles, requireAuth } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { profileCompletionSchema, profileUpdateSchema } from "@/lib/validators";

export async function completeProfileAction(_: ActionResponse, formData: FormData): Promise<ActionResponse> {
  const user = await requireAuth();

  const parsed = profileCompletionSchema.safeParse({
    full_name: formData.get("full_name"),
    school: formData.get("school"),
    year_of_study: formData.get("year_of_study"),
  });

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Invalid profile details.");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.full_name,
      school: parsed.data.school,
      year_of_study: parsed.data.year_of_study,
    })
    .eq("id", user.id);

  if (error) {
    return failure(`Failed to save profile: ${error.message}`);
  }

  const roles = await getCurrentUserRoles();
  if (roles.includes("admin")) {
    redirect("/admin");
  }

  redirect("/profile");
}

export async function updateProfileAction(_: ActionResponse, formData: FormData): Promise<ActionResponse> {
  const user = await requireAuth();

  const parsed = profileUpdateSchema.safeParse({
    full_name: formData.get("full_name"),
    school: formData.get("school"),
    year_of_study: formData.get("year_of_study"),
    username: formData.get("username"),
    phone: formData.get("phone"),
    bio: formData.get("bio"),
    timezone: formData.get("timezone"),
  });

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Invalid profile update payload.");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.full_name,
      school: parsed.data.school,
      year_of_study: parsed.data.year_of_study,
      username: parsed.data.username || null,
      phone: parsed.data.phone || null,
      bio: parsed.data.bio || null,
      timezone: parsed.data.timezone || "Africa/Algiers",
    })
    .eq("id", user.id);

  if (error) {
    return failure(`Failed to update profile: ${error.message}`);
  }

  return success("Profile updated successfully.");
}
