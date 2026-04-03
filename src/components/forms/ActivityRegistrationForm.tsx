"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { createActivityRegistrationAction } from "@/app/actions/registrations";
import type { RegistrationActivity } from "@/data/registration-activities";
import {
  clearClientRegistrationDraftCookie,
  writeClientRegistrationDraftCookie,
} from "@/lib/cookie-drafts";
import { Button } from "@/components/ui/Button";

type EventOption = {
  id: string;
  title: string;
  starts_at: string;
  venue: string;
};

type DefaultValues = {
  full_name: string;
  email: string;
  phone: string;
  department_or_school: string;
  team_name: string;
  emergency_contact: string;
  previous_experience: string;
  motivation: string;
  availability_date: string;
  preferred_role: string;
  additional_notes: string;
  detail_strengths: string;
  detail_schedule: string;
};

type FormState = {
  event_id: string;
  full_name: string;
  email: string;
  phone: string;
  department_or_school: string;
  team_name: string;
  emergency_contact: string;
  previous_experience: string;
  motivation: string;
  availability_date: string;
  preferred_role: string;
  additional_notes: string;
  detail_strengths: string;
  detail_schedule: string;
};

const initialState = { ok: false, message: "" };

function buildInitialFormValues(defaults: DefaultValues, events: EventOption[]): FormState {
  return {
    event_id: events[0]?.id ?? "",
    full_name: defaults.full_name,
    email: defaults.email,
    phone: defaults.phone,
    department_or_school: defaults.department_or_school,
    team_name: defaults.team_name,
    emergency_contact: defaults.emergency_contact,
    previous_experience: defaults.previous_experience,
    motivation: defaults.motivation,
    availability_date: defaults.availability_date,
    preferred_role: defaults.preferred_role,
    additional_notes: defaults.additional_notes,
    detail_strengths: defaults.detail_strengths,
    detail_schedule: defaults.detail_schedule,
  };
}

