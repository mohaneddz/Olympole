export const PROFILE_DRAFT_COOKIE = "olympole_profile_draft";
export const REGISTRATION_DRAFT_COOKIE_PREFIX = "olympole_reg_draft_";

export type ProfileDraftCookie = {
  full_name?: string;
  school?: string;
  year_of_study?: string;
};

export type RegistrationDraftCookie = {
  full_name?: string;
  email?: string;
  phone?: string;
  department_or_school?: string;
  team_name?: string;
  emergency_contact?: string;
  previous_experience?: string;
  motivation?: string;
  preferred_role?: string;
  availability_date?: string;
  additional_notes?: string;
  detail_strengths?: string;
  detail_schedule?: string;
};

function safeParseJson<T>(value: string | null | undefined): T | null {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(decodeURIComponent(value)) as T;
  } catch {
    return null;
  }
}

function safeStringify(value: unknown) {
  return encodeURIComponent(JSON.stringify(value));
}

export function getRegistrationDraftCookieName(activitySlug: string) {
  return `${REGISTRATION_DRAFT_COOKIE_PREFIX}${activitySlug}`;
}

export function parseProfileDraftCookie(cookieValue: string | null | undefined) {
  return safeParseJson<ProfileDraftCookie>(cookieValue);
}

export function parseRegistrationDraftCookie(cookieValue: string | null | undefined) {
  return safeParseJson<RegistrationDraftCookie>(cookieValue);
}

function readClientCookie(name: string) {
  if (typeof document === "undefined") {
    return null;
  }

  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
  return match ? match[1] : null;
}

function writeClientCookie(name: string, value: string, maxAgeSeconds = 60 * 60 * 24 * 14) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${name}=${value}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
}

export function readClientProfileDraftCookie() {
  return parseProfileDraftCookie(readClientCookie(PROFILE_DRAFT_COOKIE));
}

export function writeClientProfileDraftCookie(value: ProfileDraftCookie) {
  writeClientCookie(PROFILE_DRAFT_COOKIE, safeStringify(value));
}

export function clearClientProfileDraftCookie() {
  writeClientCookie(PROFILE_DRAFT_COOKIE, "", 0);
}

export function readClientRegistrationDraftCookie(activitySlug: string) {
  const name = getRegistrationDraftCookieName(activitySlug);
  return parseRegistrationDraftCookie(readClientCookie(name));
}

export function writeClientRegistrationDraftCookie(activitySlug: string, value: RegistrationDraftCookie) {
  const name = getRegistrationDraftCookieName(activitySlug);
  writeClientCookie(name, safeStringify(value));
}

export function clearClientRegistrationDraftCookie(activitySlug: string) {
  const name = getRegistrationDraftCookieName(activitySlug);
  writeClientCookie(name, "", 0);
}
