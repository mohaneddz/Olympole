"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
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
    return;
  }

  const supabase = await createSupabaseServerClient();
  await supabase.from("app_settings").upsert(parsed.data);

  revalidatePath("/admin/settings");
  revalidatePath("/register");
  revalidatePath("/predictions");
  revalidatePath("/culture/writing");
  revalidatePath("/live");
}
