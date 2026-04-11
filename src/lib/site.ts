const DEFAULT_SITE_URL = "https://olympole.vercel.app";

function ensureProtocol(url: string) {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `https://${url}`;
}

export function getSiteUrl() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL
    || process.env.VERCEL_PROJECT_PRODUCTION_URL
    || process.env.VERCEL_URL
    || DEFAULT_SITE_URL;

  return ensureProtocol(raw).replace(/\/+$/, "");
}

export function getSiteOrigin() {
  return new URL(getSiteUrl());
}

