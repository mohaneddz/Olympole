export const PROFILE_DRAFT_COOKIE = "olympole_profile_draft";
export const REGISTRATION_DRAFT_COOKIE_PREFIX = "olympole_reg_draft_";
export const AUTH_DRAFT_COOKIE = "olympole_auth_draft";
const MAX_COOKIE_VALUE_CHARS = 1200;

export type ProfileDraftCookie = {
  full_name?: string;
  school?: string;
  year_of_study?: string;
  gender?: string;
  student_id?: string;
};

export type RegistrationDraftCookie = {
  full_name?: string;
  email?: string;
  phone?: string;
  department_or_school?: string;
  event_id?: string;
  team_name?: string;
  emergency_contact?: string;
  previous_experience?: string;
  motivation?: string;
  preferred_role?: string;
  availability_date?: string;
  additional_notes?: string;
  detail_gender?: string;
  detail_competition_level?: string;
  detail_running_distance?: string;
  detail_joined_marathon_before?: string;
  detail_participated_before?: string;
  detail_elo_rating?: string;
  detail_talent_type?: string;
  detail_talent_type_other?: string;
  detail_performance_description?: string;
  detail_writing_category?: string;
  detail_art_category?: string;
  detail_strengths?: string;
  detail_schedule?: string;
};

export type AuthDraftCookie = {
  mode?: "login" | "signup";
  login_email?: string;
  signup_full_name?: string;
  signup_email?: string;
  signup_phone?: string;
  signup_gender?: string;
  signup_school?: string;
  signup_year_of_study?: string;
  signup_student_id?: string;
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

function truncateText(value: unknown, max: number) {
  if (typeof value !== "string") {
    return value;
  }

  return value.length > max ? value.slice(0, max) : value;
}

function sanitizeRegistrationDraftForCookie(value: RegistrationDraftCookie) {
  const sanitized: RegistrationDraftCookie = {
    ...value,
    full_name: truncateText(value.full_name, 120) as string | undefined,
    email: truncateText(value.email, 254) as string | undefined,
    phone: truncateText(value.phone, 32) as string | undefined,
    department_or_school: truncateText(value.department_or_school, 120) as string | undefined,
    team_name: truncateText(value.team_name, 120) as string | undefined,
    emergency_contact: truncateText(value.emergency_contact, 120) as string | undefined,
    preferred_role: truncateText(value.preferred_role, 120) as string | undefined,
    availability_date: truncateText(value.availability_date, 64) as string | undefined,
    // Keep draft cookies small to avoid oversized request headers breaking Server Actions.
    previous_experience: undefined,
    motivation: undefined,
    additional_notes: undefined,
    detail_performance_description: undefined,
    detail_talent_type_other: truncateText(value.detail_talent_type_other, 120) as string | undefined,
    detail_strengths: truncateText(value.detail_strengths, 120) as string | undefined,
    detail_schedule: truncateText(value.detail_schedule, 120) as string | undefined,
  };

  let serialized = safeStringify(sanitized);
  if (serialized.length <= MAX_COOKIE_VALUE_CHARS) {
    return serialized;
  }

  const minimal: RegistrationDraftCookie = {
    event_id: sanitized.event_id,
    full_name: sanitized.full_name,
    email: sanitized.email,
    phone: sanitized.phone,
    department_or_school: sanitized.department_or_school,
    preferred_role: sanitized.preferred_role,
    detail_gender: sanitized.detail_gender,
    detail_running_distance: sanitized.detail_running_distance,
    detail_elo_rating: sanitized.detail_elo_rating,
    detail_talent_type: sanitized.detail_talent_type,
    detail_writing_category: sanitized.detail_writing_category,
    detail_art_category: sanitized.detail_art_category,
  };

  serialized = safeStringify(minimal);
  return serialized.length <= MAX_COOKIE_VALUE_CHARS ? serialized : safeStringify({ event_id: sanitized.event_id });
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

export function parseAuthDraftCookie(cookieValue: string | null | undefined) {
  return safeParseJson<AuthDraftCookie>(cookieValue);
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
  writeClientCookie(name, sanitizeRegistrationDraftForCookie(value));
}

export function clearClientRegistrationDraftCookie(activitySlug: string) {
  const name = getRegistrationDraftCookieName(activitySlug);
  writeClientCookie(name, "", 0);
}

export function readClientAuthDraftCookie() {
  return parseAuthDraftCookie(readClientCookie(AUTH_DRAFT_COOKIE));
}

export function writeClientAuthDraftCookie(value: AuthDraftCookie) {
  const sanitized: AuthDraftCookie = {
    mode: value.mode === "login" ? "login" : "signup",
    login_email: truncateText(value.login_email, 254) as string | undefined,
    signup_full_name: truncateText(value.signup_full_name, 120) as string | undefined,
    signup_email: truncateText(value.signup_email, 254) as string | undefined,
    signup_phone: truncateText(value.signup_phone, 32) as string | undefined,
    signup_gender: value.signup_gender === "male" || value.signup_gender === "female" ? value.signup_gender : undefined,
    signup_school: truncateText(value.signup_school, 40) as string | undefined,
    signup_year_of_study: truncateText(value.signup_year_of_study, 20) as string | undefined,
    signup_student_id: truncateText(value.signup_student_id, 32) as string | undefined,
  };

  let serialized = safeStringify(sanitized);
  if (serialized.length > MAX_COOKIE_VALUE_CHARS) {
    serialized = safeStringify({
      mode: sanitized.mode,
      login_email: sanitized.login_email,
      signup_email: sanitized.signup_email,
      signup_phone: sanitized.signup_phone,
      signup_gender: sanitized.signup_gender,
      signup_school: sanitized.signup_school,
      signup_year_of_study: sanitized.signup_year_of_study,
      signup_student_id: sanitized.signup_student_id,
    });
  }

  writeClientCookie(AUTH_DRAFT_COOKIE, serialized);
}

export function clearClientAuthDraftCookie() {
  writeClientCookie(AUTH_DRAFT_COOKIE, "", 0);
}
