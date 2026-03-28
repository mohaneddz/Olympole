import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

export function createSupabaseAdminClient() {
  if (!env.SUPABASE_SEC_KEY) {
    throw new Error("Missing SUPABASE_SEC_KEY or SUPABASE_SERVICE_KEY for server admin operations.");
  }

  return createClient(env.NEXT_PUBLIC_SUPABASE_URL!, env.SUPABASE_SEC_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
