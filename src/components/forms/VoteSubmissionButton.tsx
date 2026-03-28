"use client";

import { useActionState } from "react";
import { voteSubmissionWithStateAction } from "@/app/actions/writing";

const initialState = { ok: false, message: "" };

export function VoteSubmissionButton({ submissionId }: { submissionId: string }) {
  const [state, formAction, pending] = useActionState(voteSubmissionWithStateAction, initialState);

  return (
    <form action={formAction} className="space-y-1">
      <input type="hidden" name="submission_id" value={submissionId} />
      <button
        className="px-3 py-2 rounded border border-indigo-500/40 hover:border-indigo-400 disabled:opacity-60"
        disabled={pending}
      >
        {pending ? "Voting..." : "Vote"}
      </button>
      {state.message ? (
        <p className={state.ok ? "text-green-400 text-xs" : "text-red-400 text-xs"}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
