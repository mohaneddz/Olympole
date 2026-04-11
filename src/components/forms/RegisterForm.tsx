"use client";

import { useMemo, useState } from "react";
import { useActionState } from "react";
import { createRegistrationAction } from "@/server/registrations";
import { Button } from "@/components/ui/Button";

type EventOption = {
  id: string;
  title: string;
  category: string;
  status: string;
  starts_at: string;
  venue: string;
};

const initialState = { ok: false, message: "" };

export function RegisterForm({
  events,
  maxSelections,
}: {
  events: EventOption[];
  maxSelections: number;
}) {
  const [state, formAction, pending] = useActionState(createRegistrationAction, initialState);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  const grouped = useMemo(() => {
    return events.reduce<Record<string, EventOption[]>>((acc, event) => {
      const key = event.category || "Other";
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(event);
      return acc;
    }, {});
  }, [events]);

  function toggleEvent(eventId: string) {
    setSelectedEvents((current) => {
      if (current.includes(eventId)) {
        return current.filter((id) => id !== eventId);
      }
      if (current.length >= maxSelections) {
        return current;
      }
      return [...current, eventId];
    });
  }

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          name="full_name"
          required
          placeholder="Full name"
          className="h-12 px-4 rounded-md bg-background/50 border border-card-border"
        />
        <input
          name="email"
          required
          type="email"
          placeholder="Email"
          className="h-12 px-4 rounded-md bg-background/50 border border-card-border"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          name="phone"
          required
          placeholder="Phone"
          className="h-12 px-4 rounded-md bg-background/50 border border-card-border"
        />
        <input
          name="department_or_school"
          required
          placeholder="Department / School"
          className="h-12 px-4 rounded-md bg-background/50 border border-card-border"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <select
          name="category_type"
          required
          className="h-12 px-4 rounded-md bg-background/50 border border-card-border"
        >
          <option value="collective_sport">Collective Sport</option>
          <option value="individual_sport">Individual Sport</option>
          <option value="culture">Culture</option>
        </select>
        <input
          name="team_name"
          placeholder="Team name (optional)"
          className="h-12 px-4 rounded-md bg-background/50 border border-card-border"
        />
      </div>
      <input
        name="emergency_contact"
        placeholder="Emergency contact (optional)"
        className="w-full h-12 px-4 rounded-md bg-background/50 border border-card-border"
      />
      <textarea
        name="additional_notes"
        placeholder="Additional notes (optional)"
        className="w-full min-h-28 px-4 py-3 rounded-md bg-background/50 border border-card-border"
      />

      <div className="space-y-4 rounded-xl border border-card-border bg-card-bg/30 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">Select Events</h3>
          <p className="text-sm text-foreground/70">
            {selectedEvents.length}/{maxSelections} selected
          </p>
        </div>
        {events.length === 0 ? (
          <p className="text-sm text-foreground/70">No events are currently open for registration.</p>
        ) : null}
        {Object.entries(grouped).map(([category, categoryEvents]) => (
          <div key={category} className="space-y-2">
            <p className="text-sm uppercase tracking-wide text-foreground/60">{category}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {categoryEvents.map((event) => {
                const checked = selectedEvents.includes(event.id);
                const disabled = !checked && selectedEvents.length >= maxSelections;

                return (
                  <label
                    key={event.id}
                    className={`rounded-lg border p-3 transition-colors ${
                      checked
                        ? "border-primary bg-primary/10"
                        : "border-card-border bg-background/40"
                    } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <input
                      type="checkbox"
                      name="event_ids"
                      value={event.id}
                      checked={checked}
                      disabled={disabled}
                      onChange={() => toggleEvent(event.id)}
                      className="sr-only"
                    />
                    <div className="space-y-1">
                      <p className="font-medium">{event.title}</p>
                      <p className="text-xs text-foreground/60">
                        {new Date(event.starts_at).toLocaleString()} • {event.venue}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <Button
        type="submit"
        variant="neonPill"
        size="pill"
        className="w-full sm:w-auto"
        disabled={pending || selectedEvents.length === 0}
      >
        {pending ? "Submitting..." : "Submit Registration"}
      </Button>
      {state.message ? (
        <p className={state.ok ? "text-green-400 text-sm" : "text-red-400 text-sm"}>{state.message}</p>
      ) : null}
    </form>
  );
}
