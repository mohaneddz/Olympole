"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createActivityRegistrationAction,
  deleteActivityRegistrationAction,
  updateActivityRegistrationAction,
} from "@/server/registrations";
import type { RegistrationActivity } from "@/data/registration-activities";
import type { ActionResponse } from "@/lib/actions";
import {
  clearClientRegistrationDraftCookie,
  writeClientRegistrationDraftCookie,
} from "@/lib/cookie-drafts";
import { isValidPhoneInput, normalizePhoneInput } from "@/lib/phone";
import {
  ACTIVITY_REGISTRATION_MAX_MOTIVATION,
  ACTIVITY_REGISTRATION_MAX_PREVIOUS_EXPERIENCE,
} from "@/lib/limits";
import { Button } from "@/components/ui/Button";

type EventOption = {
  id: string;
  title: string;
  starts_at: string;
  venue: string;
  status?: string;
  is_registration_open?: boolean;
};

type ExistingRegistration = {
  id: string;
  status: string;
  created_at: string;
};

type DefaultValues = {
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
  detail_gender: string;
  detail_competition_level: string;
  detail_running_distance: string;
  detail_joined_marathon_before: string;
  detail_participated_before: string;
  detail_elo_rating: string;
  detail_talent_type: string;
  detail_talent_type_other: string;
  detail_performance_description: string;
  detail_writing_category: string;
  detail_art_category: string;
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
  detail_gender: string;
  detail_competition_level: string;
  detail_running_distance: string;
  detail_joined_marathon_before: string;
  detail_participated_before: string;
  detail_elo_rating: string;
  detail_talent_type: string;
  detail_talent_type_other: string;
  detail_performance_description: string;
  detail_writing_category: string;
  detail_art_category: string;
  detail_strengths: string;
  detail_schedule: string;
};

const initialState = { ok: false, message: "" };
const integerPattern = /^\d+$/;

const labelClassName = "flex w-full flex-col gap-3 text-base font-semibold text-cyan-50";
const inputClassName = "h-14 w-full rounded-xl border border-cyan-300/35 bg-[#061536]/85 px-4 text-base text-cyan-50 placeholder:text-cyan-100/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition focus:border-cyan-200/70 focus:outline-none focus:ring-2 focus:ring-cyan-300/30 disabled:cursor-not-allowed disabled:border-cyan-300/15 disabled:bg-[#0a1a3f]/45 disabled:text-cyan-100/45 disabled:placeholder:text-cyan-100/30";
const textareaClassName = "min-h-32 w-full rounded-xl border border-cyan-300/35 bg-[#061536]/85 px-4 py-3 text-base text-cyan-50 placeholder:text-cyan-100/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition focus:border-cyan-200/70 focus:outline-none focus:ring-2 focus:ring-cyan-300/30 disabled:cursor-not-allowed disabled:border-cyan-300/15 disabled:bg-[#0a1a3f]/45 disabled:text-cyan-100/45 disabled:placeholder:text-cyan-100/30";
const invalidFieldClassName = "border-red-400/65 bg-red-500/10 text-red-100 placeholder:text-red-200/65 focus:border-red-300/70 focus:ring-red-300/35";

function buildInitialFormValues(defaults: DefaultValues, events: EventOption[]): FormState {
  const defaultEventId =
    defaults.event_id && events.some((event) => event.id === defaults.event_id)
      ? defaults.event_id
      : (events[0]?.id ?? "");

  return {
    event_id: defaultEventId,
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
    detail_gender: defaults.detail_gender,
    detail_competition_level: defaults.detail_competition_level,
    detail_running_distance: defaults.detail_running_distance,
    detail_joined_marathon_before: defaults.detail_joined_marathon_before,
    detail_participated_before: defaults.detail_participated_before,
    detail_elo_rating: defaults.detail_elo_rating,
    detail_talent_type: defaults.detail_talent_type,
    detail_talent_type_other: defaults.detail_talent_type_other,
    detail_performance_description: defaults.detail_performance_description,
    detail_writing_category: defaults.detail_writing_category,
    detail_art_category: defaults.detail_art_category,
    detail_strengths: defaults.detail_strengths,
    detail_schedule: defaults.detail_schedule,
  };
}

