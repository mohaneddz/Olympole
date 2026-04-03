"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createEventAction, createMatchAction, createResultAction } from "@/app/actions/events";
import type { ActionResponse } from "@/lib/actions";

type EventOption = {
  id: string;
  title: string;
};

type SportOption = {
  id: string;
  name: string;
};

type TeamOption = {
  id: string;
  name: string;
};

const initialState: ActionResponse = { ok: false, message: "" };
const inputClass = "w-full h-10 px-3 rounded bg-background border border-card-border";
const areaClass = "w-full px-3 py-2 rounded bg-background border border-card-border";

function Toast({ message }: { message: ActionResponse | null }) {
  if (!message?.message) {
    return null;
  }

  return (
    <div
      className={`rounded-lg border px-4 py-2 text-sm ${
        message.ok ? "border-emerald-500/50 bg-emerald-950/40 text-emerald-100" : "border-red-500/50 bg-red-950/40 text-red-100"
      }`}
    >
      {message.ok ? "Done: " : "Error: "}
      {message.message}
    </div>
  );
}

export function CreateEventAdminForm({ sports }: { sports: SportOption[] }) {
  const [state, formAction, pending] = useActionState(createEventAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [toast, setToast] = useState<ActionResponse | null>(null);

  useEffect(() => {
    if (!state.message) return;
    window.setTimeout(() => {
      setToast(state);
      if (state.ok) {
        formRef.current?.reset();
      }
    }, 0);
    const timeoutId = window.setTimeout(() => window.setTimeout(() => setToast(null), 0), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3 rounded-xl border border-card-border p-4">
      <h1 className="text-2xl font-bold">Create Event</h1>
      <input name="title" placeholder="Title" required className={inputClass} />
      <input name="slug" placeholder="slug-name" required className={inputClass} />
      <input type="hidden" name="icon_key" value="Trophy" />
      <select name="type" className={inputClass}>
        <option value="sport">sport</option>
        <option value="culture">culture</option>
        <option value="ceremony">ceremony</option>
        <option value="mini_game">mini_game</option>
      </select>
      <select name="sport_id" className={inputClass}>
        <option value="">No linked sport</option>
        {sports.map((sport) => (
          <option key={sport.id} value={sport.id}>
            {sport.name}
          </option>
        ))}
      </select>
      <input name="category" placeholder="Category" required className={inputClass} />
      <input name="venue" placeholder="Venue" required className={inputClass} />
      <input name="starts_at" type="datetime-local" required className={inputClass} />
      <input name="ends_at" type="datetime-local" required className={inputClass} />
      <input name="registration_deadline" type="datetime-local" className={inputClass} />
      <input name="max_participants" type="number" min="1" placeholder="Max participants" className={inputClass} />
      <select name="status" className={inputClass}>
        <option value="draft">draft</option>
        <option value="scheduled">scheduled</option>
        <option value="live">live</option>
        <option value="completed">completed</option>
        <option value="cancelled">cancelled</option>
      </select>
      <select name="visibility" defaultValue="public" className={inputClass}>
        <option value="public">public</option>
        <option value="private">private</option>
      </select>
      <div className="grid grid-cols-2 gap-3">
        <select name="is_registration_open" defaultValue="true" className={inputClass}>
          <option value="true">registration open</option>
          <option value="false">registration closed</option>
        </select>
        <select name="is_featured" defaultValue="false" className={inputClass}>
          <option value="false">not featured</option>
          <option value="true">featured</option>
        </select>
      </div>
      <input name="current_round" placeholder="Current round (optional)" className={inputClass} />
      <textarea name="description" placeholder="Description" className={`${areaClass} min-h-20`} />
      <button disabled={pending} className="rounded-lg border border-primary/50 px-4 py-2">
        {pending ? "Saving..." : "Confirm"}
      </button>
      <Toast message={toast} />
    </form>
  );
}

export function CreateMatchAdminForm({
  events,
  teams,
}: {
  events: EventOption[];
  teams: TeamOption[];
}) {
  const [state, formAction, pending] = useActionState(createMatchAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [toast, setToast] = useState<ActionResponse | null>(null);

  useEffect(() => {
    if (!state.message) return;
    window.setTimeout(() => {
      setToast(state);
      if (state.ok) {
        formRef.current?.reset();
      }
    }, 0);
    const timeoutId = window.setTimeout(() => window.setTimeout(() => setToast(null), 0), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3 rounded-xl border border-card-border p-4">
      <h1 className="text-2xl font-bold">Create Match</h1>
      <select name="event_id" className={inputClass} required>
        <option value="">Select event</option>
        {events.map((event) => (
          <option key={event.id} value={event.id}>
            {event.title}
          </option>
        ))}
      </select>
      <input name="sport" placeholder="Sport label" required className={inputClass} />
      <input name="team_a" placeholder="Team A" required className={inputClass} />
      <select name="team_a_id" className={inputClass}>
        <option value="">No linked team A</option>
        {teams.map((team) => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </select>
      <input name="team_b" placeholder="Team B" required className={inputClass} />
      <select name="team_b_id" className={inputClass}>
        <option value="">No linked team B</option>
        {teams.map((team) => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </select>
      <input name="score_a" type="number" defaultValue="0" className={inputClass} />
      <input name="score_b" type="number" defaultValue="0" className={inputClass} />
      <select name="status" className={inputClass}>
        <option value="scheduled">scheduled</option>
        <option value="live">live</option>
        <option value="completed">completed</option>
      </select>
      <input name="round" placeholder="Round" required className={inputClass} />
      <input name="event_phase" placeholder="Event phase (group, knockout...)" className={inputClass} />
      <input name="venue" placeholder="Venue" required className={inputClass} />
      <input name="starts_at" type="datetime-local" required className={inputClass} />
      <input name="mvp_player" placeholder="MVP player (optional)" className={inputClass} />
      <input name="live_minute" type="number" min="0" placeholder="Live minute (optional)" className={inputClass} />
      <select name="is_prediction_locked" defaultValue="false" className={inputClass}>
        <option value="false">predictions unlocked</option>
        <option value="true">predictions locked</option>
      </select>
      <textarea name="notes" placeholder="Notes" className={`${areaClass} min-h-16`} />
      <button disabled={pending} className="rounded-lg border border-primary/50 px-4 py-2">
        {pending ? "Saving..." : "Confirm"}
      </button>
      <Toast message={toast} />
    </form>
  );
}

export function CreateResultAdminForm({ events }: { events: EventOption[] }) {
  const [state, formAction, pending] = useActionState(createResultAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [toast, setToast] = useState<ActionResponse | null>(null);

  useEffect(() => {
    if (!state.message) return;
    window.setTimeout(() => {
      setToast(state);
      if (state.ok) {
        formRef.current?.reset();
      }
    }, 0);
    const timeoutId = window.setTimeout(() => window.setTimeout(() => setToast(null), 0), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3 rounded-xl border border-card-border p-4">
      <h1 className="text-2xl font-bold">Create Result</h1>
      <select name="event_id" className={inputClass} required>
        <option value="">Select event</option>
        {events.map((event) => (
          <option key={event.id} value={event.id}>
            {event.title}
          </option>
        ))}
      </select>
      <input name="participant_or_team_name" placeholder="Participant or Team" required className={inputClass} />
      <input name="placement" type="number" min="1" required className={inputClass} />
      <select name="medal" className={inputClass}>
        <option value="gold">gold</option>
        <option value="silver">silver</option>
        <option value="bronze">bronze</option>
        <option value="none">none</option>
      </select>
      <input name="score_summary" placeholder="Summary" className={inputClass} />
      <button disabled={pending} className="rounded-lg border border-primary/50 px-4 py-2">
        {pending ? "Saving..." : "Confirm"}
      </button>
      <Toast message={toast} />
    </form>
  );
}
