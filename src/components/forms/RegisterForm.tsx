"use client";

import { useActionState } from "react";
import { createRegistrationAction } from "@/app/actions/registrations";
import { Button } from "@/components/ui/Button";

type EventOption = {
  id: string;
  title: string;
};

const initialState = { ok: false, message: "" };

export function RegisterForm({ events }: { events: EventOption[] }) {
  const [state, formAction, pending] = useActionState(createRegistrationAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input name="full_name" required placeholder="Full name" className="h-12 px-4 rounded-md bg-background/50 border border-card-border" />
        <input name="email" required type="email" placeholder="Email" className="h-12 px-4 rounded-md bg-background/50 border border-card-border" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input name="phone" required placeholder="Phone" className="h-12 px-4 rounded-md bg-background/50 border border-card-border" />
        <input name="department_or_school" required placeholder="Department / School" className="h-12 px-4 rounded-md bg-background/50 border border-card-border" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <select name="category_type" required className="h-12 px-4 rounded-md bg-background/50 border border-card-border">
          <option value="collective_sport">Collective Sport</option>
          <option value="individual_sport">Individual Sport</option>
          <option value="culture">Culture</option>
        </select>
        <select name="event_id" required className="h-12 px-4 rounded-md bg-background/50 border border-card-border">
          <option value="">Select Event</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title}
            </option>
          ))}
        </select>
      </div>
      <input name="team_name" placeholder="Team name (optional)" className="w-full h-12 px-4 rounded-md bg-background/50 border border-card-border" />
      <textarea name="additional_notes" placeholder="Additional notes (optional)" className="w-full min-h-28 px-4 py-3 rounded-md bg-background/50 border border-card-border" />
      <Button type="submit" variant="neonPill" size="pill" className="w-full sm:w-auto" disabled={pending}>
        {pending ? "Submitting..." : "Submit Registration"}
      </Button>
      {state.message ? (
        <p className={state.ok ? "text-green-400 text-sm" : "text-red-400 text-sm"}>{state.message}</p>
      ) : null}
    </form>
  );
}
