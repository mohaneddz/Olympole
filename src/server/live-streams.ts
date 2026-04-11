"use server";

import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { liveStreamSchema } from "@/lib/validators";
import { logAdminAction, revalidateMany, toIsoString } from "@/server/_shared";

export async function createLiveStreamAction(formData: FormData): Promise<void> {
  const adminUser = await requireAdmin();
  const parsed = liveStreamSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    event_id: formData.get("event_id"),
    playback_url: formData.get("playback_url"),
    status: formData.get("status"),
    access: formData.get("access"),
    starts_at: formData.get("starts_at"),
    ends_at: formData.get("ends_at"),
  });

  if (!parsed.success) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("live_streams")
    .insert({
      title: parsed.data.title,
      description: parsed.data.description || null,
      event_id: parsed.data.event_id || null,
      host_profile_id: adminUser.id,
      playback_url: parsed.data.playback_url || null,
      status: parsed.data.status,
      access: parsed.data.access,
      starts_at: parsed.data.starts_at ? toIsoString(parsed.data.starts_at) : null,
      ends_at: parsed.data.ends_at ? toIsoString(parsed.data.ends_at) : null,
    })
    .select("id")
    .single();

  if (error) {
    return;
  }

  await logAdminAction("live_stream_create", "live_stream", data?.id ?? null);
  revalidateMany(["/admin/live-streams", "/live"]);
}

export async function updateLiveStreamDetailsAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) {
    return;
  }

  const parsed = liveStreamSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    event_id: formData.get("event_id"),
    playback_url: formData.get("playback_url"),
    status: formData.get("status"),
    access: formData.get("access"),
    starts_at: formData.get("starts_at"),
    ends_at: formData.get("ends_at"),
  });

  if (!parsed.success) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("live_streams")
    .update({
      title: parsed.data.title,
      description: parsed.data.description || null,
      event_id: parsed.data.event_id || null,
      playback_url: parsed.data.playback_url || null,
      status: parsed.data.status,
      access: parsed.data.access,
      starts_at: parsed.data.starts_at ? toIsoString(parsed.data.starts_at) : null,
      ends_at: parsed.data.ends_at ? toIsoString(parsed.data.ends_at) : null,
    })
    .eq("id", id);

  if (error) {
    return;
  }

  await logAdminAction("live_stream_update", "live_stream", id);
  revalidateMany(["/admin/live-streams", "/live"]);
}

export async function updateLiveStreamStatusAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !["draft", "live", "ended"].includes(status)) {
    return;
  }

  const payload: Record<string, unknown> = { status };
  if (status === "live") payload.starts_at = new Date().toISOString();
  if (status === "ended") payload.ends_at = new Date().toISOString();

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("live_streams").update(payload).eq("id", id);
  if (error) {
    return;
  }

  await logAdminAction(`live_stream_${status}`, "live_stream", id);
  revalidateMany(["/admin/live-streams", "/live"]);
}

export async function deleteLiveStreamAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("live_streams").delete().eq("id", id);
  if (error) {
    return;
  }

  await logAdminAction("live_stream_delete", "live_stream", id);
  revalidateMany(["/admin/live-streams", "/live"]);
}