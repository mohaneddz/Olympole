import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getPublicEvents() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .in("status", ["scheduled", "live", "completed"])
    .order("starts_at", { ascending: true });

  return data ?? [];
}

export async function getPublicMatches() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("matches")
    .select("*, events(title)")
    .order("starts_at", { ascending: true });

  return data ?? [];
}

export async function getPublicResults() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("results")
    .select("*, events(title)")
    .not("published_at", "is", null)
    .order("placement", { ascending: true });

  return data ?? [];
}

export async function getLeaderboard() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("predictions")
    .select("points_awarded, profiles!inner(full_name, email)");

  const aggregate = new Map<string, { name: string; points: number }>();

  for (const row of data ?? []) {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    const key = profile?.email ?? "unknown";
    const existing = aggregate.get(key);
    const nextPoints = (existing?.points ?? 0) + (row.points_awarded ?? 0);
    aggregate.set(key, {
      name: profile?.full_name || profile?.email || "Unknown user",
      points: nextPoints,
    });
  }

  return [...aggregate.values()].sort((a, b) => b.points - a.points).slice(0, 20);
}

export async function getPublishedWritingSubmissions() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("writing_submissions")
    .select("id, title, content, category, is_featured, created_at, profiles!inner(full_name, email)")
    .eq("status", "published")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getWritingVoteCounts() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("submission_votes")
    .select("submission_id");

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    counts.set(row.submission_id, (counts.get(row.submission_id) ?? 0) + 1);
  }

  return counts;
}

export async function getAppSettings() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("app_settings").select("key, value");

  const defaults: Record<string, boolean> = {
    registration_enabled: true,
    predictions_enabled: true,
    writing_enabled: true,
  };

  for (const row of data ?? []) {
    if (typeof row.value === "boolean") {
      defaults[row.key] = row.value;
    }
  }

  return defaults;
}
