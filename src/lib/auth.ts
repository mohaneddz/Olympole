import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getAdminEmails } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const getCurrentUser = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
});

export const getCurrentProfile = cache(async () => {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return data;
});

function isProfilesTableMissingError(message: string) {
  const lowered = message.toLowerCase();
  return lowered.includes("public.profiles") && (lowered.includes("schema cache") || lowered.includes("does not exist"));
}

export async function syncAdminRole(user: User) {
  const supabase = createSupabaseAdminClient();
  const email = user.email?.toLowerCase() ?? "";
  const isAdmin = getAdminEmails().includes(email);

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    email: email || `${user.id}@unknown.local`,
    full_name: user.user_metadata?.full_name ?? null,
    role: isAdmin ? "admin" : "participant",
  });

  if (error) {
    if (isProfilesTableMissingError(error.message)) {
      console.warn("Profiles table is missing. Apply Supabase migrations to enable role sync.");
      return { synced: false as const, reason: "profiles_table_missing" as const };
    }

    throw new Error(`Failed to sync profile: ${error.message}`);
  }

  return { synced: true as const };
}

export async function getProfileCompletionStatus(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("full_name, school, year_of_study")
    .eq("id", userId)
    .single();

  if (error) {
    if (isProfilesTableMissingError(error.message)) {
      return { ready: false as const, reason: "profiles_table_missing" as const };
    }
    return { ready: false as const, reason: "unknown" as const };
  }

  const hasName = Boolean(data?.full_name?.trim());
  const hasSchool = Boolean(data?.school?.trim());
  const hasYear = Boolean(data?.year_of_study?.trim());
  return { ready: hasName && hasSchool && hasYear };
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  await syncAdminRole(user);
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  const supabase = await createSupabaseServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  return user;
}
