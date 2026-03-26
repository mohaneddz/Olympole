"use client";

import { useActionState } from "react";
import { submitPredictionAction } from "@/app/actions/predictions";
import { Button } from "@/components/ui/Button";

const initialState = { ok: false, message: "" };

export function PredictionForm({ matchId, teamA, teamB }: { matchId: string; teamA: string; teamB: string }) {
  const [state, formAction, pending] = useActionState(submitPredictionAction, initialState);

  return (
    <form action={formAction} className="grid grid-cols-2 gap-4">
      <input type="hidden" name="match_id" value={matchId} />
      <Button type="submit" name="predicted_winner" value={teamA} variant="outline" disabled={pending}>
        {teamA}
      </Button>
      <Button type="submit" name="predicted_winner" value={teamB} variant="outline" disabled={pending}>
        {teamB}
      </Button>
      {state.message ? (
        <p className={state.ok ? "text-green-400 text-xs col-span-2" : "text-red-400 text-xs col-span-2"}>{state.message}</p>
      ) : null}
    </form>
  );
}
