"use server";

import { redirect } from "next/navigation";
import { failure, type ActionResponse } from "@/lib/actions";
import { getCurrentProfile, requireAuth } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { profileCompletionSchema } from "@/lib/validators";

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

  const profile = await getCurrentProfile();
  if (profile?.role === "admin") {
    redirect("/admin");
  }

  redirect("/");
}
