import { env } from "@/lib/env";

export type AppSettings = {
  registration_enabled: boolean;
  predictions_enabled: boolean;
  fantasy_launch: boolean;
  writing_enabled: boolean;
  live_streaming_enabled: boolean;
  registration_max_events_per_user: number;
};

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (typeof value !== "string") {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }
  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  return fallback;
}

function parseBoundedInt(value: string | undefined, fallback: number, min: number, max: number): number {
  if (typeof value !== "string") {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  const normalized = Math.floor(parsed);
  if (normalized < min || normalized > max) {
    return fallback;
  }

  return normalized;
}

export function getDefaultAppSettings(): AppSettings {
  return {
    registration_enabled: parseBoolean(env.NEXT_PUBLIC_REGISTRATION_ENABLED, true),
    predictions_enabled: parseBoolean(env.NEXT_PUBLIC_PREDICTIONS_ENABLED, true),
    fantasy_launch: parseBoolean(env.NEXT_PUBLIC_FANTASY_OPEN, false),
    writing_enabled: parseBoolean(env.NEXT_PUBLIC_WRITING_ENABLED, true),
    live_streaming_enabled: parseBoolean(env.NEXT_PUBLIC_LIVE_STREAMING_ENABLED, true),
    registration_max_events_per_user: parseBoundedInt(env.NEXT_PUBLIC_REGISTRATION_MAX_EVENTS_PER_USER, 8, 1, 20),
  };
}
