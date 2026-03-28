"use client";

import { useActionState, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Coins, Crosshair, Minus, Target, User } from "lucide-react";
import { submitPredictionAction } from "@/app/actions/predictions";
import { Button } from "@/components/ui/Button";

const initialState = { ok: false, message: "" };

type ExistingPrediction = {
  predicted_winner: string;
  predicted_score_a: number;
  predicted_score_b: number;
  predicted_mvp_player: string | null;
  stake_points: number;
};

export function PredictionForm({
  matchId,
  teamA,
  teamB,
  isLocked,
  existingPrediction,
}: {
  matchId: string;
  teamA: string;
  teamB: string;
  isLocked: boolean;
  existingPrediction?: ExistingPrediction;
}) {
  const [state, formAction, pending] = useActionState(submitPredictionAction, initialState);
  const [winner, setWinner] = useState(existingPrediction?.predicted_winner ?? "");

  const mvpOptions = useMemo(
    () =>
      [
        { label: "Skip MVP pick", value: "" },
        { label: `${teamA} - Star Player`, value: `${teamA} Star` },
        { label: `${teamA} - Captain`, value: `${teamA} Captain` },
        { label: `${teamB} - Star Player`, value: `${teamB} Star` },
        { label: `${teamB} - Captain`, value: `${teamB} Captain` },
      ] as const,
    [teamA, teamB]
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="match_id" value={matchId} />
      <input type="hidden" name="predicted_winner" value={winner} required />

      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          disabled={isLocked || pending}
          onClick={() => setWinner(teamA)}
          className={`h-12 rounded-md border flex items-center justify-center gap-1.5 text-sm font-semibold transition ${
            winner === teamA
              ? "border-blue-300 bg-blue-500/35 text-white shadow-[0_0_16px_rgba(59,130,246,0.6)]"
              : "border-card-border bg-blue-500/10 text-white/80"
          }`}
        >
          <ArrowLeft className="h-4 w-4" />
          {teamA}
        </button>
        <button
          type="button"
          disabled={isLocked || pending}
          onClick={() => setWinner("DRAW")}
          className={`h-12 rounded-md border flex items-center justify-center gap-1.5 text-sm font-semibold transition ${
            winner === "DRAW"
              ? "border-white/60 bg-white/20 text-white"
              : "border-card-border bg-background/50 text-white/80"
          }`}
        >
          <Minus className="h-4 w-4" />
          Draw
        </button>
        <button
          type="button"
          disabled={isLocked || pending}
          onClick={() => setWinner(teamB)}
          className={`h-12 rounded-md border flex items-center justify-center gap-1.5 text-sm font-semibold transition ${
            winner === teamB
              ? "border-red-300 bg-red-500/35 text-white shadow-[0_0_16px_rgba(239,68,68,0.55)]"
              : "border-card-border bg-red-500/10 text-white/80"
          }`}
        >
          {teamB}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input
          type="number"
          min="0"
          name="predicted_score_a"
          aria-label={`${teamA} score`}
          defaultValue={existingPrediction?.predicted_score_a ?? 0}
          className="h-10 px-3 rounded border border-card-border bg-background/50 text-white"
          disabled={isLocked || pending}
        />
        <input
          type="number"
          min="0"
          name="predicted_score_b"
          aria-label={`${teamB} score`}
          defaultValue={existingPrediction?.predicted_score_b ?? 0}
          className="h-10 px-3 rounded border border-card-border bg-background/50 text-white"
          disabled={isLocked || pending}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-3">
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70" />
          <select
            name="predicted_mvp_player"
            defaultValue={existingPrediction?.predicted_mvp_player ?? ""}
            className="h-10 w-full pl-9 pr-3 rounded border border-card-border bg-background/50 text-white"
            disabled={isLocked || pending}
          >
            {mvpOptions.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="relative">
          <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70" />
          <select
            name="stake_points"
            defaultValue={String(existingPrediction?.stake_points ?? 1)}
            className="h-10 w-full pl-9 pr-3 rounded border border-card-border bg-background/50 text-white"
            disabled={isLocked || pending}
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => (
              <option key={value} value={value}>
                {value}x
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-white/75">
        <Target className="h-3.5 w-3.5" />
        <span>Scores</span>
        <Crosshair className="h-3.5 w-3.5 ml-2" />
        <span>MVP</span>
      </div>

      <Button type="submit" variant="outline" disabled={isLocked || pending || !winner}>
        {isLocked ? "Locked" : pending ? "Saving..." : "Save"}
      </Button>
      {state.message ? (
        <p className={state.ok ? "text-green-400 text-xs" : "text-red-400 text-xs"}>{state.message}</p>
      ) : null}
    </form>
  );
}
