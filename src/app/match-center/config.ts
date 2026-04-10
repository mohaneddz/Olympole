const DEFAULT_FANTASY_PLAYER_COUNT = 8;

function resolveFantasyPlayerCount() {
  const raw = process.env.NEXT_PUBLIC_FANTASY_NUMBER;
  const parsed = Number.parseInt(raw ?? "", 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return DEFAULT_FANTASY_PLAYER_COUNT;
  }

  return parsed;
}

const fantasyPlayerCount = resolveFantasyPlayerCount();

export const MATCH_TEAM_CONFIG = {
  minPlayers: fantasyPlayerCount,
  maxPlayers: fantasyPlayerCount,
  defaultPlayers: fantasyPlayerCount,
  canvasHeight: 980,
  playerCardWidth: 132,
  playerCardHeight: 54,
} as const;

export const POSITION_LABELS = [
  "GK",
  "RB",
  "RCB",
  "LCB",
  "LB",
  "RDM",
  "LDM",
  "CM",
  "RW",
  "LW",
  "ST",
  "SUB",
  "SUB",
  "SUB",
  "SUB",
  "SUB",
  "SUB",
  "SUB",
] as const;
