"use client";

import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import {
  scoreMatchPredictionsAction,
  updateMatchAction,
} from "@/app/actions/events";
import {
  getEventIconComponent,
  getMatchIconKey,
} from "@/lib/event-icons";
import { Layers3, Palette, Shield, Trophy } from "lucide-react";

type MatchItem = {
  id: string;
  event_id: string;
  sport: string;
  team_a: string;
  team_b: string;
  score_a: number;
  score_b: number;
  status: "scheduled" | "live" | "completed";
  round: string;
  venue: string;
  starts_at: string;
  team_a_id: string | null;
  team_b_id: string | null;
  event_phase: string | null;
  mvp_player: string | null;
  is_prediction_locked: boolean | null;
  notes: string | null;
};

type EventMeta = {
  id: string;
  title: string;
  type: "sport" | "culture" | "ceremony" | "mini_game";
  sport_id: string | null;
};

type SportMeta = {
  id: string;
  name: string;
  sport_type: "collective" | "individual" | "culture";
};

type ActivityTab = "culture" | "individual" | "collective";

function getStatusTone(status: string) {
  if (status === "live") {
    return "border-emerald-300/35 bg-emerald-400/10 text-emerald-100";
  }
  if (status === "completed") {
    return "border-cyan-300/35 bg-cyan-400/10 text-cyan-100";
  }
  if (status === "scheduled") {
    return "border-sky-300/35 bg-sky-400/10 text-sky-100";
  }
  return "border-white/15 bg-white/5 text-white/80";
}

