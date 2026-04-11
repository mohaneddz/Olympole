"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { failure, success, type ActionResponse } from "@/lib/actions";
import { getProfileCompletionStatus, syncAdminRole } from "@/lib/auth";
import { normalizePhoneInput, phonePattern } from "@/lib/phone";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.preprocess((value) => (typeof value === "string" ? value.trim() : value), z.string().email().max(254)),
  password: z.string().min(6),
});

const signupSchema = loginSchema.extend({
  full_name: z.string().min(2).max(120).optional(),
  username: z
    .string()
    .regex(/^[a-zA-Z0-9_]{3,32}$/)
    .optional(),
  phone: z.preprocess(
    normalizePhoneInput,
    z.string().regex(phonePattern, "Phone number must be exactly 10 digits and start with 0.")
  ),
  bio: z.string().max(400).optional(),
  password: z.string().min(6, "Password must be at least 6 characters long.").max(120),
});

async function redirectAfterAuth(userId: string) {
  const completion = await getProfileCompletionStatus(userId);
  if (!completion.ready) {
    redirect("/onboarding");
  }

  const supabase = await createSupabaseServerClient();
  const { data: roles } = await supabase
    .from("profile_roles")
    .select("role_name")
    .eq("profile_id", userId);

  const isAdmin = (roles ?? []).some((row) => row.role_name === "admin");
  redirect(isAdmin ? "/admin" : "/profile");
}

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

  await redirectAfterAuth(data.user.id);
  return { ok: true, message: "" };
}

export async function signUpAction(_: ActionResponse, formData: FormData): Promise<ActionResponse> {
  const parsed = signupSchema.safeParse({
    full_name: formData.get("full_name") || undefined,
    username: formData.get("username") || undefined,
    phone: formData.get("phone"),
    bio: formData.get("bio") || undefined,
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Invalid sign-up payload.");
  }

  const admin = createSupabaseAdminClient();
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: {
      full_name: parsed.data.full_name ?? null,
      username: parsed.data.username ?? null,
      phone: parsed.data.phone,
      bio: parsed.data.bio ?? null,
    },
  });

  if (createError) {
    return failure(createError.message);
  }

  if (!created.user) {
    return failure("Account was created, but no user was returned. Try signing in.");
  }

  const syncResult = await syncAdminRole(created.user);
  if (!syncResult.synced) {
    return success("Account created, but profile tables are not migrated yet. Run Supabase migrations before admin features.");
  }

  const supabase = await createSupabaseServerClient();
  const signInResult = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (signInResult.error || !signInResult.data.user) {
    return success("Account created. Check your email to verify your account, then sign in.");
  }

  await syncAdminRole(signInResult.data.user);
  await redirectAfterAuth(signInResult.data.user.id);
  return { ok: true, message: "" };
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
