"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { getDefaultAppSettings } from "@/lib/app-settings";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { appSettingSchema } from "@/lib/validators";

export async function updateSettingAction(formData: FormData) {
  await requireAdmin();

  const key = String(formData.get("key") ?? "");
  const rawValue = String(formData.get("value") ?? "");
  const value =
    key === "registration_max_events_per_user"
      ? Number(rawValue)
      : rawValue === "true";

  const parsed = appSettingSchema.safeParse({ key, value });
  if (!parsed.success) {
    return {
      ok: false as const,
      message: "Invalid setting payload.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const defaults = getDefaultAppSettings();
  const { error } = await supabase.from("website_config").upsert(
    {
      id: 1,
      ...defaults,
      [parsed.data.key]: parsed.data.value,
    },
    { onConflict: "id" }
  );

  if (error) {
    return {
      ok: false as const,
      message: "Failed to update setting.",
    };
  }

  revalidatePath("/register");
  revalidatePath("/predictions");
  revalidatePath("/predictions/match");
  revalidatePath("/predictions/fantasy");
  revalidatePath("/culture/writing");
  revalidatePath("/live");

  return {
    ok: true as const,
  };
}
