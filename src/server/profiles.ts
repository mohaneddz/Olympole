"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { profileAdminUpdateSchema } from "@/lib/validators";
import { logAdminAction, revalidateMany } from "@/server/_shared";

export async function updateUserProfileAdminAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const parsed = profileAdminUpdateSchema.safeParse({
    profile_id: formData.get("profile_id"),
    full_name: formData.get("full_name"),
    school: formData.get("school"),
    year_of_study: formData.get("year_of_study"),
    student_id: formData.get("student_id"),
    phone: formData.get("phone"),
    username: formData.get("username"),
    avatar_url: formData.get("avatar_url"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.full_name,
      school: parsed.data.school || null,
      year_of_study: parsed.data.year_of_study || null,
      student_id: parsed.data.student_id || null,
      phone: parsed.data.phone || null,
      username: parsed.data.username || null,
      avatar_url: parsed.data.avatar_url || null,
      role: parsed.data.role,
    })
    .eq("id", parsed.data.profile_id);

  if (error) {
    return;
  }

  if (parsed.data.role === "admin") {
    await supabase.from("profile_roles").upsert(
      {
        profile_id: parsed.data.profile_id,
        role_name: "admin",
      },
      { onConflict: "profile_id,role_name" }
    );
  } else {
    await supabase
      .from("profile_roles")
      .delete()
      .eq("profile_id", parsed.data.profile_id)
      .eq("role_name", "admin");
  }

  await logAdminAction("profile_admin_update", "profile", parsed.data.profile_id);
  revalidateMany(["/admin/users", "/profile"]);
}

export async function deleteUserAdminAction(formData: FormData): Promise<void> {
  const currentAdmin = await requireAdmin();
  const targetProfileId = String(formData.get("profile_id") ?? "");
  if (!targetProfileId || targetProfileId === currentAdmin.id) {
    return;
  }

  try {
    const adminSupabase = createSupabaseAdminClient();
    await adminSupabase.auth.admin.deleteUser(targetProfileId);
  } catch {
    return;
  }

  await logAdminAction("profile_admin_delete", "profile", targetProfileId);
  revalidateMany(["/admin/users"]);
}