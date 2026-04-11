import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { appSettingSchema } from "@/lib/validators";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getDefaultAppSettings } from "@/lib/app-settings";
import { isCurrentUserAdmin } from "@/lib/auth";

type Payload = {
  key?: string;
  value?: unknown;
};

function isMissingWebsiteConfigTableError(message: string) {
  const lowered = message.toLowerCase();
  return lowered.includes("website_config") && (lowered.includes("schema cache") || lowered.includes("does not exist"));
}

export async function POST(request: Request) {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    return NextResponse.json(
      {
        ok: false,
        message: "Forbidden.",
      },
      { status: 403 }
    );
  }

  let payload: Payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid JSON payload.",
      },
      { status: 400 }
    );
  }

  const parsed = appSettingSchema.safeParse({
    key: String(payload.key ?? ""),
    value: payload.value,
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid setting payload.",
      },
      { status: 400 }
    );
  }

  const supabase = createSupabaseAdminClient();
  const defaults = getDefaultAppSettings();
  const { error } = await supabase.from("website_config").upsert(
    {
      id: 1,
      ...defaults,
      [parsed.data.key]: parsed.data.value,
    },
    { onConflict: "id" }
  );

  if (error && isMissingWebsiteConfigTableError(error.message)) {
    const legacyWrite = await supabase.from("app_settings").upsert(
      {
        key: parsed.data.key,
        value: parsed.data.value,
      },
      { onConflict: "key" }
    );

    if (legacyWrite.error) {
      return NextResponse.json(
        {
          ok: false,
          message: legacyWrite.error.message || "Failed to update setting.",
        },
        { status: 500 }
      );
    }
  } else if (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error.message || "Failed to update setting.",
      },
      { status: 500 }
    );
  }

  revalidatePath("/register");
  revalidatePath("/predictions");
  revalidatePath("/predictions/match");
  revalidatePath("/predictions/fantasy");
  revalidatePath("/culture/writing");
  revalidatePath("/live");

  return NextResponse.json({
    ok: true,
  });
}