const tabMeta: Record<ActivityTab, { label: string; icon: ComponentType<{ className?: string }> }> = {
  culture: { label: "Culture", icon: Palette },
  individual: { label: "Individual Sports", icon: Trophy },
  collective: { label: "Collective Sports", icon: Shield },
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function MatchesManagementBoard({
  matches,
  events,
  sports,
}: {
  matches?: MatchItem[] | null;
  events?: EventMeta[] | null;
  sports?: SportMeta[] | null;
}) {
  const safeMatches = matches ?? [];
  const safeEvents = events ?? [];
  const safeSports = sports ?? [];

  const [activeTab, setActiveTab] = useState<ActivityTab>("collective");
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);

  const eventMap = useMemo(
    () => new Map(safeEvents.map((event) => [event.id, event])),
    [safeEvents]
  );

  const activitiesForTab = useMemo(
    () => safeSports.filter((sport) => sport.sport_type === activeTab),
    [activeTab, safeSports]
  );

  useEffect(() => {
    if (!activitiesForTab.length) {
      setSelectedActivityId(null);
      return;
    }
    if (!selectedActivityId || !activitiesForTab.some((activity) => activity.id === selectedActivityId)) {
      setSelectedActivityId(activitiesForTab[0]?.id ?? null);
    }
  }, [activitiesForTab, selectedActivityId]);

  const matchCountsByActivity = useMemo(() => {
    const counts = new Map<string, number>();
    for (const activity of safeSports) counts.set(activity.id, 0);

    for (const match of safeMatches) {
      const event = eventMap.get(match.event_id);
      if (event?.sport_id && counts.has(event.sport_id)) {
        counts.set(event.sport_id, (counts.get(event.sport_id) ?? 0) + 1);
        continue;
      }

      const byName = safeSports.find((sport) => normalize(sport.name) === normalize(match.sport));
      if (byName) {
        counts.set(byName.id, (counts.get(byName.id) ?? 0) + 1);
      }
    }
    return counts;
  }, [eventMap, safeMatches, safeSports]);

  const visibleMatches = useMemo(() => {
    if (!selectedActivityId) return [];

    const selectedActivity = safeSports.find((sport) => sport.id === selectedActivityId);
    if (!selectedActivity) return [];

    return safeMatches.filter((match) => {
      const event = eventMap.get(match.event_id);
      if (event?.sport_id) return event.sport_id === selectedActivityId;
      return normalize(match.sport) === normalize(selectedActivity.name);
    });
  }, [eventMap, safeMatches, selectedActivityId, safeSports]);

  const activityGridClass =
    activitiesForTab.length === 5
      ? "grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-5"
      : "grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4";

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-cyan-200/15 bg-[linear-gradient(160deg,rgba(10,22,54,0.84),rgba(6,13,34,0.92))] p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100/70">
          Choose Program
        </p>

        <div className="mb-4 flex flex-wrap gap-2">
          {(Object.keys(tabMeta) as ActivityTab[]).map((tab) => {
            const Icon = tabMeta[tab].icon;
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={[
                  "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition",
                  isActive
                    ? "border-cyan-200/60 bg-cyan-400/20 text-cyan-50"
                    : "border-cyan-300/25 bg-cyan-400/5 text-cyan-100/80 hover:bg-cyan-400/12",
                ].join(" ")}
              >
                <Icon className="h-4 w-4" />
                {tabMeta[tab].label}
              </button>
            );
          })}
        </div>

        <div className={activityGridClass}>
          {activitiesForTab.map((activity) => {
            const isActive = activity.id === selectedActivityId;
            return (
              <button
                key={activity.id}
                type="button"
                onClick={() => setSelectedActivityId(activity.id)}
                className={[
                  "rounded-xl border p-3 text-left transition",
                  isActive
                    ? "border-cyan-200/60 bg-cyan-400/20"
                    : "border-cyan-300/20 bg-[#071733]/80 hover:bg-[#0c1d43]",
                ].join(" ")}
              >
                <p className="font-semibold text-cyan-50">{activity.name}</p>
                <p className="mt-1 text-xs text-cyan-100/70">
                  {(matchCountsByActivity.get(activity.id) ?? 0)} matches
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        {visibleMatches.map((match) => {
          const MatchIcon = getEventIconComponent(getMatchIconKey(match.sport, match.status));
          const eventTitle = eventMap.get(match.event_id)?.title ?? "Unknown Event";

          return (
            <form key={match.id} action={updateMatchAction} className="rounded-xl border border-cyan-200/15 bg-[linear-gradient(160deg,rgba(10,22,54,0.84),rgba(6,13,34,0.92))] p-3 shadow-[0_8px_20px_rgba(2,10,28,0.36)]">
            <input type="hidden" name="id" value={match.id} />
            <input type="hidden" name="match_id" value={match.id} />
            <input type="hidden" name="event_id" value={match.event_id} />
            <input type="hidden" name="sport" value={match.sport} />
            <input type="hidden" name="team_a" value={match.team_a} />
            <input type="hidden" name="team_b" value={match.team_b} />
            <input type="hidden" name="team_a_id" value={match.team_a_id ?? ""} />
            <input type="hidden" name="team_b_id" value={match.team_b_id ?? ""} />
            <input type="hidden" name="round" value={match.round} />
            <input type="hidden" name="venue" value={match.venue} />
            <input type="hidden" name="starts_at" value={new Date(match.starts_at).toISOString()} />
            <input type="hidden" name="event_phase" value={match.event_phase ?? "group"} />
            <input type="hidden" name="notes" value={match.notes ?? ""} />

            <div className="mb-2 flex flex-wrap items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-400/10 text-cyan-100">
                <MatchIcon className="h-4 w-4" />
              </span>
              <div className="flex-1">
                <p className="font-semibold leading-tight text-white">{match.team_a} vs {match.team_b}</p>
                <div className="mt-1 flex flex-wrap gap-1.5 text-[11px]">
                  <span className="rounded-md border border-white/15 bg-white/5 px-2 py-1 text-white/70">{eventTitle}</span>
                  <span className="rounded-md border border-white/15 bg-white/5 px-2 py-1 text-white/70">{match.sport}</span>
                  <span className={`rounded-md border px-2 py-1 ${getStatusTone(match.status)}`}>{match.status}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <div className="rounded-lg border border-cyan-200/15 bg-[#071733]/80 p-2.5">
                  <p className="mb-1.5 text-[10px] uppercase tracking-[0.14em] text-cyan-100/65">Score</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="mb-1 truncate text-[11px] text-cyan-100/70">{match.team_a}</p>
                      <input name="score_a" type="number" defaultValue={match.score_a} className="admin-score-input h-9 w-full rounded-md border border-cyan-200/20 bg-[#0a1737] px-2 text-cyan-50" />
                    </div>
                    <div>
                      <p className="mb-1 truncate text-[11px] text-cyan-100/70">{match.team_b}</p>
                      <input name="score_b" type="number" defaultValue={match.score_b} className="admin-score-input h-9 w-full rounded-md border border-cyan-200/20 bg-[#0a1737] px-2 text-cyan-50" />
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-cyan-200/15 bg-[#071733]/80 p-2.5">
                  <p className="mb-1.5 text-[10px] uppercase tracking-[0.14em] text-cyan-100/65">Status</p>
                  <select name="status" defaultValue={match.status} className="h-9 w-full rounded-md border border-cyan-200/20 bg-[#0a1737] px-2 text-cyan-50">
                    <option value="scheduled">scheduled</option>
                    <option value="live">live</option>
                    <option value="completed">completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <div className="rounded-lg border border-cyan-200/15 bg-[#071733]/80 p-2.5">
                  <p className="mb-1.5 text-[10px] uppercase tracking-[0.14em] text-cyan-100/65">MVP</p>
                  <input name="mvp_player" defaultValue={match.mvp_player ?? ""} placeholder="MVP player" className="h-9 w-full rounded-md border border-cyan-200/20 bg-[#0a1737] px-2 text-cyan-50" />
                </div>

                <div className="rounded-lg border border-cyan-200/15 bg-[#071733]/80 p-2.5">
                  <p className="mb-1.5 text-[10px] uppercase tracking-[0.14em] text-cyan-100/65">Predictions</p>
                  <select name="is_prediction_locked" defaultValue={String(match.is_prediction_locked)} className="h-9 w-full rounded-md border border-cyan-200/20 bg-[#0a1737] px-2 text-cyan-50">
                    <option value="false">predictions open</option>
                    <option value="true">predictions locked</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <button className="h-9 rounded-md border border-cyan-300/35 bg-cyan-400/10 px-3 text-sm text-cyan-100 transition hover:bg-cyan-400/20">
                  Save
                </button>
                <button formAction={scoreMatchPredictionsAction} className="h-9 rounded-md border border-amber-300/35 bg-amber-300/10 px-3 text-sm text-amber-100 transition hover:bg-amber-300/20">
                  Score Picks
                </button>
              </div>
            </div>
          </form>
        );
        })}
      </div>

      {!activitiesForTab.length ? (
        <div className="rounded-2xl border border-cyan-200/15 bg-[#06142f]/70 p-8 text-center text-cyan-100/75">
          No activities are configured for this tab yet.
        </div>
      ) : null}

      {activitiesForTab.length > 0 && visibleMatches.length === 0 ? (
        <div className="rounded-2xl border border-cyan-200/15 bg-[#06142f]/70 p-8 text-center text-cyan-100/75">
          No matches found for the selected activity.
        </div>
      ) : null}
    </div>
  );
}
