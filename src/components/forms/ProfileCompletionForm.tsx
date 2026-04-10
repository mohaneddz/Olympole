"use client";

import { useActionState, useEffect, useState } from "react";
import { completeProfileAction } from "@/app/actions/profile";
import { Button } from "@/components/ui/Button";
import { writeClientProfileDraftCookie } from "@/lib/cookie-drafts";

const initialState = { ok: false, message: "" };

type Props = {
  defaultName?: string | null;
  defaultSchool?: string | null;
  defaultYear?: string | null;
  defaultStudentId?: string | null;
};

export function ProfileCompletionForm({ defaultName, defaultSchool, defaultYear, defaultStudentId }: Props) {
  const [state, formAction, pending] = useActionState(completeProfileAction, initialState);
  const [fullName, setFullName] = useState(defaultName ?? "");
  const [school, setSchool] = useState(defaultSchool ?? "");
  const [year, setYear] = useState(defaultYear ?? "");
  const [studentId, setStudentId] = useState(defaultStudentId ?? "");

  useEffect(() => {
    writeClientProfileDraftCookie({
      full_name: fullName,
      school,
      year_of_study: year,
      student_id: studentId,
    });
  }, [fullName, school, year, studentId]);

  return (
    <form action={formAction} className="space-y-4 p-6 rounded-xl border border-card-border glass-card">
      <h2 className="text-2xl font-bold">Complete Your Profile</h2>
      <p className="text-sm text-foreground/70">Required before continuing.</p>

      <input
        name="full_name"
        required
        value={fullName}
        onChange={(event) => setFullName(event.target.value)}
        placeholder="Full name"
        className="w-full h-11 px-3 rounded bg-background/60 border border-card-border"
      />

      <select
        name="school"
        required
        value={school}
        onChange={(event) => setSchool(event.target.value)}
        className="w-full h-11 px-3 rounded bg-background/60 border border-card-border"
      >
        <option value="">Select school</option>
        <option value="ENSIA">ENSIA</option>
        <option value="NHSM">NHSM</option>
        <option value="NHCS">NHCS</option>
        <option value="Others">Others</option>
      </select>

      <select
        name="year_of_study"
        required
        value={year}
        onChange={(event) => setYear(event.target.value)}
        className="w-full h-11 px-3 rounded bg-background/60 border border-card-border"
      >
        <option value="">Year of study</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
        <option value="other">other</option>
      </select>

      <input
        name="student_id"
        required
        inputMode="numeric"
        pattern="[0-9]{12}"
        minLength={12}
        maxLength={12}
        value={studentId}
        onChange={(event) => setStudentId(event.target.value)}
        placeholder="e.g. 23233431...."
        className="w-full h-11 px-3 rounded bg-background/60 border border-card-border"
      />

      <Button type="submit" variant="neonPill" size="pill" disabled={pending}>
        {pending ? "Saving..." : "Continue"}
      </Button>

      {state.message ? <p className="text-red-400 text-sm">{state.message}</p> : null}
    </form>
  );
}
