import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getAdminEmails } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function isMissingTableError(message: string, tableName: string) {
  const lowered = message.toLowerCase();
  return (
    lowered.includes(`public.${tableName}`) &&
    (lowered.includes("schema cache") || lowered.includes("does not exist"))
  );
}

export const getCurrentUser = cache(async () => {
  const supabase = await createSupabaseServerClient();
  try {
    const { data } = await supabase.auth.getUser();
    return data.user;
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return null;
  }
});

export const getCurrentProfile = cache(async () => {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  try {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    return data;
  } catch (error) {
    console.error("getCurrentProfile error:", error);
    return null;
  }
});

export const getCurrentUserRoles = cache(async () => {
  const user = await getCurrentUser();
  if (!user) {
    return [] as string[];
  }

  const supabase = await createSupabaseServerClient();
  try {
    const { data, error } = await supabase
      .from("profile_roles")
      .select("role_name")
      .eq("profile_id", user.id);

    if (error) {
      // Backward compatible fallback for older schema state.
      const profile = await getCurrentProfile();
      return profile?.role ? [profile.role] : [];
    }

    if (!data?.length) {
      const profile = await getCurrentProfile();
      return profile?.role ? [profile.role] : [];
    }

    return data.map((row) => row.role_name);
  } catch (error) {
    console.error("getCurrentUserRoles error:", error);
    return [] as string[];
  }
});

export async function isCurrentUserAdmin() {
  const roles = await getCurrentUserRoles();
  return roles.includes("admin");
}

export async function syncAdminRole(user: User) {
  const supabase = createSupabaseAdminClient();
  const email = user.email?.toLowerCase() ?? "";
  const isAdmin = getAdminEmails().includes(email);
  const metadata = user.user_metadata ?? {};
  const metadataUsername = typeof metadata.username === "string" ? metadata.username.trim() : "";
  const metadataPhone = typeof metadata.phone === "string" ? metadata.phone.trim() : "";
  const metadataBio = typeof metadata.bio === "string" ? metadata.bio.trim() : "";
  const metadataSchool = typeof metadata.school === "string" ? metadata.school.trim() : "";
  const metadataYear = typeof metadata.year_of_study === "string" ? metadata.year_of_study.trim() : "";
  const metadataStudentId = typeof metadata.student_id === "string" ? metadata.student_id.trim() : "";

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    email: email || `${user.id}@unknown.local`,
    full_name: user.user_metadata?.full_name ?? null,
    ...(metadataUsername ? { username: metadataUsername } : {}),
    ...(metadataPhone ? { phone: metadataPhone } : {}),
    ...(metadataBio ? { bio: metadataBio } : {}),
    ...(metadataSchool ? { school: metadataSchool } : {}),
    ...(metadataYear ? { year_of_study: metadataYear } : {}),
    ...(metadataStudentId ? { student_id: metadataStudentId } : {}),
    role: isAdmin ? "admin" : "participant",
    last_seen_at: new Date().toISOString(),
  });

  if (profileError) {
    if (isMissingTableError(profileError.message, "profiles")) {
      console.warn("Profiles table is missing. Apply Supabase migrations to enable role sync.");
      return { synced: false as const, reason: "profiles_table_missing" as const };
    }

    throw new Error(`Failed to sync profile: ${profileError.message}`);
  }

  const roleLabel = isAdmin ? "admin" : "participant";
  const { error: roleError } = await supabase.from("profile_roles").upsert(
    {
      profile_id: user.id,
      role_name: roleLabel,
    },
    { onConflict: "profile_id,role_name" }
  );

  if (roleError && !isMissingTableError(roleError.message, "profile_roles")) {
    throw new Error(`Failed to sync user roles: ${roleError.message}`);
  }

  return { synced: true as const };
}

export async function getProfileCompletionStatus(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("full_name, school, year_of_study, gender, student_id")
    .eq("id", userId)
    .single();

  if (error) {
    if (isMissingTableError(error.message, "profiles")) {
      return { ready: false as const, reason: "profiles_table_missing" as const };
    }
    return { ready: false as const, reason: "unknown" as const };
  }

  const hasName = Boolean(data?.full_name?.trim());
  const hasSchool = Boolean(data?.school?.trim());
  const hasYear = Boolean(data?.year_of_study?.trim());
  const hasGender = Boolean(data?.gender?.trim());
  const hasStudentId = Boolean(data?.student_id?.trim());
  return { ready: hasName && hasSchool && hasYear && hasGender && hasStudentId };
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  await syncAdminRole(user);

  const supabase = await createSupabaseServerClient();
  await supabase
    .from("profiles")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("id", user.id);

  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  const roles = await getCurrentUserRoles();

  if (!roles.includes("admin")) {
    redirect("/");
  }

  return user;
}
