const AVATAR_COLORS = [
  "#22d3ee",
  "#38bdf8",
  "#60a5fa",
  "#818cf8",
  "#a78bfa",
  "#c084fc",
  "#e879f9",
  "#f472b6",
  "#fb7185",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
] as const;

function hashString(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function pick(seed: number, offset: number) {
  return AVATAR_COLORS[(seed + offset) % AVATAR_COLORS.length];
}

function parseHex(hex: string) {
  const clean = hex.replace("#", "");
  const value = Number.parseInt(clean, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function luminance(hex: string) {
  const { r, g, b } = parseHex(hex);
  const toLinear = (channel: number) => {
    const x = channel / 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export function createAvatarGradient(seedInput: string) {
  const seed = hashString(seedInput || "olympole");
  const c1 = pick(seed, 0);
  const c2 = pick(seed, 7);
  const c3 = pick(seed, 13);
  const angle = seed % 360;

  const backgroundImage = `linear-gradient(${angle}deg, ${c1} 0%, ${c2} 55%, ${c3} 100%)`;
  const avgLum = (luminance(c1) + luminance(c2) + luminance(c3)) / 3;
  const textColor = avgLum > 0.45 ? "#0b1220" : "#f8fafc";

  return { backgroundImage, textColor };
}
