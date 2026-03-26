"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { failure, success, type ActionResponse } from "@/lib/actions";
import { getProfileCompletionStatus, syncAdminRole } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

const signupSchema = loginSchema.extend({
  full_name: z.string().min(2).max(120).optional(),
});

export async function signInAction(_: ActionResponse, formData: FormData): Promise<ActionResponse> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return failure("Invalid credentials format.");
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error || !data.user) {
    return failure(error?.message ?? "Invalid login credentials.");
  }

  const syncResult = await syncAdminRole(data.user);
  if (!syncResult.synced) {
    return failure("Signed in, but database migrations are missing. Ask an admin to run Supabase migrations.");
  }

  const completion = await getProfileCompletionStatus(data.user.id);
  if (!completion.ready) {
    redirect("/onboarding");
  }

  redirect("/admin");
}

export async function signUpAction(_: ActionResponse, formData: FormData): Promise<ActionResponse> {
  const parsed = signupSchema.safeParse({
    full_name: formData.get("full_name") || undefined,
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Invalid sign-up payload.");
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.full_name ?? null,
      },
    },
  });

  if (error) {
    return failure(error.message);
  }

  if (data.user) {
    const syncResult = await syncAdminRole(data.user);
    if (!syncResult.synced) {
      return success("Account created, but profile tables are not migrated yet. Run Supabase migrations before admin features.");
    }
  }

  return success("Account created. You can now sign in.");
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
