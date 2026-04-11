"use client";

import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import { updateMatchAction } from "@/server/matches";
import {
  getEventIconComponent,
  getMatchIconKey,
} from "@/lib/event-icons";
import {
  Activity,
  Palette,
  Shield,
  Trophy,
  UsersRound,
} from "lucide-react";
import { useRef } from "react";

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
type MatchStatus = MatchItem["status"];

const tabMeta: Record<ActivityTab, { label: string; icon: ComponentType<{ className?: string }> }> = {
  culture: { label: "Culture", icon: Palette },
  individual: { label: "Individual Sports", icon: Trophy },
  collective: { label: "Collective Sports", icon: Shield },
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function nextStatus(status: MatchStatus): MatchStatus {
  if (status === "scheduled") return "live";
  if (status === "live") return "completed";
  return "scheduled";
}

function getStatusButtonTone(status: MatchStatus) {
  if (status === "live") {
    return "border-emerald-300/45 bg-emerald-400/15 text-emerald-100";
  }
  if (status === "completed") {
    return "border-cyan-300/45 bg-cyan-400/15 text-cyan-100";
  }
  return "border-sky-300/45 bg-sky-400/15 text-sky-100";
}

function MatchCard({
  match,
  eventTitle,
  activityType,
}: {
  match: MatchItem;
  eventTitle: string;
  activityType: SportMeta["sport_type"] | null;
}) {
  const MatchIcon = getEventIconComponent(getMatchIconKey(match.sport, match.status));
  const [status, setStatus] = useState<MatchStatus>(match.status);
  const [submitOnStatusChange, setSubmitOnStatusChange] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const usingTeams = activityType === "collective";
  const sideALabel = usingTeams ? "Team A" : "Side A";
  const sideBLabel = usingTeams ? "Team B" : "Side B";

  useEffect(() => {
    setStatus(match.status);
  }, [match.status]);

  useEffect(() => {
    if (!submitOnStatusChange) return;
    formRef.current?.requestSubmit();
    setSubmitOnStatusChange(false);
  }, [status, submitOnStatusChange]);

  function submitForm() {
    formRef.current?.requestSubmit();
  }

  return (
    <form ref={formRef} action={updateMatchAction} className="group rounded-2xl border border-cyan-200/20 bg-gradient-to-br from-[#0f1f3f] via-[#0a1737] to-[#051024] p-5 shadow-[0_20px_40px_rgba(0,0,0,0.8)] transition hover:border-cyan-200/30 hover:shadow-[0_25px_50px_rgba(0,168,228,0.15)]">
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
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="mvp_player" value={match.mvp_player ?? ""} />
      <input type="hidden" name="is_prediction_locked" value={String(match.is_prediction_locked ?? false)} />

      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-3 pb-5 border-b border-cyan-300/15">
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/25 to-cyan-400/10 border border-cyan-300/50 text-cyan-300 group-hover:from-cyan-500/35 group-hover:border-cyan-300/70 transition">
            <MatchIcon className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-white/95 truncate uppercase tracking-tight">{match.team_a} vs {match.team_b}</h3>
            <p className="mt-1.5 text-xs text-cyan-200/60 truncate">{eventTitle}</p>
          </div>
        </div>
        <div className="flex-shrink-0 flex items-center gap-2">
          <button
            type="button"
            onClick={() => alert("Player Performances Setup - Simulated Dialog")}
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/20 to-sky-600/20 border border-cyan-400/40 text-xs font-semibold text-cyan-100 transition hover:from-cyan-500/30 hover:to-sky-600/30 hover:border-cyan-300/60 active:scale-95 whitespace-nowrap"
          >
            Set Performances
          </button>
          <button
            type="button"
            onClick={() => {
              setStatus((value) => nextStatus(value));
              setSubmitOnStatusChange(true);
            }}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition ${getStatusButtonTone(status)}`}
          >
            {status}
          </button>
        </div>
      </div>

      {/* Teams & Scores */}
      <div className="grid grid-cols-2 gap-3.5 mb-5">
        {/* Team A */}
        <label className="group/input rounded-xl bg-gradient-to-br from-[#0a1d40]/50 to-[#051024]/70 border border-cyan-300/20 p-3.5 transition hover:border-cyan-300/40 hover:from-[#0c1f45]/70 hover:to-[#061128]/80">
          <div className="flex items-center gap-2.5 mb-2.5">
            <UsersRound className="h-4 w-4 text-cyan-400/70" />
            <span className="text-xs font-bold text-cyan-300/80 uppercase tracking-wider">{sideALabel}</span>
          </div>
          <input
            name="team_a"
            type="text"
            defaultValue={match.team_a}
            onBlur={submitForm}
            placeholder="Team name"
            className="block w-full mb-2.5 h-8 px-2.5 py-1 rounded-lg bg-[#051024]/60 border border-cyan-300/15 text-sm text-cyan-50 placeholder-cyan-300/25 focus:outline-none focus:border-cyan-300/60 focus:bg-[#051024]/80 transition"
          />
          <input
            name="score_a"
            type="number"
            defaultValue={match.score_a}
            onBlur={submitForm}
            placeholder="0"
            className="admin-score-input block w-full h-12 px-3 py-2 rounded-lg bg-[#051024]/60 border border-cyan-300/15 text-center text-3xl font-bold text-cyan-300 placeholder-cyan-300/25 focus:outline-none focus:border-cyan-300/60 focus:bg-[#051024]/80 transition"
          />
        </label>

        {/* Team B */}
        <label className="group/input rounded-xl bg-gradient-to-br from-[#0a1d40]/50 to-[#051024]/70 border border-cyan-300/20 p-3.5 transition hover:border-cyan-300/40 hover:from-[#0c1f45]/70 hover:to-[#061128]/80">
          <div className="flex items-center gap-2.5 mb-2.5">
            <UsersRound className="h-4 w-4 text-cyan-400/70" />
            <span className="text-xs font-bold text-cyan-300/80 uppercase tracking-wider">{sideBLabel}</span>
          </div>
          <input
            name="team_b"
            type="text"
            defaultValue={match.team_b}
            onBlur={submitForm}
            placeholder="Team name"
            className="block w-full mb-2.5 h-8 px-2.5 py-1 rounded-lg bg-[#051024]/60 border border-cyan-300/15 text-sm text-cyan-50 placeholder-cyan-300/25 focus:outline-none focus:border-cyan-300/60 focus:bg-[#051024]/80 transition"
          />
          <input
            name="score_b"
            type="number"
            defaultValue={match.score_b}
            onBlur={submitForm}
            placeholder="0"
            className="admin-score-input block w-full h-12 px-3 py-2 rounded-lg bg-[#051024]/60 border border-cyan-300/15 text-center text-3xl font-bold text-cyan-300 placeholder-cyan-300/25 focus:outline-none focus:border-cyan-300/60 focus:bg-[#051024]/80 transition"
          />
        </label>
      </div>
    </form>
  );
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
          const eventTitle = eventMap.get(match.event_id)?.title ?? "Unknown Event";
          const activityType =
            safeSports.find((sport) => sport.id === selectedActivityId)?.sport_type ?? null;

          return (
            <MatchCard
              key={match.id}
              match={match}
              eventTitle={eventTitle}
              activityType={activityType}
            />
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
