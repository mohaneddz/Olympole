"use client";

import { useActionState } from "react";
import { submitWritingAction } from "@/app/actions/writing";
import { Button } from "@/components/ui/Button";

const initialState = { ok: false, message: "" };

export function WritingSubmissionForm() {
  const [state, formAction, pending] = useActionState(submitWritingAction, initialState);

  return (
    <form action={formAction} className="space-y-4 p-6 glass-card rounded-xl border border-card-border">
      <h3 className="text-xl font-bold">Submit a Writing Entry</h3>
      <input name="title" required placeholder="Title" className="w-full h-11 px-3 rounded bg-background/60 border border-card-border" />
      <input name="category" required placeholder="Category" className="w-full h-11 px-3 rounded bg-background/60 border border-card-border" />
      <textarea name="content" required placeholder="Your submission content" className="w-full min-h-44 px-3 py-3 rounded bg-background/60 border border-card-border" />
      <Button type="submit" variant="neonPill" size="pill" disabled={pending}>
        {pending ? "Submitting..." : "Submit Entry"}
      </Button>
      {state.message ? (
        <p className={state.ok ? "text-green-400 text-sm" : "text-red-400 text-sm"}>{state.message}</p>
      ) : null}
    </form>
  );
}
