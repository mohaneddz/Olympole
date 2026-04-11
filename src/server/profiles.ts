"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAllowedActivityRegistrationTables } from "@/lib/activity-registry";
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
    const registrationTables = ["registrations", ...getAllowedActivityRegistrationTables()];

    const tableSpecs: Array<{ table: string; column: string }> = [
      ...registrationTables.flatMap((table) => [
        { table, column: "user_id" },
        { table, column: "profile_id" },
      ]),
      { table: "team_memberships", column: "profile_id" },
      { table: "profile_roles", column: "profile_id" },
      { table: "predictions", column: "user_id" },
      { table: "writing_submissions", column: "user_id" },
      { table: "submission_votes", column: "voter_user_id" },
      { table: "fantasy_manager_gameweek_scores", column: "profile_id" },
      { table: "fantasy_transfers", column: "profile_id" },
      { table: "fantasy_squads", column: "profile_id" },
      { table: "fantasy_lineups", column: "profile_id" },
    ];

    for (const spec of tableSpecs) {
      const { error } = await adminSupabase
        .from(spec.table)
        .delete()
        .eq(spec.column, targetProfileId);

      if (error) {
        const lowered = error.message.toLowerCase();
        const isSafeToIgnore =
          (lowered.includes("relation") && lowered.includes("does not exist"))
          || lowered.includes("schema cache")
          || (lowered.includes("column") && lowered.includes("does not exist"));

        if (!isSafeToIgnore) {
          return;
        }
      }
    }

    await adminSupabase.from("profiles").delete().eq("id", targetProfileId);
    await adminSupabase.auth.admin.deleteUser(targetProfileId);
  } catch {
    return;
  }

  await logAdminAction("profile_admin_delete", "profile", targetProfileId);
  revalidateMany(["/admin/users"]);
}
