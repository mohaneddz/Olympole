"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Lock,
  Search,
  ShieldUser,
  SlidersHorizontal,
  Trophy,
} from "lucide-react";
import { PredictionForm } from "@/components/forms/PredictionForm";

type ExistingPrediction = {
  match_id: string;
  predicted_winner: string;
  predicted_score_a: number;
  predicted_score_b: number;
  predicted_mvp_player: string | null;
  stake_points: number;
};

type PredictionMatch = {
  id: string;
  sport: string | null;
  round: string | null;
  status: "scheduled" | "live" | "completed";
  team_a: string;
  team_b: string;
  starts_at: string;
  is_prediction_locked: boolean | null;
};

type LeaderboardEntry = {
  name: string;
  points: number;
};

function statusBadge(status: PredictionMatch["status"]) {
  if (status === "live") {
    return "LIVE";
  }
  if (status === "completed") {
    return "DONE";
  }
  return "UPCOMING";
}

export function PredictionsBoard({
  matches,
  leaderboard,
  user,
  userPredictions,
}: {
  matches: PredictionMatch[];
  leaderboard: LeaderboardEntry[];
  user: { id: string } | null;
  userPredictions: ExistingPrediction[];
}) {
  const [search, setSearch] = useState("");
  const [selectedSport, setSelectedSport] = useState("all");
  const [showCompleted, setShowCompleted] = useState(false);
  const [showLocked, setShowLocked] = useState(false);

  const predictionsByMatch = useMemo(
    () => new Map(userPredictions.map((prediction) => [prediction.match_id, prediction])),
    [userPredictions]
  );

  const sports = useMemo(() => {
    const unique = new Set<string>();
    for (const match of matches) {
      if (match.sport) {
        unique.add(match.sport);
      }
    }
    return ["all", ...Array.from(unique)];
  }, [matches]);

  const filteredMatches = useMemo(() => {
    const q = search.trim().toLowerCase();

    return matches.filter((match) => {
      const completed = match.status === "completed";
      const locked = Boolean(match.is_prediction_locked);
      if (!showCompleted && completed) {
        return false;
      }
      if (!showLocked && locked) {
        return false;
      }
      if (selectedSport !== "all" && match.sport !== selectedSport) {
        return false;
      }
      if (!q) {
        return true;
      }
      const haystack = `${match.team_a} ${match.team_b} ${match.round ?? ""} ${match.sport ?? ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [matches, search, selectedSport, showCompleted, showLocked]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <div className="glass-card p-4 rounded-xl border border-card-border space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search team, round, or sport"
              className="w-full h-11 pl-10 pr-3 rounded-lg border border-card-border bg-background/50 text-white"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 text-sm text-white/80">
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
            </div>
            <select
              value={selectedSport}
              onChange={(event) => setSelectedSport(event.target.value)}
              className="h-10 px-3 rounded-lg border border-card-border bg-background/50 text-white"
            >
              {sports.map((sport) => (
                <option key={sport} value={sport}>
                  {sport === "all" ? "All sports" : sport}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowCompleted((prev) => !prev)}
              className={`h-10 px-3 rounded-lg border text-sm inline-flex items-center gap-1.5 ${
                showCompleted
                  ? "border-primary/60 bg-primary/20 text-white"
                  : "border-card-border bg-background/40 text-white/80"
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              Completed
            </button>
            <button
              type="button"
              onClick={() => setShowLocked((prev) => !prev)}
              className={`h-10 px-3 rounded-lg border text-sm inline-flex items-center gap-1.5 ${
                showLocked
                  ? "border-primary/60 bg-primary/20 text-white"
                  : "border-card-border bg-background/40 text-white/80"
              }`}
            >
              <Lock className="h-4 w-4" />
              Locked
            </button>
          </div>
        </div>

        {filteredMatches.length === 0 ? (
          <div className="glass-card p-6 rounded-xl border border-card-border">
            No matches found with current filters.
          </div>
        ) : (
          filteredMatches.map((match) => {
            const isLocked = match.status === "completed" || Boolean(match.is_prediction_locked);
            return (
              <div key={match.id} className="glass-card p-5 rounded-xl border border-card-border space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/75 uppercase tracking-wide">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    <span>{match.sport ?? "Sport"}</span>
                    <span>•</span>
                    <span>{match.round ?? "Match"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isLocked ? <Lock className="h-4 w-4 text-red-300" /> : null}
                    <span>{statusBadge(match.status)}</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-center text-white">
                  {match.team_a} vs {match.team_b}
                </h3>
                {user ? (
                  <PredictionForm
                    matchId={match.id}
                    teamA={match.team_a}
                    teamB={match.team_b}
                    isLocked={isLocked}
                    existingPrediction={predictionsByMatch.get(match.id)}
                  />
                ) : (
                  <p className="text-sm text-white/80 text-center">
                    <ShieldUser className="h-4 w-4 inline mr-1" />
                    <Link href="/login" className="text-primary">
                      Login
                    </Link>{" "}
                    to submit predictions.
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="glass-card p-6 rounded-xl border border-card-border">
        <h3 className="text-xl font-bold mb-4 text-white">Leaderboard</h3>
        <div className="space-y-3">
          {leaderboard.length === 0 ? (
            <p className="text-sm text-white/70">No scored predictions yet.</p>
          ) : (
            leaderboard.map((entry, index) => (
              <div
                key={`${entry.name}-${index}`}
                className="flex justify-between p-2 rounded bg-background border border-card-border"
              >
                <span className="text-white">#{index + 1} {entry.name}</span>
                <span className="text-primary">{entry.points} pts</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
