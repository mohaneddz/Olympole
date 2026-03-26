const requiredEnv = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY",
] as const;

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
  SUPABASE_SEC_KEY: process.env.SUPABASE_SEC_KEY,
  SUPABASE_CONNECTION_STRING: process.env.SUPABASE_CONNECTION_STRING,
  ADMIN_EMAILS: process.env.ADMIN_EMAILS ?? "",
};

export function getAdminEmails(): string[] {
  return env.ADMIN_EMAILS.split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}
