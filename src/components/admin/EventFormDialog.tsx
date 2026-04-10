"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { createEventAction, updateEventAction } from "@/app/actions/events";
import type { ActionResponse } from "@/lib/actions";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

type SportOption = {
  id: string;
  name: string;
};

type ActivityOption = {
  id: string;
  slug: string;
  title: string;
  category: "collective_sport" | "individual_sport" | "culture";
  is_active?: boolean;
};

type EventOption = {
  id: string;
  title: string;
  slug: string;
  type: "sport" | "culture" | "ceremony" | "mini_game";
  category: string;
  venue: string;
  starts_at: string;
  ends_at: string;
  status: "draft" | "scheduled" | "live" | "completed" | "cancelled";
  description: string | null;
  sport_id: string | null;
  activity_id: string | null;
  show_in_schedule: boolean | null;
  registration_deadline: string | null;
  max_participants: number | null;
  is_registration_open: boolean | null;
  is_featured: boolean | null;
  visibility: "public" | "private";
  current_round: string | null;
  icon_key: string | null;
};

const initialState: ActionResponse = { ok: false, message: "" };
const fieldClass = "h-10 w-full rounded-lg border border-cyan-200/20 bg-[#0a1737] px-3 text-cyan-50";

function toLocalDateTimeValue(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

export function EventFormDialog({
  mode,
  sports,
  activities,
  event,
  trigger,
  triggerClassName,
}: {
  mode: "create" | "edit";
  sports?: SportOption[];
  activities: ActivityOption[];
  event?: EventOption;
  trigger: ReactNode;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    mode === "create" ? createEventAction : updateEventAction,
    initialState
  );

  const defaults = useMemo(
    () => ({
      title: event?.title ?? "",
      slug: event?.slug ?? "",
      type: event?.type ?? "sport",
      category: event?.category ?? "",
      venue: event?.venue ?? "",
      starts_at: toLocalDateTimeValue(event?.starts_at),
      ends_at: toLocalDateTimeValue(event?.ends_at),
      registration_deadline: toLocalDateTimeValue(event?.registration_deadline),
      max_participants: event?.max_participants ?? "",
      status: event?.status ?? "draft",
      visibility: event?.visibility ?? "public",
      is_registration_open: String(event?.is_registration_open ?? true),
      is_featured: String(event?.is_featured ?? false),
      current_round: event?.current_round ?? "",
      description: event?.description ?? "",
      sport_id: event?.sport_id ?? "",
      activity_id: event?.activity_id ?? "",
      show_in_schedule: String(event?.show_in_schedule ?? false),
      icon_key: event?.icon_key ?? "Trophy",
    }),
    [event]
  );

  useEffect(() => {
    if (state.ok) {
      setOpen(false);
    }
  }, [state.ok]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          triggerClassName ??
          "inline-flex items-center gap-2 rounded-lg border border-cyan-300/40 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-100 transition hover:bg-cyan-400/20"
        }
      >
        {trigger}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <motion.div
              className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-cyan-200/20 bg-[linear-gradient(160deg,rgba(10,22,54,0.94),rgba(6,13,34,0.98))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.55)]"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-xl font-bold text-white">
                {mode === "create" ? "Create Event" : "Edit Event"}
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-400/10 text-cyan-100 transition hover:bg-cyan-400/20"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form action={formAction} className="space-y-3">
              {mode === "edit" ? <input type="hidden" name="id" value={event?.id ?? ""} /> : null}
              <input type="hidden" name="icon_key" value={defaults.icon_key} />

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <input name="title" defaultValue={defaults.title} placeholder="Title" required className={fieldClass} />
                <input name="slug" defaultValue={defaults.slug} placeholder="slug-name" required className={fieldClass} />
                <select name="type" defaultValue={defaults.type} className={fieldClass}>
                  <option value="sport">sport</option>
                  <option value="culture">culture</option>
                  <option value="ceremony">ceremony</option>
                  <option value="mini_game">mini_game</option>
                </select>
                <select name="activity_id" defaultValue={defaults.activity_id} className={fieldClass}>
                  <option value="">Select linked activity</option>
                  {activities
                    .filter((activity) => activity.is_active !== false)
                    .map((activity) => (
                      <option key={activity.id} value={activity.id}>
                        {activity.title} ({activity.category})
                      </option>
                    ))}
                </select>
                <select name="sport_id" defaultValue={defaults.sport_id} className={fieldClass}>
                  <option value="">No linked sport</option>
                  {(sports ?? []).map((sport) => (
                    <option key={sport.id} value={sport.id}>
                      {sport.name}
                    </option>
                  ))}
                </select>
                <input name="category" defaultValue={defaults.category} placeholder="Category" required className={fieldClass} />
                <input name="venue" defaultValue={defaults.venue} placeholder="Venue" required className={fieldClass} />
                <input name="starts_at" defaultValue={defaults.starts_at} type="datetime-local" required className={fieldClass} />
                <input name="ends_at" defaultValue={defaults.ends_at} type="datetime-local" required className={fieldClass} />
                <input name="registration_deadline" defaultValue={defaults.registration_deadline} type="datetime-local" className={fieldClass} />
                <input name="max_participants" defaultValue={String(defaults.max_participants)} type="number" min="1" placeholder="Max participants" className={fieldClass} />
                <select name="status" defaultValue={defaults.status} className={fieldClass}>
                  <option value="draft">draft</option>
                  <option value="scheduled">scheduled</option>
                  <option value="live">live</option>
                  <option value="completed">completed</option>
                  <option value="cancelled">cancelled</option>
                </select>
                <select name="visibility" defaultValue={defaults.visibility} className={fieldClass}>
                  <option value="public">public</option>
                  <option value="private">private</option>
                </select>
                <select name="show_in_schedule" defaultValue={defaults.show_in_schedule} className={fieldClass}>
                  <option value="false">hide from schedule</option>
                  <option value="true">show in schedule</option>
                </select>
                <select name="is_registration_open" defaultValue={defaults.is_registration_open} className={fieldClass}>
                  <option value="true">registration open</option>
                  <option value="false">registration closed</option>
                </select>
                <select name="is_featured" defaultValue={defaults.is_featured} className={fieldClass}>
                  <option value="false">not featured</option>
                  <option value="true">featured</option>
                </select>
              </div>

              <div className="rounded-lg border border-cyan-200/20 bg-[#0a1737]/70 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100/75">Create Activity Inline (Optional)</p>
                <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-3">
                  <input
                    name="new_activity_title"
                    placeholder="Activity title"
                    className={fieldClass}
                  />
                  <input
                    name="new_activity_slug"
                    placeholder="activity-slug"
                    className={fieldClass}
                  />
                  <select name="new_activity_category" defaultValue="" className={fieldClass}>
                    <option value="">Category</option>
                    <option value="collective_sport">collective_sport</option>
                    <option value="individual_sport">individual_sport</option>
                    <option value="culture">culture</option>
                  </select>
                </div>
              </div>

              <input name="current_round" defaultValue={defaults.current_round} placeholder="Current round (optional)" className={fieldClass} />
              <textarea
                name="description"
                defaultValue={defaults.description}
                placeholder="Description"
                className="min-h-24 w-full rounded-lg border border-cyan-200/20 bg-[#0a1737] px-3 py-2 text-cyan-50"
              />

              {state.message ? (
                <div className={`rounded-lg border px-3 py-2 text-sm ${state.ok ? "border-emerald-500/40 bg-emerald-900/30 text-emerald-100" : "border-red-500/40 bg-red-900/30 text-red-100"}`}>
                  {state.message}
                </div>
              ) : null}

              <div className="flex items-center gap-2">
                <button
                  disabled={pending}
                  className="h-10 rounded-lg border border-cyan-300/35 bg-cyan-400/10 px-4 text-sm text-cyan-100 transition hover:bg-cyan-400/20 disabled:opacity-60"
                >
                  {pending ? "Saving..." : mode === "create" ? "Create Event" : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-10 rounded-lg border border-white/20 bg-white/5 px-4 text-sm text-white/80 transition hover:bg-white/10"
                >
                  Cancel
                </button>
              </div>
            </form>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
