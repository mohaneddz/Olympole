"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check } from "lucide-react";
import type { FantasyRegisteredPlayer } from "@/lib/queries";
import { MATCH_TEAM_CONFIG, POSITION_LABELS } from "@/app/match-center/config";

type TeamView = "pitch" | "list";

type PlayerNode = {
  id: string;
  role: string;
  x: number;
  y: number;
  selectedPlayerId: string | null;
  name: string | null;
  avatarUrl: string | null;
  score: number;
};

const VIRTUAL_WIDTH = 1000;
const VIRTUAL_HEIGHT = 1120;

const FORMATION_11: Array<{ x: number; y: number }> = [
  { x: 500, y: 142 },
  { x: 170, y: 420 },
  { x: 365, y: 300 },
  { x: 565, y: 300 },
  { x: 805, y: 405 },
  { x: 365, y: 565 },
  { x: 565, y: 565 },
  { x: 500, y: 715 },
  { x: 230, y: 885 },
  { x: 730, y: 875 },
  { x: 500, y: 1030 },
];

type SelectionRoleBucket = "goal" | "field";

function roleLabel(role: string) {
  const map: Record<string, string> = {
    GK: "Goalkeeper",
    RB: "Right Back",
    RCB: "Right Center Back",
    LCB: "Left Center Back",
    LB: "Left Back",
    RDM: "Right Defensive Midfielder",
    LDM: "Left Defensive Midfielder",
    CM: "Central Midfielder",
    RW: "Right Wing",
    LW: "Left Wing",
    ST: "Striker",
    SUB: "Substitute",
  };
  return map[role] ?? role;
}

function selectionBucketForRole(role: string): SelectionRoleBucket {
  return role.toUpperCase() === "GK" ? "goal" : "field";
}

function bucketLabel(bucket: SelectionRoleBucket) {
  return bucket === "goal" ? "Goalkeepers" : "Field Players";
}

