import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export function toOptionalIso(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  if (!raw) {
    return null;
  }

  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function toIsoString(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function toOptionalNumber(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  if (!raw) {
    return undefined;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function toOptionalNumberOrNull(value: FormDataEntryValue | null) {
  const parsed = toOptionalNumber(value);
  return parsed ?? null;
}

export function toBoolean(value: FormDataEntryValue | null, fallback = false) {
  if (value === null) {
    return fallback;
  }
  return String(value) === "true";
}

export async function logAdminAction(
  action: string,
  entityType: string,
  entityId: string | null,
  payload?: Record<string, unknown>
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  await supabase.from("admin_activity_logs").insert({
    admin_user_id: currentUser.id,
    action,
    entity_type: entityType,
    entity_id: entityId,
    payload: payload ?? null,
  });
}

export function revalidateMany(paths: string[]) {
  for (const path of paths) {
    revalidatePath(path);
  }
}

export function revalidateAdminRegistrationPages() {
  revalidateMany([
    "/admin/registrations/collective-sports",
    "/admin/registrations/individual-sports",
    "/admin/registrations/culture-events",
  ]);
}

export function normalizeActivitySlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function shuffle<T>(items: T[]) {
  const array = [...items];
  for (let index = array.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const temp = array[index];
    array[index] = array[swapIndex];
    array[swapIndex] = temp;
  }
  return array;
}

export function buildGroupLabel(seed: number, teamCount: number) {
  const groupCount = Math.max(1, Math.ceil(teamCount / 4));
  const groupIndex = seed % groupCount;
  return String.fromCharCode("A".charCodeAt(0) + groupIndex);
}