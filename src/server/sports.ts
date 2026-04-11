"use server";

import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sportSchema } from "@/lib/validators";
import { logAdminAction, revalidateMany, toBoolean } from "@/server/_shared";

export async function createSportAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const parsed = sportSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    sport_type: formData.get("sport_type"),
    is_team_based: toBoolean(formData.get("is_team_based"), false),
    gender_division: formData.get("gender_division"),
    description: formData.get("description"),
    is_active: toBoolean(formData.get("is_active"), true),
  });

  if (!parsed.success) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("sports")
    .upsert(
      {
        name: parsed.data.name,
        slug: parsed.data.slug,
        sport_type: parsed.data.sport_type,
        is_team_based: parsed.data.is_team_based ?? false,
        gender_division: parsed.data.gender_division || "mixed",
        description: parsed.data.description || null,
        is_active: parsed.data.is_active ?? true,
      },
      { onConflict: "slug" }
    )
    .select("id")
    .single();

  if (error) {
    return;
  }

  await logAdminAction("sport_upsert", "sport", data?.id ?? null);
  revalidateMany(["/admin/sports", "/sports", "/register"]);
}

export async function deleteSportAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("sports").delete().eq("id", id);
  if (error) {
    return;
  }

  await logAdminAction("sport_delete", "sport", id);
  revalidateMany(["/admin/sports", "/sports", "/register"]);
}