function initialsFromName(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "P";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

function fallbackPosition(index: number, count: number) {
  const base = FORMATION_11[index] ?? {
    x: 160 + ((index % 4) * 210),
    y: 1010 - (Math.floor(index / 4) * 90),
  };

  if (count <= 11) {
    return base;
  }

  if (index < 11) {
    return base;
  }

  const benchIndex = index - 11;
  const benchTotal = count - 11;
  return {
    x: ((benchIndex + 1) * VIRTUAL_WIDTH) / (benchTotal + 1),
    y: 1062,
  };
}

function buildPlayers(count: number): PlayerNode[] {
  return Array.from({ length: count }, (_, index) => {
    const role = POSITION_LABELS[index] ?? `P${index + 1}`;
    const pos = fallbackPosition(index, count);

    return {
      id: `player-${index + 1}`,
      role,
      x: pos.x,
      y: pos.y,
      selectedPlayerId: null,
      name: null,
      avatarUrl: null,
      score: 0,
    };
  });
}

export function PredictionTeamCanvas({ availablePlayers }: { availablePlayers: FantasyRegisteredPlayer[] }) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragIdRef = useRef<string | null>(null);
  const pitchPanelRef = useRef<HTMLDivElement | null>(null);
  const listPanelRef = useRef<HTMLDivElement | null>(null);

  const [view, setView] = useState<TeamView>("pitch");
  const playerCount = MATCH_TEAM_CONFIG.defaultPlayers;
  const [players, setPlayers] = useState<PlayerNode[]>(() => buildPlayers(MATCH_TEAM_CONFIG.defaultPlayers));
  const [panelMinHeight, setPanelMinHeight] = useState<number>(0);
  const [pickerOpenForPlayerId, setPickerOpenForPlayerId] = useState<string | null>(null);

  useEffect(() => {
    const measure = () => {
      const pitchHeight = pitchPanelRef.current?.offsetHeight ?? 0;
      const listHeight = listPanelRef.current?.offsetHeight ?? 0;
      setPanelMinHeight(Math.max(pitchHeight, listHeight));
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [view, players, playerCount]);

  const getPoint = useCallback((event: React.PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * VIRTUAL_WIDTH;
    const y = ((event.clientY - rect.top) / rect.height) * VIRTUAL_HEIGHT;
    return { x, y };
  }, []);

  const onPointerDown = useCallback((event: React.PointerEvent<SVGSVGElement>) => {
    const { x, y } = getPoint(event);
    const halfW = MATCH_TEAM_CONFIG.playerCardWidth / 2;
    const halfH = MATCH_TEAM_CONFIG.playerCardHeight / 2;

    const hit = [...players].reverse().find((player) => (
      x >= player.x - halfW
      && x <= player.x + halfW
      && y >= player.y - halfH
      && y <= player.y + halfH
    ));

    if (!hit) {
      return;
    }

    dragIdRef.current = hit.id;
    event.currentTarget.setPointerCapture(event.pointerId);
  }, [getPoint, players]);

  const onPointerMove = useCallback((event: React.PointerEvent<SVGSVGElement>) => {
    const activeId = dragIdRef.current;
    if (!activeId) {
      return;
    }

    const { x, y } = getPoint(event);
    const halfW = MATCH_TEAM_CONFIG.playerCardWidth / 2;
    const halfH = MATCH_TEAM_CONFIG.playerCardHeight / 2;

    setPlayers((current) => current.map((player) => {
      if (player.id !== activeId) {
        return player;
      }

      return {
        ...player,
        x: Math.max(48 + halfW, Math.min(VIRTUAL_WIDTH - 48 - halfW, x)),
        y: Math.max(82 + halfH, Math.min(VIRTUAL_HEIGHT - 90 - halfH, y)),
      };
    }));
  }, [getPoint]);

  const onPointerUp = useCallback((event: React.PointerEvent<SVGSVGElement>) => {
    if (!dragIdRef.current) {
      return;
    }

    dragIdRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }, []);

  const playerSummary = `Players ${playerCount}`;
  const pickerTarget = useMemo(
    () => players.find((player) => player.id === pickerOpenForPlayerId) ?? null,
    [players, pickerOpenForPlayerId]
  );
  const pickerBucket = pickerTarget ? selectionBucketForRole(pickerTarget.role) : null;
  const selectableCandidates = useMemo(() => {
    if (!pickerBucket) {
      return [];
    }

    const usedIds = new Set(
      players
        .filter((player) => player.id !== pickerOpenForPlayerId)
        .map((player) => player.selectedPlayerId)
        .filter(Boolean)
    );

    return availablePlayers.filter((candidate) => (
      candidate.role_bucket === pickerBucket && !usedIds.has(candidate.id)
    ));
  }, [availablePlayers, pickerBucket, players, pickerOpenForPlayerId]);

  const outer = useMemo(() => ({
    x: 40,
    y: 56,
    w: VIRTUAL_WIDTH - 80,
    h: VIRTUAL_HEIGHT - 120,
  }), []);
  const boxW = outer.w * 0.42;
  const boxH = outer.h * 0.22;
  const smallBoxW = outer.w * 0.2;
  const smallBoxH = outer.h * 0.12;
  const centerY = outer.y + outer.h;
  const cardW = MATCH_TEAM_CONFIG.playerCardWidth;
  const cardH = MATCH_TEAM_CONFIG.playerCardHeight;
  const topH = cardH * 0.56;
  const choosePlayer = useCallback((candidate: FantasyRegisteredPlayer) => {
    if (!pickerOpenForPlayerId) {
      return;
    }

    setPlayers((current) => current.map((item) => (
      item.id === pickerOpenForPlayerId
        ? {
          ...item,
          selectedPlayerId: candidate.id,
          name: candidate.name,
          avatarUrl: candidate.avatar_url,
          score: candidate.current_score,
        }
        : item
    )));

    setPickerOpenForPlayerId(null);
  }, [pickerOpenForPlayerId]);

  return (
    <section id="team" className="space-y-8">
      <div className="mx-auto max-w-4xl text-center space-y-4">
        <h2 className="text-4xl md:text-5xl font-extrabold text-white">
          Create Your Football <span className="text-primary">Team</span>
        </h2>
        <p className="text-base md:text-3xl text-white/85 max-w-3xl mx-auto">
          Make the best team of actual Olympole Football players and get the best score possible
        </p>

        <div className="mx-auto w-full max-w-4xl rounded-2xl border border-cyan-300/65 bg-[#202f68] p-1.5 grid grid-cols-2">
          <button
            type="button"
            onClick={() => setView("pitch")}
            className={`rounded-xl py-3 text-lg font-bold transition ${view === "pitch" ? "bg-[#84d4e8] text-[#061a2d]" : "text-white"}`}
          >
            Pitch View
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            className={`rounded-xl py-3 text-lg font-bold transition ${view === "list" ? "bg-[#84d4e8] text-[#061a2d]" : "text-white"}`}
          >
            List View
          </button>
        </div>

        <div className="flex items-center justify-center text-sm text-cyan-100">
          <span>{playerSummary}</span>
        </div>
      </div>

      <div className="relative" style={panelMinHeight > 0 ? { minHeight: `${panelMinHeight}px` } : undefined}>
        <div
          ref={pitchPanelRef}
          className={view === "pitch" ? "relative" : "absolute inset-0 opacity-0 pointer-events-none"}
          aria-hidden={view !== "pitch"}
        >
          <div className="glass-card rounded-none border border-cyan-300/25 p-3 md:p-4">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${VIRTUAL_WIDTH} ${VIRTUAL_HEIGHT}`}
              preserveAspectRatio="none"
              className="w-full touch-none bg-[#1f2f69] select-none"
              style={{ height: `${MATCH_TEAM_CONFIG.canvasHeight}px` }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              <rect x={0} y={0} width={VIRTUAL_WIDTH} height={VIRTUAL_HEIGHT} fill="#1f2f69" />
              <rect x={outer.x} y={outer.y} width={outer.w} height={outer.h} fill="none" stroke="rgba(245,252,255,0.9)" strokeWidth={2} />
              <rect x={VIRTUAL_WIDTH / 2 - boxW / 2} y={outer.y} width={boxW} height={boxH} fill="none" stroke="rgba(245,252,255,0.9)" strokeWidth={2} />
              <rect x={VIRTUAL_WIDTH / 2 - smallBoxW / 2} y={outer.y} width={smallBoxW} height={smallBoxH} fill="none" stroke="rgba(245,252,255,0.9)" strokeWidth={2} />
              <line x1={outer.x} y1={centerY} x2={outer.x + outer.w} y2={centerY} stroke="rgba(245,252,255,0.9)" strokeWidth={2} />
              <circle cx={VIRTUAL_WIDTH / 2} cy={centerY} r={95} fill="none" stroke="rgba(245,252,255,0.9)" strokeWidth={2} />

              {players.map((player) => {
                const x = player.x - cardW / 2;
                const y = player.y - cardH / 2;
                return (
                  <g key={player.id}>
                    <rect x={x} y={y} width={cardW} height={topH} fill={player.name ? "#84ec93" : "#f06db6"} />
                    <rect x={x} y={y + topH} width={cardW} height={cardH - topH} fill="#f0ef6e" />
                    <rect x={x} y={y} width={cardW} height={cardH} fill="none" stroke="rgba(8,31,57,0.18)" />
                    <text
                      x={x + cardW / 2}
                      y={y + topH / 2}
                      fill="#031d2d"
                      fontSize={16}
                      fontWeight={700}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {player.name ?? "Select"}
                    </text>
                    <text
                      x={x + cardW / 2}
                      y={y + topH + (cardH - topH) / 2}
                      fill="#031d2d"
                      fontSize={15}
                      fontWeight={700}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {player.role}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        <div
          ref={listPanelRef}
          className={view === "list" ? "relative space-y-4" : "absolute inset-0 opacity-0 pointer-events-none space-y-4"}
          aria-hidden={view !== "list"}
        >
          {players.map((player) => {
            const selected = Boolean(player.name);
            return (
              <div
                key={player.id}
                className="grid grid-cols-[18px_1fr_auto] items-center rounded-lg overflow-hidden border border-cyan-300/20 bg-[#1e2f69]"
              >
                <div className={`h-full ${selected ? "bg-[#87ec93]" : "bg-[#f06db6]"}`} />
                <div className="px-5 py-4 text-white text-base md:text-2xl font-semibold flex items-center gap-2">
                  {selected ? <Check className="h-5 w-5 text-cyan-200" /> : null}
                  <span>{roleLabel(player.role)}</span>
                </div>
                <div className="px-5 py-3">
                  {selected ? (
                    <div className="flex items-center gap-3">
                      {player.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={player.avatarUrl}
                          alt={player.name ?? "Selected player"}
                          className="h-10 w-10 rounded-full object-cover border border-cyan-200/40"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-200/40 bg-[#102457] text-sm font-bold text-cyan-100">
                          {initialsFromName(player.name ?? "Player")}
                        </div>
                      )}
                      <div className="text-left">
                        <p className="text-cyan-100 text-base md:text-xl font-semibold leading-tight">{player.name}</p>
                        <p className="text-cyan-200/80 text-xs md:text-sm">{player.score} pts</p>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPickerOpenForPlayerId(player.id)}
                      className="h-10 min-w-36 rounded-lg border border-cyan-300/70 px-4 text-base font-bold text-white"
                    >
                      SELECT
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {pickerOpenForPlayerId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]/70 px-4">
          <div className="w-full max-w-3xl rounded-2xl border border-cyan-300/30 bg-[#0b1537] p-5 md:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-white">
                  Select {bucketLabel(pickerBucket ?? "field")}
                </h3>
                <p className="text-sm text-cyan-100/80">
                  Role slot: <span className="font-semibold">{pickerTarget?.role ?? "-"}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPickerOpenForPlayerId(null)}
                className="rounded-md border border-cyan-300/40 px-3 py-1.5 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/10"
              >
                Close
              </button>
            </div>

            {selectableCandidates.length === 0 ? (
              <div className="rounded-xl border border-cyan-300/20 bg-[#10204b] p-5 text-center text-cyan-100/80">
                No available players for this role.
              </div>
            ) : (
              <div className="max-h-[26rem] space-y-3 overflow-auto pr-1">
                {selectableCandidates.map((candidate) => (
                  <button
                    key={candidate.id}
                    type="button"
                    onClick={() => choosePlayer(candidate)}
                    className="w-full rounded-xl border border-cyan-300/20 bg-[#10204b] p-3 text-left transition hover:border-cyan-300/60 hover:bg-[#15306e]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {candidate.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={candidate.avatar_url}
                            alt={candidate.name}
                            className="h-12 w-12 rounded-full object-cover border border-cyan-200/40"
                          />
                        ) : (
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-cyan-200/40 bg-[#0f265a] text-sm font-bold text-cyan-100">
                            {initialsFromName(candidate.name)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-base md:text-lg font-semibold text-white">{candidate.name}</p>
                          <p className="truncate text-xs md:text-sm text-cyan-100/80">{candidate.email ?? "No email"}</p>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-base md:text-lg font-bold text-cyan-200">{candidate.current_score} pts</p>
                        <p className="text-xs text-cyan-100/75">{candidate.preferred_role ?? "Field player"}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}

      <div className="text-center">
        <button
          type="button"
          className="min-w-72 rounded-2xl border border-cyan-300/80 bg-[#0e1b46] px-8 py-4 text-2xl font-bold text-white hover:bg-cyan-300 hover:text-[#081936] transition"
        >
          Save Your Team
        </button>
      </div>
    </section>
  );
}
