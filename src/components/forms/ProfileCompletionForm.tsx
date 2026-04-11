"use client";

import { useActionState, useEffect, useState } from "react";
import { completeProfileAction } from "@/app/actions/profile";
import { Button } from "@/components/ui/Button";
import { writeClientProfileDraftCookie } from "@/lib/cookie-drafts";

const initialState = { ok: false, message: "" };

type Props = {
  defaultGender?: string | null;
};

export function ProfileCompletionForm({ defaultGender }: Props) {
  const [state, formAction, pending] = useActionState(completeProfileAction, initialState);
  const [gender, setGender] = useState(defaultGender ?? "");

  useEffect(() => {
    writeClientProfileDraftCookie({
      gender,
    });
  }, [gender]);

  return (
    <form action={formAction} className="space-y-4 p-6 rounded-xl border border-card-border glass-card">
      <h2 className="text-2xl font-bold">Complete Your Profile</h2>
      <p className="text-sm text-foreground/70">Required before continuing.</p>

      <select
        name="gender"
        required
        value={gender}
        onChange={(event) => setGender(event.target.value)}
        className="w-full h-11 px-3 rounded bg-background/60 border border-card-border"
      >
        <option value="">Select gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>

      <Button type="submit" variant="neonPill" size="pill" disabled={pending}>
        {pending ? "Saving..." : "Continue"}
      </Button>

      {state.message ? <p className="text-red-400 text-sm">{state.message}</p> : null}
    </form>
  );
}
