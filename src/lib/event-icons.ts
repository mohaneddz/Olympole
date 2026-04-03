import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

type IconLibrary = Record<string, unknown>;

const iconLibrary = LucideIcons as IconLibrary;

function isLucideComponent(value: unknown): value is LucideIcon {
  return typeof value === "function";
}

function collectAvailableIconNames(limit = 220) {
  const names = Object.keys(iconLibrary)
    .filter((name) => /^[A-Z][A-Za-z0-9]*$/.test(name))
    .filter((name) => isLucideComponent(iconLibrary[name]))
    .filter((name) => !name.includes("Icon"))
    .sort((a, b) => a.localeCompare(b))
    .slice(0, limit);

  return names.length > 0 ? names : ["Trophy"];
}

export const EVENT_ICON_KEYS = collectAvailableIconNames();
export const DEFAULT_EVENT_ICON_KEY = "Trophy";

const EVENT_ICON_SET = new Set<string>(EVENT_ICON_KEYS);

export function normalizeEventIconKey(value: FormDataEntryValue | string | null | undefined) {
  const iconKey = typeof value === "string" ? value.trim() : "";
  if (!iconKey) return DEFAULT_EVENT_ICON_KEY;
  return EVENT_ICON_SET.has(iconKey) ? iconKey : DEFAULT_EVENT_ICON_KEY;
}

export function getEventIconComponent(iconKey: string | null | undefined): LucideIcon {
  const safeKey = normalizeEventIconKey(iconKey);
  const component = iconLibrary[safeKey];
  if (isLucideComponent(component)) {
    return component;
  }
  return LucideIcons.Trophy;
}

export function getNextEventIconKey(currentIconKey: string | null | undefined) {
  const normalized = normalizeEventIconKey(currentIconKey);
  const index = EVENT_ICON_KEYS.indexOf(normalized);
  const nextIndex = index >= 0 ? (index + 1) % EVENT_ICON_KEYS.length : 0;
  return EVENT_ICON_KEYS[nextIndex] ?? DEFAULT_EVENT_ICON_KEY;
}

function pickFirstAvailableIcon(candidates: string[]) {
  for (const candidate of candidates) {
    if (EVENT_ICON_SET.has(candidate)) {
      return candidate;
    }
  }
  return DEFAULT_EVENT_ICON_KEY;
}

export function getMatchIconKey(sport: string, status: string) {
  const normalized = sport.toLowerCase();
  if (normalized.includes("foot")) return pickFirstAvailableIcon(["Goal", "Shield"]);
  if (normalized.includes("basket")) return pickFirstAvailableIcon(["Dribbble", "Circle"]);
  if (normalized.includes("hand")) return pickFirstAvailableIcon(["Hand", "Handshake"]);
  if (normalized.includes("volley")) return pickFirstAvailableIcon(["CircleDot", "Circle"]);
  if (normalized.includes("tennis")) return pickFirstAvailableIcon(["Racket", "Target"]);
  if (normalized.includes("chess")) return pickFirstAvailableIcon(["Blocks", "Puzzle"]);
  if (normalized.includes("swim")) return pickFirstAvailableIcon(["Waves", "Droplets"]);
  if (status === "live") return pickFirstAvailableIcon(["Flame", "Zap"]);
  if (status === "completed") return pickFirstAvailableIcon(["Flag", "BadgeCheck"]);
  return pickFirstAvailableIcon(["Target", "CircleDot"]);
}