export function ActivityRegistrationForm({
  activity,
  events,
  defaults,
  highlightedDateLabel,
}: {
  activity: RegistrationActivity;
  events: EventOption[];
  defaults: DefaultValues;
  highlightedDateLabel: string;
}) {
  const [actionState, formAction, pending] = useActionState(createActivityRegistrationAction, initialState);
  const [formState, setFormState] = useState<FormState>(() => buildInitialFormValues(defaults, events));

  useEffect(() => {
    writeClientRegistrationDraftCookie(activity.slug, {
      full_name: formState.full_name,
      email: formState.email,
      phone: formState.phone,
      department_or_school: formState.department_or_school,
      team_name: formState.team_name,
      emergency_contact: formState.emergency_contact,
      previous_experience: formState.previous_experience,
      motivation: formState.motivation,
      preferred_role: formState.preferred_role,
      availability_date: formState.availability_date,
      additional_notes: formState.additional_notes,
      detail_strengths: formState.detail_strengths,
      detail_schedule: formState.detail_schedule,
    });
  }, [activity.slug, formState]);

  useEffect(() => {
    if (actionState.ok) {
      clearClientRegistrationDraftCookie(activity.slug);
    }
  }, [actionState.ok, activity.slug]);

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === formState.event_id) ?? events[0],
    [events, formState.event_id]
  );

  const isFormDisabled = pending || events.length === 0;

  function updateField<Key extends keyof FormState>(key: Key, value: FormState[Key]) {
    setFormState((current) => ({ ...current, [key]: value }));
  }

  return (
    <form action={formAction} className="space-y-6 rounded-3xl border border-card-border bg-card-bg/30 p-6 md:p-8">
      <input type="hidden" name="activity_slug" value={activity.slug} />
      <input type="hidden" name="category_type" value={activity.category} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm text-foreground/80">
          <span>Full name</span>
          <input
            name="full_name"
            required
            value={formState.full_name}
            onChange={(event) => updateField("full_name", event.target.value)}
            className="h-12 w-full rounded-xl border border-card-border bg-background/50 px-4"
            disabled={isFormDisabled}
          />
        </label>
        <label className="space-y-1 text-sm text-foreground/80">
          <span>Email</span>
          <input
            name="email"
            required
            type="email"
            value={formState.email}
            onChange={(event) => updateField("email", event.target.value)}
            className="h-12 w-full rounded-xl border border-card-border bg-background/50 px-4"
            disabled={isFormDisabled}
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm text-foreground/80">
          <span>Phone</span>
          <input
            name="phone"
            required
            value={formState.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            className="h-12 w-full rounded-xl border border-card-border bg-background/50 px-4"
            disabled={isFormDisabled}
          />
        </label>
        <label className="space-y-1 text-sm text-foreground/80">
          <span>Department / School</span>
          <input
            name="department_or_school"
            required
            value={formState.department_or_school}
            onChange={(event) => updateField("department_or_school", event.target.value)}
            className="h-12 w-full rounded-xl border border-card-border bg-background/50 px-4"
            disabled={isFormDisabled}
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm text-foreground/80">
          <span>Activity event</span>
          <select
            name="event_id"
            required
            value={formState.event_id}
            onChange={(event) => updateField("event_id", event.target.value)}
            className="h-12 w-full rounded-xl border border-card-border bg-background/50 px-4"
            disabled={isFormDisabled}
          >
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title} - {new Date(event.starts_at).toLocaleString()}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm text-foreground/80">
          <span>{activity.rolePrompt}</span>
          <input
            name="preferred_role"
            value={formState.preferred_role}
            onChange={(event) => updateField("preferred_role", event.target.value)}
            placeholder={activity.rolePrompt}
            className="h-12 w-full rounded-xl border border-card-border bg-background/50 px-4"
            disabled={isFormDisabled}
          />
        </label>
      </div>

      {activity.teamBased ? (
        <label className="space-y-1 text-sm text-foreground/80">
          <span>Team name (if you already have one)</span>
          <input
            name="team_name"
            value={formState.team_name}
            onChange={(event) => updateField("team_name", event.target.value)}
            placeholder="Team name"
            className="h-12 w-full rounded-xl border border-card-border bg-background/50 px-4"
            disabled={isFormDisabled}
          />
        </label>
      ) : (
        <input type="hidden" name="team_name" value={formState.team_name} />
      )}

      <label className="space-y-1 text-sm text-foreground/80">
        <span>Previous experience</span>
        <textarea
          name="previous_experience"
          required
          value={formState.previous_experience}
          onChange={(event) => updateField("previous_experience", event.target.value)}
          placeholder={activity.experiencePrompt}
          className="min-h-24 w-full rounded-xl border border-card-border bg-background/50 px-4 py-3"
          disabled={isFormDisabled}
        />
      </label>

      <label className="space-y-1 text-sm text-foreground/80">
        <span>Motivation</span>
        <textarea
          name="motivation"
          required
          value={formState.motivation}
          onChange={(event) => updateField("motivation", event.target.value)}
          placeholder={activity.motivationPrompt}
          className="min-h-24 w-full rounded-xl border border-card-border bg-background/50 px-4 py-3"
          disabled={isFormDisabled}
        />
      </label>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm text-foreground/80">
          <span>
            Are you available on {highlightedDateLabel}?
          </span>
          <input
            name="availability_date"
            type="date"
            value={formState.availability_date}
            onChange={(event) => updateField("availability_date", event.target.value)}
            className="h-12 w-full rounded-xl border border-card-border bg-background/50 px-4"
            disabled={isFormDisabled}
          />
        </label>
        <label className="space-y-1 text-sm text-foreground/80">
          <span>Emergency contact</span>
          <input
            name="emergency_contact"
            value={formState.emergency_contact}
            onChange={(event) => updateField("emergency_contact", event.target.value)}
            className="h-12 w-full rounded-xl border border-card-border bg-background/50 px-4"
            disabled={isFormDisabled}
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm text-foreground/80">
          <span>Key strengths</span>
          <input
            name="detail_strengths"
            value={formState.detail_strengths}
            onChange={(event) => updateField("detail_strengths", event.target.value)}
            placeholder="Your key strengths"
            className="h-12 w-full rounded-xl border border-card-border bg-background/50 px-4"
            disabled={isFormDisabled}
          />
        </label>
        <label className="space-y-1 text-sm text-foreground/80">
          <span>Schedule notes</span>
          <input
            name="detail_schedule"
            value={formState.detail_schedule}
            onChange={(event) => updateField("detail_schedule", event.target.value)}
            placeholder={activity.defaultAvailabilityHint}
            className="h-12 w-full rounded-xl border border-card-border bg-background/50 px-4"
            disabled={isFormDisabled}
          />
        </label>
      </div>

      <label className="space-y-1 text-sm text-foreground/80">
        <span>Additional notes</span>
        <textarea
          name="additional_notes"
          value={formState.additional_notes}
          onChange={(event) => updateField("additional_notes", event.target.value)}
          className="min-h-24 w-full rounded-xl border border-card-border bg-background/50 px-4 py-3"
          disabled={isFormDisabled}
        />
      </label>

      {selectedEvent ? (
        <div className="rounded-xl border border-card-border bg-black/20 p-4 text-sm text-foreground/70">
          <p className="font-medium text-foreground/90">{selectedEvent.title}</p>
          <p>
            {new Date(selectedEvent.starts_at).toLocaleString()} at {selectedEvent.venue}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-yellow-400/40 bg-yellow-400/10 p-4 text-sm text-yellow-200">
          No open events are currently available for this activity.
        </div>
      )}

      <Button
        type="submit"
        variant="neonPill"
        size="pill"
        className="w-full sm:w-auto"
        disabled={isFormDisabled}
      >
        {pending ? "Submitting..." : `Register for ${activity.title}`}
      </Button>

      {actionState.message ? (
        <p className={actionState.ok ? "text-sm text-green-300" : "text-sm text-red-300"}>{actionState.message}</p>
      ) : null}
    </form>
  );
}