export function ActivityRegistrationForm({
  activity,
  events,
  lockedGenderCategory,
  defaults,
  existingRegistration,
}: {
  activity: RegistrationActivity;
  events: EventOption[];
  lockedGenderCategory: "men" | "women" | "";
  defaults: DefaultValues;
  existingRegistration: ExistingRegistration | null;
}) {
  const router = useRouter();
  const actionHandler = existingRegistration ? updateActivityRegistrationAction : createActivityRegistrationAction;
  const [actionState, formAction, pending] = useActionState(actionHandler, initialState);
  const [toast, setToast] = useState<ActionResponse | null>(null);
  const [formState, setFormState] = useState<FormState>(() => buildInitialFormValues(defaults, events));
  const [hasTeam, setHasTeam] = useState(() => Boolean(defaults.team_name?.trim()));
  const [touchedFields, setTouchedFields] = useState<Partial<Record<keyof FormState, boolean>>>({});

  useEffect(() => {
    const nextFormState = buildInitialFormValues(defaults, events);
    setFormState(nextFormState);
    setHasTeam(Boolean(nextFormState.team_name.trim()));
    setTouchedFields({});
  }, [defaults, events]);

  useEffect(() => {
    writeClientRegistrationDraftCookie(activity.slug, {
      event_id: formState.event_id,
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
      detail_gender: formState.detail_gender,
      detail_competition_level: formState.detail_competition_level,
      detail_running_distance: formState.detail_running_distance,
      detail_joined_marathon_before: formState.detail_joined_marathon_before,
      detail_participated_before: formState.detail_participated_before,
      detail_elo_rating: formState.detail_elo_rating,
      detail_talent_type: formState.detail_talent_type,
      detail_talent_type_other: formState.detail_talent_type_other,
      detail_performance_description: formState.detail_performance_description,
      detail_writing_category: formState.detail_writing_category,
      detail_art_category: formState.detail_art_category,
      detail_strengths: formState.detail_strengths,
      detail_schedule: formState.detail_schedule,
    });
  }, [activity.slug, formState]);

  useEffect(() => {
    if (actionState.ok) {
      clearClientRegistrationDraftCookie(activity.slug);
    }
  }, [actionState.ok, activity.slug]);

  useEffect(() => {
    if (!actionState.message) {
      return;
    }

    setToast(actionState);
    const toastTimeoutId = window.setTimeout(() => {
      setToast(null);
    }, actionState.ok ? 3000 : 5000);

    if (actionState.ok) {
      const redirectTimeoutId = window.setTimeout(() => {
        router.push("/profile");
      }, 900);
      return () => {
        window.clearTimeout(toastTimeoutId);
        window.clearTimeout(redirectTimeoutId);
      };
    }

    return () => window.clearTimeout(toastTimeoutId);
  }, [actionState, router]);

  const isFormDisabled = pending;
  const isEditing = Boolean(existingRegistration);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepError, setStepError] = useState("");
  const steps = [
    { title: "Basic Info", description: "Your identity and event selection" },
    { title: "Activity Details", description: "Role and activity-specific details" },
    { title: "Experience & Availability", description: "Background and logistics" },
  ] as const;
  const roleSelectionBySlug: Record<string, string[]> = {
    football: ["Field Player", "Goalkeeper"],
    handball: ["Field Player", "Goalkeeper"],
  };
  const shouldShowPreferredRole = Boolean(roleSelectionBySlug[activity.slug]);
  const isCheckboxChecked = (value: string) => value.trim().toLowerCase() === "yes";

  function updateField<Key extends keyof FormState>(key: Key, value: FormState[Key]) {
    setFormState((current) => ({ ...current, [key]: value }));
  }

  function normalizePhoneFieldValue(value: string) {
    const normalized = normalizePhoneInput(value);
    return typeof normalized === "string" ? normalized : value;
  }

  function markFieldTouched<Key extends keyof FormState>(key: Key) {
    setTouchedFields((current) => (current[key] ? current : { ...current, [key]: true }));
  }

  function getFieldClass(
    key: keyof FormState,
    isInvalid: boolean,
    baseClassName: string = inputClassName
  ) {
    return `${baseClassName} ${touchedFields[key] && isInvalid ? invalidFieldClassName : ""}`;
  }

  function requireValue(value: string, label: string) {
    return value.trim() ? null : `${label} is required.`;
  }

  function validateStep(stepIndex: number) {
    if (stepIndex === 0) {
      if (activity.category === "collective_sport") {
        if (!lockedGenderCategory) {
          return "Category is locked from your profile gender. Please complete your profile first.";
        }
        const genderError = requireValue(formState.detail_gender, "Category");
        if (genderError) return genderError;
        if (activity.slug === "football" && formState.detail_gender !== "men") {
          return "Football registrations are currently limited to men's category.";
        }
      }

      return (
        requireValue(formState.full_name, "Full name")
        ?? requireValue(formState.email, "Email")
        ?? requireValue(formState.phone, "Phone")
        ?? (!isValidPhoneInput(formState.phone) ? "Phone number must be exactly 10 digits and start with 0." : null)
        ?? requireValue(formState.department_or_school, "School / Institution")
      );
    }

    if (stepIndex === 1) {
      if (shouldShowPreferredRole) {
        const preferredRoleError = requireValue(formState.preferred_role, "Preferred role");
        if (preferredRoleError) return preferredRoleError;
      }

      if (activity.slug === "talent-show") {
        if (formState.detail_talent_type === "other" && !formState.detail_talent_type_other.trim()) {
          return "Please specify your talent type.";
        }
        return (
          requireValue(formState.detail_talent_type, "Type of talent / act")
          ?? requireValue(formState.detail_performance_description, "Performance description")
        );
      }
      if (activity.slug === "writing-contest") {
        return requireValue(formState.detail_writing_category, "Writing category");
      }
      if (activity.slug === "art-exhibition") {
        return requireValue(formState.detail_art_category, "Art category");
      }
      if (activity.slug === "running") {
        return requireValue(formState.detail_running_distance, "Running distance");
      }
      if (activity.slug === "chess") {
        if (formState.detail_elo_rating.trim() && !integerPattern.test(formState.detail_elo_rating.trim())) {
          return "Elo rating must be a number.";
        }
      }
      return null;
    }

    if (stepIndex === 2) {
      if (formState.previous_experience.length > ACTIVITY_REGISTRATION_MAX_PREVIOUS_EXPERIENCE) {
        return `Previous experience must be at most ${ACTIVITY_REGISTRATION_MAX_PREVIOUS_EXPERIENCE} characters.`;
      }
      if (formState.motivation.length > ACTIVITY_REGISTRATION_MAX_MOTIVATION) {
        return `Motivation must be at most ${ACTIVITY_REGISTRATION_MAX_MOTIVATION} characters.`;
      }
      return null;
    }

    return null;
  }

  function goToNextStep() {
    const validationError = validateStep(currentStep);
    if (validationError) {
      setStepError(validationError);
      return;
    }
    setStepError("");
    setCurrentStep((previous) => Math.min(previous + 1, steps.length - 1));
  }

  function goToPreviousStep() {
    setStepError("");
    setCurrentStep((previous) => Math.max(previous - 1, 0));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const firstError =
      validateStep(0)
      ?? validateStep(1)
      ?? validateStep(2);

    if (firstError) {
      event.preventDefault();
      setStepError(firstError);
      return;
    }

    setStepError("");
  }

  return (
    <div className="space-y-6">
      {toast ? (
        <div
          className={`fixed right-4 top-28 z-[9999] max-w-sm rounded-xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-sm ${
            toast.ok
              ? "border-green-400/45 bg-green-500/20 text-green-100"
              : "border-red-400/45 bg-red-500/20 text-red-100"
          }`}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      ) : null}

      {isEditing ? (
        <div className="rounded-xl border border-cyan-300/40 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
          You are editing your existing registration. Status: <span className="font-semibold uppercase">{existingRegistration?.status}</span>
        </div>
      ) : null}

      <form
        action={formAction}
        onSubmit={handleSubmit}
        noValidate
        className="space-y-9 rounded-3xl border border-cyan-200/25 bg-[linear-gradient(145deg,rgba(6,22,56,0.95),rgba(3,12,34,0.96))] p-7 shadow-[0_18px_60px_rgba(0,0,0,0.45),0_0_0_1px_rgba(56,189,248,0.18)] backdrop-blur-sm md:p-10"
      >
        <input type="hidden" name="activity_slug" value={activity.slug} />
        <input type="hidden" name="category_type" value={activity.category} />
        {isEditing ? <input type="hidden" name="registration_id" value={existingRegistration?.id ?? ""} /> : null}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {steps.map((step, index) => {
            const isActive = currentStep === index;
            const isCompleted = currentStep > index;
            return (
              <button
                key={step.title}
                type="button"
                disabled={!isCompleted && !isActive}
                onClick={() => setCurrentStep(index)}
                className={`rounded-2xl border px-4 py-3 text-left transition ${
                  isActive
                    ? "border-cyan-200/65 bg-cyan-300/20 text-cyan-50"
                    : isCompleted
                      ? "cursor-pointer border-cyan-300/35 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/15"
                      : "cursor-not-allowed border-cyan-300/20 bg-background/25 text-cyan-100/55"
                }`}
              >
                <p className="text-xs uppercase tracking-[0.18em]">Step {index + 1}</p>
                <p className="mt-1 text-sm font-semibold">{step.title}</p>
              </button>
            );
          })}
        </div>

        <section className={currentStep === 0 ? "space-y-10" : "hidden"}>
        {activity.category === "collective_sport" ? (
          <label className={labelClassName}>
            <span>Category *</span>
            <input type="hidden" name="detail_gender" value={formState.detail_gender} />
            <select
              name="detail_gender_display"
              required
              value={formState.detail_gender}
              className={getFieldClass("detail_gender", !formState.detail_gender.trim())}
              disabled
            >
              {!lockedGenderCategory ? (
                <option value="">Set gender in your profile first</option>
              ) : (
                <>
                  {lockedGenderCategory === "men" ? <option value="men">Men</option> : null}
                  {lockedGenderCategory === "women" ? <option value="women">Women</option> : null}
                </>
              )}
            </select>
            <p className="text-xs text-cyan-200/60 mt-1">Category is locked to your profile gender.</p>
          </label>
        ) : null}

        <div className="grid grid-cols-1 gap-y-8 gap-x-6 md:grid-cols-2">
          <label className={labelClassName}>
            <span>Full name</span>
            <input type="hidden" name="full_name" value={formState.full_name} />
            <input
              name="full_name_display"
              required
              value={formState.full_name}
              onChange={(event) => updateField("full_name", event.target.value)}
              className={`${inputClassName} disabled:bg-[#0b1c44]/55`}
              disabled
            />
          </label>
          <label className={labelClassName}>
            <span>Email (use school email if available)</span>
            <input type="hidden" name="email" value={formState.email} />
            <input
              name="email_display"
              required
              type="email"
              value={formState.email}
              onChange={(event) => updateField("email", event.target.value)}
              className={`${inputClassName} disabled:bg-[#0b1c44]/55`}
              disabled
            />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-y-8 gap-x-6 md:grid-cols-2">
          <label className={labelClassName}>
            <span>Phone</span>
            <input type="hidden" name="phone" value={formState.phone} />
            <input
              name="phone_display"
              required
              value={formState.phone}
              className={`${inputClassName} disabled:bg-[#0b1c44]/55`}
              placeholder="e.g. 0551234567"
              disabled
            />
            <p className="text-xs text-cyan-200/60 mt-1">Use exactly 10 digits starting with 0 (example: 0551234567).</p>
          </label>
          <label className={labelClassName}>
            <span>School / Institution</span>
            <input type="hidden" name="department_or_school" value={formState.department_or_school} />
            <input
              name="department_or_school_display"
              required
              value={formState.department_or_school}
              onChange={(event) => updateField("department_or_school", event.target.value)}
              className={`${inputClassName} disabled:bg-[#0b1c44]/55`}
              disabled
            />
          </label>
        </div>

        <input type="hidden" name="event_id" value={formState.event_id} />
        </section>

        <section className={currentStep === 1 ? "space-y-10" : "hidden"}>
        {shouldShowPreferredRole ? (
          <label className={labelClassName}>
            <span>{activity.rolePrompt}</span>
            <select
              name="preferred_role"
              required
              value={formState.preferred_role}
              onChange={(event) => {
                updateField("preferred_role", event.target.value);
                markFieldTouched("preferred_role");
              }}
              onBlur={() => markFieldTouched("preferred_role")}
              className={getFieldClass("preferred_role", !formState.preferred_role.trim())}
              disabled={isFormDisabled}
            >
              <option value="">Select preferred role</option>
              {roleSelectionBySlug[activity.slug].map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </label>
        ) : (
          <input type="hidden" name="preferred_role" value="" />
        )}

        {activity.teamBased ? (
          <div className="space-y-3">
            <label className="inline-flex items-center gap-2 text-sm text-cyan-100">
              <input
                type="checkbox"
                checked={hasTeam}
                onChange={(event) => {
                  const checked = event.target.checked;
                  setHasTeam(checked);
                  if (!checked) {
                    updateField("team_name", "");
                  }
                }}
                disabled={isFormDisabled}
                className="h-4 w-4 rounded border-cyan-300/40 bg-[#061536]/85 accent-cyan-300"
              />
              I have a team
            </label>

            <label className={labelClassName}>
              <span>Team name</span>
              <input type="hidden" name="team_name" value={formState.team_name} />
              <input
                name="team_name_display"
                value={formState.team_name}
                onChange={(event) => updateField("team_name", event.target.value)}
                placeholder="Team name"
                className={`${inputClassName} disabled:bg-[#0b1c44]/55`}
                disabled={!hasTeam || isFormDisabled}
              />
            </label>
          </div>
        ) : (
          <input type="hidden" name="team_name" value={formState.team_name} />
        )}

        {activity.slug === "running" ? (
          <div className="grid grid-cols-1 gap-y-8 gap-x-6 md:grid-cols-2">
            <label className={labelClassName}>
              <span>Running distance *</span>
              <select
                name="detail_running_distance"
                required
                value={formState.detail_running_distance}
                onChange={(event) => {
                  updateField("detail_running_distance", event.target.value);
                  markFieldTouched("detail_running_distance");
                }}
                onBlur={() => markFieldTouched("detail_running_distance")}
                className={getFieldClass("detail_running_distance", !formState.detail_running_distance.trim())}
                disabled={isFormDisabled}
              >
                <option value="">Select distance</option>
                <option value="100m">100m</option>
                <option value="10km">10km</option>
                <option value="both">Both</option>
              </select>
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-cyan-100 pt-9">
              <input type="hidden" name="detail_joined_marathon_before" value={formState.detail_joined_marathon_before || "no"} />
              <input
                type="checkbox"
                checked={isCheckboxChecked(formState.detail_joined_marathon_before)}
                onChange={(event) => updateField("detail_joined_marathon_before", event.target.checked ? "yes" : "no")}
                disabled={isFormDisabled}
                className="h-4 w-4 rounded border-cyan-300/40 bg-[#061536]/85 accent-cyan-300"
              />
              I have joined a marathon before
            </label>
          </div>
        ) : null}

        {activity.slug === "chess" ? (
          <div className="grid grid-cols-1 gap-y-8 gap-x-6 md:grid-cols-2">
            <label className={labelClassName}>
              <span>Elo rating</span>
              <input
                name="detail_elo_rating"
                value={formState.detail_elo_rating}
                onChange={(event) => {
                  updateField("detail_elo_rating", event.target.value);
                  markFieldTouched("detail_elo_rating");
                }}
                onBlur={() => markFieldTouched("detail_elo_rating")}
                placeholder="e.g. 1600"
                className={getFieldClass(
                  "detail_elo_rating",
                  !!formState.detail_elo_rating.trim() && !integerPattern.test(formState.detail_elo_rating.trim())
                )}
                disabled={isFormDisabled}
              />
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-cyan-100 pt-9">
              <input type="hidden" name="detail_participated_before" value={formState.detail_participated_before || "no"} />
              <input
                type="checkbox"
                checked={isCheckboxChecked(formState.detail_participated_before)}
                onChange={(event) => updateField("detail_participated_before", event.target.checked ? "yes" : "no")}
                disabled={isFormDisabled}
                className="h-4 w-4 rounded border-cyan-300/40 bg-[#061536]/85 accent-cyan-300"
              />
              I have participated in a chess competition before
            </label>
          </div>
        ) : null}

        {activity.slug === "writing-contest" ? (
          <div className="grid grid-cols-1 gap-y-8 gap-x-6 md:grid-cols-2">
            <label className={labelClassName}>
              <span>Writing category *</span>
              <select
                name="detail_writing_category"
                required
                value={formState.detail_writing_category}
                onChange={(event) => {
                  updateField("detail_writing_category", event.target.value);
                  markFieldTouched("detail_writing_category");
                }}
                onBlur={() => markFieldTouched("detail_writing_category")}
                className={getFieldClass("detail_writing_category", !formState.detail_writing_category.trim())}
                disabled={isFormDisabled}
              >
                <option value="">Select category</option>
                <option value="poetry">Poetry</option>
                <option value="short-story">Short story</option>
                <option value="essay">Essay</option>
                <option value="article">Article</option>
                <option value="open-letter">Open letter</option>
              </select>
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-cyan-100 pt-9">
              <input type="hidden" name="detail_participated_before" value={formState.detail_participated_before || "no"} />
              <input
                type="checkbox"
                checked={isCheckboxChecked(formState.detail_participated_before)}
                onChange={(event) => updateField("detail_participated_before", event.target.checked ? "yes" : "no")}
                disabled={isFormDisabled}
                className="h-4 w-4 rounded border-cyan-300/40 bg-[#061536]/85 accent-cyan-300"
              />
              I have participated before
            </label>
          </div>
        ) : null}

        {activity.slug === "talent-show" ? (
          <div className="grid grid-cols-1 gap-y-8 gap-x-6 md:grid-cols-2">
            <label className={labelClassName}>
              <span>Type of talent / act *</span>
              <select
                name="detail_talent_type"
                required
                value={formState.detail_talent_type}
                onChange={(event) => {
                  updateField("detail_talent_type", event.target.value);
                  markFieldTouched("detail_talent_type");
                }}
                onBlur={() => markFieldTouched("detail_talent_type")}
                className={getFieldClass("detail_talent_type", !formState.detail_talent_type.trim())}
                disabled={isFormDisabled}
              >
                <option value="">Select talent type</option>
                <option value="singing">Singing</option>
                <option value="dance">Dance</option>
                <option value="rap">Rap</option>
                <option value="instrument">Instrument</option>
                <option value="stand-up">Stand-up comedy</option>
                <option value="poetry">Poetry</option>
                <option value="magic">Magic</option>
                <option value="acting">Acting</option>
                <option value="beatbox">Beatbox</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className={labelClassName}>
              <span>Performance short description *</span>
              <input
                name="detail_performance_description"
                required
                value={formState.detail_performance_description}
                onChange={(event) => {
                  updateField("detail_performance_description", event.target.value);
                  markFieldTouched("detail_performance_description");
                }}
                onBlur={() => markFieldTouched("detail_performance_description")}
                placeholder="What will you perform?"
                className={getFieldClass(
                  "detail_performance_description",
                  !formState.detail_performance_description.trim()
                )}
                disabled={isFormDisabled}
              />
            </label>
            {formState.detail_talent_type === "other" ? (
              <label className={`${labelClassName} md:col-span-2`}>
                <span>Specify your talent type *</span>
                <input
                  name="detail_talent_type_other"
                  required
                  value={formState.detail_talent_type_other}
                  onChange={(event) => {
                    updateField("detail_talent_type_other", event.target.value);
                    markFieldTouched("detail_talent_type_other");
                  }}
                  onBlur={() => markFieldTouched("detail_talent_type_other")}
                  placeholder="Describe your talent"
                  className={getFieldClass(
                    "detail_talent_type_other",
                    formState.detail_talent_type === "other" && !formState.detail_talent_type_other.trim()
                  )}
                  disabled={isFormDisabled}
                />
              </label>
            ) : null}
            <label className="inline-flex items-center gap-2 text-sm text-cyan-100 md:col-span-2">
              <input type="hidden" name="detail_participated_before" value={formState.detail_participated_before || "no"} />
              <input
                type="checkbox"
                checked={isCheckboxChecked(formState.detail_participated_before)}
                onChange={(event) => updateField("detail_participated_before", event.target.checked ? "yes" : "no")}
                disabled={isFormDisabled}
                className="h-4 w-4 rounded border-cyan-300/40 bg-[#061536]/85 accent-cyan-300"
              />
              I have participated before
            </label>
          </div>
        ) : null}

        {activity.slug === "art-exhibition" ? (
          <div className="grid grid-cols-1 gap-y-8 gap-x-6 md:grid-cols-2">
            <label className={labelClassName}>
              <span>Art category *</span>
              <select
                name="detail_art_category"
                required
                value={formState.detail_art_category}
                onChange={(event) => {
                  updateField("detail_art_category", event.target.value);
                  markFieldTouched("detail_art_category");
                }}
                onBlur={() => markFieldTouched("detail_art_category")}
                className={getFieldClass("detail_art_category", !formState.detail_art_category.trim())}
                disabled={isFormDisabled}
              >
                <option value="">Select art category</option>
                <option value="drawing">Drawing</option>
                <option value="painting">Painting</option>
                <option value="digital-art">Digital art</option>
                <option value="mixed-media">Mixed media</option>
                <option value="calligraphy">Calligraphy</option>
              </select>
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-cyan-100 pt-9">
              <input type="hidden" name="detail_participated_before" value={formState.detail_participated_before || "no"} />
              <input
                type="checkbox"
                checked={isCheckboxChecked(formState.detail_participated_before)}
                onChange={(event) => updateField("detail_participated_before", event.target.checked ? "yes" : "no")}
                disabled={isFormDisabled}
                className="h-4 w-4 rounded border-cyan-300/40 bg-[#061536]/85 accent-cyan-300"
              />
              I have participated before
            </label>
          </div>
        ) : null}

        </section>

        <section className={currentStep === 2 ? "space-y-10" : "hidden"}>
        <label className={labelClassName}>
          <span>Previous experience (optional)</span>
          <textarea
            name="previous_experience"
            value={formState.previous_experience}
            onChange={(event) => {
              updateField("previous_experience", event.target.value);
              markFieldTouched("previous_experience");
            }}
            onBlur={() => markFieldTouched("previous_experience")}
            maxLength={ACTIVITY_REGISTRATION_MAX_PREVIOUS_EXPERIENCE}
            placeholder={activity.experiencePrompt}
            className={getFieldClass("previous_experience", false, textareaClassName)}
            disabled={isFormDisabled}
          />
          <p className="text-xs text-cyan-200/60 mt-1">
            Up to {ACTIVITY_REGISTRATION_MAX_PREVIOUS_EXPERIENCE} characters ({formState.previous_experience.length}/{ACTIVITY_REGISTRATION_MAX_PREVIOUS_EXPERIENCE}).
          </p>
        </label>

        <label className={labelClassName}>
          <span>Motivation (optional)</span>
          <textarea
            name="motivation"
            value={formState.motivation}
            onChange={(event) => {
              updateField("motivation", event.target.value);
              markFieldTouched("motivation");
            }}
            onBlur={() => markFieldTouched("motivation")}
            maxLength={ACTIVITY_REGISTRATION_MAX_MOTIVATION}
            placeholder={activity.motivationPrompt}
            className={getFieldClass("motivation", false, textareaClassName)}
            disabled={isFormDisabled}
          />
          <p className="text-xs text-cyan-200/60 mt-1">
            Up to {ACTIVITY_REGISTRATION_MAX_MOTIVATION} characters ({formState.motivation.length}/{ACTIVITY_REGISTRATION_MAX_MOTIVATION}).
          </p>
        </label>

        <div className="grid grid-cols-1 gap-y-8 gap-x-6 md:grid-cols-2">
          <label className={`${labelClassName} md:col-span-2`}>
            <span>Emergency contact (optional)</span>
            <input
              name="emergency_contact"
              value={formState.emergency_contact}
              onChange={(event) => {
                updateField("emergency_contact", normalizePhoneFieldValue(event.target.value));
                markFieldTouched("emergency_contact");
              }}
              onBlur={() => markFieldTouched("emergency_contact")}
              placeholder="e.g. 0551234567"
              className={getFieldClass(
                "emergency_contact",
                !!formState.emergency_contact.trim() && !isValidPhoneInput(formState.emergency_contact)
              )}
              disabled={isFormDisabled}
            />
          </label>
        </div>
        <input type="hidden" name="availability_date" value="" />
        <input type="hidden" name="detail_strengths" value="" />
        <input type="hidden" name="detail_schedule" value="" />
        <input type="hidden" name="additional_notes" value="" />

        </section>

        {stepError ? <p className="text-sm text-amber-300">{stepError}</p> : null}

        <div className="flex flex-wrap items-center gap-3">
          {currentStep > 0 ? (
            <Button type="button" variant="outline" size="pill" className="h-12 px-8 text-base" onClick={goToPreviousStep}>
              Back
            </Button>
          ) : null}

          {currentStep < steps.length - 1 ? (
            <Button
              key="continue"
              type="button"
              variant="neonPill"
              size="pill"
              className="h-12 px-8 text-base"
              onClick={goToNextStep}
              disabled={isFormDisabled}
            >
              Continue
            </Button>
          ) : (
            <Button
              key="submit"
              type="submit"
              variant="neonPill"
              size="pill"
              className="h-12 w-full text-base sm:w-auto"
              disabled={isFormDisabled}
            >
              {pending
                ? "Submitting..."
                : isEditing
                  ? `Update ${activity.title} registration`
                  : `Register for ${activity.title}`}
            </Button>
          )}
        </div>

        {!actionState.ok && actionState.message ? (
          <p className="text-sm text-red-300">{actionState.message}</p>
        ) : null}
      </form>

      {isEditing && existingRegistration?.status !== "approved" ? (
        <form
          action={deleteActivityRegistrationAction}
          onSubmit={(event) => {
            if (!window.confirm("Delete this registration permanently?")) {
              event.preventDefault();
            }
          }}
          className="rounded-2xl border border-red-300/30 bg-red-500/10 p-4"
        >
          <input type="hidden" name="registration_id" value={existingRegistration?.id || ""} />
          <input type="hidden" name="activity_slug" value={activity.slug} />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-red-100">Need to withdraw? You can delete this registration.</p>
            <Button type="submit" variant="destructive">Delete registration</Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
