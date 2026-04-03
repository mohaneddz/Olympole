import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AppSettings = {
  registration_enabled: boolean;
  predictions_enabled: boolean;
  writing_enabled: boolean;
  live_streaming_enabled: boolean;
  registration_max_events_per_user: number;
};

export async function getPublicSports() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("sports")
    .select("id, name, slug, sport_type, is_team_based, gender_division, description")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    return [];
  }

  return data ?? [];
}

export async function getPublicEvents() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("events")
    .select(
      "id, title, slug, type, category, venue, starts_at, ends_at, status, description, sport_id, is_featured, is_registration_open, current_round, max_participants, registration_deadline, sports(name, slug)"
    )
    .eq("visibility", "public")
    .in("status", ["scheduled", "live", "completed"])
    .order("starts_at", { ascending: true });

  if (error) {
    return [];
  }

  return data ?? [];
}

export async function getAllAdminEvents() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("events")
    .select(
      "id, title, slug, type, category, venue, starts_at, ends_at, status, description, sport_id, is_featured, is_registration_open, current_round, max_participants, registration_deadline, visibility, sports(name, slug)"
    )
    .order("starts_at", { ascending: true });

  if (error) {
    return [];
  }

  return data ?? [];
}

export async function getPublicMatches() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("matches")
    .select(
      "id, event_id, sport, team_a, team_b, score_a, score_b, status, round, venue, starts_at, team_a_id, team_b_id, event_phase, mvp_player, live_minute, is_prediction_locked, winning_team_id, stream_id, events(title, slug), live_streams(title, playback_url, status)"
    )
    .order("starts_at", { ascending: true });

  if (error) {
    return [];
  }

  return data ?? [];
}

export async function getPublicResults() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("results")
    .select("id, event_id, participant_or_team_name, placement, medal, score_summary, published_at, events(title, slug)")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false })
    .order("placement", { ascending: true });

  if (error) {
    return [];
  }

  return data ?? [];
}

export async function getLeaderboard() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("predictions")
    .select("points_awarded, outcome, profiles!inner(full_name, email)");

  if (error) {
    return [];
  }

  const aggregate = new Map<string, { name: string; points: number; wins: number }>();

  for (const row of data ?? []) {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    const key = profile?.email ?? "unknown";
    const existing = aggregate.get(key);
    const nextPoints = (existing?.points ?? 0) + (row.points_awarded ?? 0);
    const nextWins = (existing?.wins ?? 0) + (row.outcome === "won" ? 1 : 0);
    aggregate.set(key, {
      name: profile?.full_name || profile?.email || "Unknown user",
      points: nextPoints,
      wins: nextWins,
    });
  }

  return [...aggregate.values()]
    .sort((a, b) => b.points - a.points || b.wins - a.wins)
    .slice(0, 20);
}

export async function getPublishedWritingSubmissions() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("writing_submissions")
    .select("id, title, content, category, is_featured, created_at, profiles!inner(full_name, email)")
    .eq("status", "published")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return [];
  }

  return data ?? [];
}

export async function getWritingVoteCounts() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("submission_votes")
    .select("submission_id");

  if (error) {
    return new Map<string, number>();
  }

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    counts.set(row.submission_id, (counts.get(row.submission_id) ?? 0) + 1);
  }

  return counts;
}

export async function getAppSettings(): Promise<AppSettings> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("app_settings").select("key, value");

  const defaults: AppSettings = {
    registration_enabled: true,
    predictions_enabled: true,
    writing_enabled: true,
    live_streaming_enabled: true,
    registration_max_events_per_user: 8,
  };

  for (const row of data ?? []) {
    if (row.key === "registration_max_events_per_user") {
      const num = Number(row.value);
      if (Number.isFinite(num) && num > 0) {
        defaults.registration_max_events_per_user = Math.floor(num);
      }
      continue;
    }

    if (typeof row.value === "boolean") {
      if (row.key in defaults) {
        defaults[row.key as keyof AppSettings] = row.value as never;
      }
    }
  }

  return defaults;
}

export async function getUserRegistrations(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("registrations")
    .select(
      "id, event_id, full_name, email, phone, department_or_school, category_type, team_name, additional_notes, status, attendance_status, created_at, events(title, slug, starts_at, status, venue)"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return [];
  }

  return data ?? [];
}

export async function getUserPredictions(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("predictions")
    .select(
      "id, match_id, predicted_winner, predicted_score_a, predicted_score_b, predicted_mvp_player, stake_points, points_awarded, outcome, created_at, matches(team_a, team_b, score_a, score_b, status, starts_at)"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return [];
  }

  return data ?? [];
}

export async function getPublicLiveStreams() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("live_streams")
    .select("id, title, description, status, access, playback_url, starts_at, ends_at, event_id, events(title, slug, starts_at)")
    .in("status", ["live", "draft", "scheduled", "completed"])
    .order("starts_at", { ascending: false, nullsFirst: false });

  if (error) {
    return [];
  }

  return data ?? [];
}

export async function getHomeMetrics() {
  const supabase = await createSupabaseServerClient();
  const [eventsRes, sportsRes, regsRes] = await Promise.all([
    supabase.from("events").select("id, starts_at, ends_at, status", { count: "exact" }),
    supabase.from("sports").select("id", { count: "exact" }).eq("is_active", true),
    supabase.from("registrations").select("id", { count: "exact" }),
  ]);

  const today = new Date();
  const activeRange = (eventsRes.data ?? []).reduce(
    (acc, row) => {
      const start = new Date(row.starts_at);
      const end = new Date(row.ends_at);
      if (!acc.start || start < acc.start) acc.start = start;
      if (!acc.end || end > acc.end) acc.end = end;
      return acc;
    },
    { start: null as Date | null, end: null as Date | null }
  );

  const liveEvents = (eventsRes.data ?? []).filter((row) => row.status === "live").length;

  return {
    totalEvents: eventsRes.count ?? 0,
    totalSports: sportsRes.count ?? 0,
    totalRegistrations: regsRes.count ?? 0,
    liveEvents,
    eventWindowStart: activeRange.start ?? today,
    eventWindowEnd: activeRange.end ?? today,
  };
}
