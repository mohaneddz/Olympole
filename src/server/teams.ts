"use server";

import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { teamSchema } from "@/lib/validators";
import { logAdminAction, revalidateMany } from "@/server/_shared";

export async function createTeamAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const parsed = teamSchema.safeParse({
    sport_id: formData.get("sport_id"),
    name: formData.get("name"),
    category: formData.get("category") || "collective",
  });

  if (!parsed.success) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("teams")
    .insert({
      sport_id: parsed.data.sport_id,
      name: parsed.data.name,
    })
    .select("id")
    .single();

  if (error) {
    return;
  }

  await logAdminAction("team_upsert", "team", data?.id ?? null);
  revalidateMany(["/admin/sports", "/admin/teams", "/sports"]);
}

export async function updateTeamAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) {
    return;
  }

  const parsed = teamSchema.safeParse({
    sport_id: formData.get("sport_id"),
    name: formData.get("name"),
    category: formData.get("category") || "collective",
  });

  if (!parsed.success) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("teams")
    .update({
      sport_id: parsed.data.sport_id,
      name: parsed.data.name,
      category: parsed.data.category,
    })
    .eq("id", id);

  if (error) {
    return;
  }

  await logAdminAction("team_update", "team", id);
  revalidateMany(["/admin/sports", "/admin/teams", "/sports"]);
}

export async function deleteTeamAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("teams").delete().eq("id", id);
  if (error) {
    return;
  }

  await logAdminAction("team_delete", "team", id);
  revalidateMany(["/admin/sports", "/admin/teams", "/sports"]);
}
