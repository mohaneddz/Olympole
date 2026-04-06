"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check } from "lucide-react";
import { MATCH_TEAM_CONFIG, POSITION_LABELS } from "@/app/match-center/config";

type TeamView = "pitch" | "list";

type PlayerNode = {
  id: string;
  role: string;
  x: number;
  y: number;
  name: string | null;
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

const PRESELECTED_POSITIONS = new Set([1, 6, 8]);

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
      name: PRESELECTED_POSITIONS.has(index) ? "Player Name" : null,
    };
  });
}

export function PredictionTeamCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dragIdRef = useRef<string | null>(null);
  const pitchPanelRef = useRef<HTMLDivElement | null>(null);
  const listPanelRef = useRef<HTMLDivElement | null>(null);

  const [view, setView] = useState<TeamView>("pitch");
  const [playerCount, setPlayerCount] = useState<number>(MATCH_TEAM_CONFIG.defaultPlayers);
  const [players, setPlayers] = useState<PlayerNode[]>(() => buildPlayers(MATCH_TEAM_CONFIG.defaultPlayers));
  const [panelMinHeight, setPanelMinHeight] = useState<number>(0);

  useEffect(() => {
    setPlayers((current) => {
      if (current.length === playerCount) {
        return current;
      }

      const next = buildPlayers(playerCount);
      return next.map((player, index) => {
        const existing = current[index];
        if (!existing) {
          return player;
        }
        return {
          ...player,
          x: existing.x,
          y: existing.y,
          name: existing.name,
        };
      });
    });
  }, [playerCount]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    context.clearRect(0, 0, rect.width, rect.height);

    const sx = rect.width / VIRTUAL_WIDTH;
    const sy = rect.height / VIRTUAL_HEIGHT;

    const toX = (x: number) => x * sx;
    const toY = (y: number) => y * sy;

    context.fillStyle = "#1f2f69";
    context.fillRect(0, 0, rect.width, rect.height);

    context.strokeStyle = "rgba(245, 252, 255, 0.9)";
    context.lineWidth = 2;

    const outer = {
      x: 40,
      y: 56,
      w: rect.width - 80,
      h: rect.height - 120,
    };

    context.strokeRect(outer.x, outer.y, outer.w, outer.h);

    const boxW = outer.w * 0.42;
    const boxH = outer.h * 0.22;
    context.strokeRect(rect.width / 2 - boxW / 2, outer.y, boxW, boxH);

    const smallBoxW = outer.w * 0.2;
    const smallBoxH = outer.h * 0.12;
    context.strokeRect(rect.width / 2 - smallBoxW / 2, outer.y, smallBoxW, smallBoxH);

    const centerY = outer.y + outer.h;
    context.beginPath();
    context.moveTo(outer.x, centerY);
    context.lineTo(outer.x + outer.w, centerY);
    context.stroke();

    context.beginPath();
    context.arc(rect.width / 2, centerY, 95 * sx, 0, Math.PI * 2);
    context.stroke();

    const cardW = MATCH_TEAM_CONFIG.playerCardWidth * sx;
    const cardH = MATCH_TEAM_CONFIG.playerCardHeight * sy;
    const topH = cardH * 0.56;

    players.forEach((player) => {
      const x = toX(player.x) - cardW / 2;
      const y = toY(player.y) - cardH / 2;

      context.fillStyle = player.name ? "#84ec93" : "#f06db6";
      context.fillRect(x, y, cardW, topH);

      context.fillStyle = "#f0ef6e";
      context.fillRect(x, y + topH, cardW, cardH - topH);

      context.strokeStyle = "rgba(8, 31, 57, 0.18)";
      context.strokeRect(x, y, cardW, cardH);

      context.fillStyle = "#031d2d";
      context.font = `700 ${Math.max(11, 16 * sy)}px var(--font-geist-sans, sans-serif)`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(player.name ?? "Select", x + cardW / 2, y + topH / 2);

      context.font = `700 ${Math.max(10, 15 * sy)}px var(--font-geist-sans, sans-serif)`;
      context.fillText(player.role, x + cardW / 2, y + topH + (cardH - topH) / 2);
    });
  }, [players]);

  useEffect(() => {
    if (view !== "pitch") {
      return;
    }

    draw();
    const resize = () => draw();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [draw, view]);

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

  const getPoint = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * VIRTUAL_WIDTH;
    const y = ((event.clientY - rect.top) / rect.height) * VIRTUAL_HEIGHT;
    return { x, y };
  }, []);

  const onPointerDown = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
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

  const onPointerMove = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
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

  const onPointerUp = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragIdRef.current) {
      return;
    }

    dragIdRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }, []);

  const canAdd = playerCount < MATCH_TEAM_CONFIG.maxPlayers;
  const canRemove = playerCount > MATCH_TEAM_CONFIG.minPlayers;

  const playerSummary = useMemo(
    () => `Players ${playerCount} (min ${MATCH_TEAM_CONFIG.minPlayers} - max ${MATCH_TEAM_CONFIG.maxPlayers})`,
    [playerCount]
  );

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

        <div className="flex items-center justify-center gap-3 text-sm text-cyan-100">
          <button
            type="button"
            disabled={!canRemove}
            onClick={() => setPlayerCount((count) => Math.max(MATCH_TEAM_CONFIG.minPlayers, count - 1))}
            className="h-8 w-8 rounded-md border border-cyan-200/60 text-lg disabled:opacity-40"
            aria-label="Decrease players"
          >
            -
          </button>
          <span>{playerSummary}</span>
          <button
            type="button"
            disabled={!canAdd}
            onClick={() => setPlayerCount((count) => Math.min(MATCH_TEAM_CONFIG.maxPlayers, count + 1))}
            className="h-8 w-8 rounded-md border border-cyan-200/60 text-lg disabled:opacity-40"
            aria-label="Increase players"
          >
            +
          </button>
        </div>
      </div>

      <div className="relative" style={panelMinHeight > 0 ? { minHeight: `${panelMinHeight}px` } : undefined}>
        <div
          ref={pitchPanelRef}
          className={view === "pitch" ? "relative" : "absolute inset-0 opacity-0 pointer-events-none"}
          aria-hidden={view !== "pitch"}
        >
          <div className="glass-card rounded-none border border-cyan-300/25 p-3 md:p-4">
            <canvas
              ref={canvasRef}
              className="w-full touch-none bg-[#1f2f69]"
              style={{ height: `${MATCH_TEAM_CONFIG.canvasHeight}px` }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            />
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
                    <span className="text-cyan-100 text-base md:text-xl font-semibold">{player.name}</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setPlayers((current) => current.map((item) => (
                          item.id === player.id ? { ...item, name: "Player Name" } : item
                        )));
                      }}
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
