"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { createEventAction, updateEventAction } from "@/server/events";
import type { ActionResponse } from "@/lib/actions";
import { ACTIVITY_COLUMNS } from "@/data/activities";
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

type ActivityType = "collective" | "individual" | "cultural";

const initialState: ActionResponse = { ok: false, message: "" };
const fieldClass = "h-10 w-full rounded-lg border border-cyan-200/20 bg-[#0a1737] px-3 text-cyan-50";

function toLocalDateTimeValue(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

function addHoursToLocalDateTime(value: string, hours: number) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  date.setHours(date.getHours() + hours);
  return date.toISOString().slice(0, 16);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function inferActivityType(event: EventOption | undefined, activity: ActivityOption | undefined): ActivityType {
  if (activity?.category === "collective_sport") return "collective";
  if (activity?.category === "individual_sport") return "individual";
  if (activity?.category === "culture") return "cultural";

  const category = (event?.category ?? "").toLowerCase();
  if (event?.type === "culture" || category.includes("culture") || category.includes("writing") || category.includes("art")) {
    return "cultural";
  }

  if (category.includes("individual")) {
    return "individual";
  }

  return "collective";
}

function parseTeamsFromTitle(title: string) {
  const normalized = title.includes(":") ? title.split(":").slice(1).join(":").trim() : title.trim();
  const match = normalized.match(/(.+?)\s+vs\.?\s+(.+)/i);
  if (!match) {
    return { teamA: "", teamB: "" };
  }

  return {
    teamA: match[1]?.trim() ?? "",
    teamB: match[2]?.trim() ?? "",
  };
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

  const activeActivities = useMemo(
    () => activities.filter((activity) => activity.is_active !== false),
    [activities]
  );

  const activityById = useMemo(
    () => new Map(activeActivities.map((activity) => [activity.id, activity])),
    [activeActivities]
  );

  const defaults = useMemo(() => {
    const linkedActivity = event?.activity_id ? activityById.get(event.activity_id) : undefined;
    const activityType = inferActivityType(event, linkedActivity);
    const parsedTeams = parseTeamsFromTitle(event?.title ?? "");

    return {
      activityType,
      starts_at: toLocalDateTimeValue(event?.starts_at),
      venue: event?.venue ?? "",
      event_name: event?.title ?? "",
      team_a: parsedTeams.teamA,
      team_b: parsedTeams.teamB,
      sport_id: event?.sport_id ?? "",
      activity_id: event?.activity_id ?? "",
      status: event?.status ?? "scheduled",
      visibility: event?.visibility ?? "public",
      is_registration_open: String(event?.is_registration_open ?? true),
      is_featured: String(event?.is_featured ?? false),
      show_in_schedule: String(event?.show_in_schedule ?? true),
      icon_key: event?.icon_key ?? "Trophy",
      slug: event?.slug ?? "",
      description: event?.description ?? "",
    };
  }, [event, activityById]);

  const [activityType, setActivityType] = useState<ActivityType>(defaults.activityType);
  const [startsAt, setStartsAt] = useState(defaults.starts_at);
  const [venue, setVenue] = useState(defaults.venue);
  const [eventName, setEventName] = useState(defaults.event_name);
  const [teamA, setTeamA] = useState(defaults.team_a);
  const [teamB, setTeamB] = useState(defaults.team_b);
  const [sportId, setSportId] = useState(defaults.sport_id);
  const [activityId, setActivityId] = useState(defaults.activity_id);

  const resetFormFromDefaults = () => {
    setActivityType(defaults.activityType);
    setStartsAt(defaults.starts_at);
    setVenue(defaults.venue);
    setEventName(defaults.event_name);
    setTeamA(defaults.team_a);
    setTeamB(defaults.team_b);
    setSportId(defaults.sport_id);
    setActivityId(defaults.activity_id);
  };

  const openDialog = () => {
    resetFormFromDefaults();
    setOpen(true);
  };

  useEffect(() => {
    if (state.ok) {
      const timeoutId = window.setTimeout(() => {
        setOpen(false);
      }, 0);
      return () => window.clearTimeout(timeoutId);
    }
  }, [state.ok]);

  const filteredActivities = useMemo(() => {
    if (activityType === "collective") {
      return activeActivities.filter((activity) => activity.category === "collective_sport");
    }
    if (activityType === "individual") {
      return activeActivities.filter((activity) => activity.category === "individual_sport");
    }
    return activeActivities.filter((activity) => activity.category === "culture");
  }, [activityType, activeActivities]);

  const allowedSportNames = useMemo(() => {
    const columnIndexByType: Record<ActivityType, number> = {
      collective: 0,
      individual: 1,
      cultural: 2,
    };

    const targetColumn = ACTIVITY_COLUMNS[columnIndexByType[activityType]];
    return new Set(targetColumn.items.map((item) => normalizeName(item.name)));
  }, [activityType]);

  const filteredSports = useMemo(() => {
    return (sports ?? []).filter((sport) => allowedSportNames.has(normalizeName(sport.name)));
  }, [sports, allowedSportNames]);

  const effectiveSportId = useMemo(() => {
    if (activityType !== "collective") {
      return "";
    }

    if (filteredSports.length === 0) {
      return "";
    }

    return filteredSports.some((sport) => sport.id === sportId)
      ? sportId
      : filteredSports[0].id;
  }, [activityType, filteredSports, sportId]);

  const effectiveActivityId = useMemo(() => {
    if (filteredActivities.length === 0) {
      return "";
    }

    return filteredActivities.some((activity) => activity.id === activityId)
      ? activityId
      : filteredActivities[0].id;
  }, [filteredActivities, activityId]);

  const selectedActivity = useMemo(
    () => filteredActivities.find((activity) => activity.id === effectiveActivityId),
    [filteredActivities, effectiveActivityId]
  );

  const selectedSportName = useMemo(
    () => (sports ?? []).find((sport) => sport.id === sportId)?.name ?? "",
    [sports, sportId]
  );

  const computedTitle = useMemo(() => {
    if (activityType === "collective") {
      const matchup = `${teamA.trim()} vs ${teamB.trim()}`.trim();
      if (!matchup || matchup === "vs") {
        return "";
      }
      return selectedSportName ? `${selectedSportName}: ${matchup}` : matchup;
    }

    return eventName.trim();
  }, [activityType, teamA, teamB, eventName, selectedSportName]);

  const computedSlug = useMemo(() => {
    const fromTitle = slugify(computedTitle);
    if (fromTitle) {
      return fromTitle;
    }

    return defaults.slug || "event";
  }, [computedTitle, defaults.slug]);

  const computedCategory = useMemo(() => {
    if (selectedActivity?.title) {
      return selectedActivity.title;
    }

    if (activityType === "collective") return "Collective Sports";
    if (activityType === "individual") return "Individual Sports";
    return "Culture";
  }, [selectedActivity, activityType]);

  const computedType = activityType === "cultural" ? "culture" : "sport";
  const computedEndsAt = addHoursToLocalDateTime(startsAt, 2);

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
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
              className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-cyan-200/20 bg-[linear-gradient(160deg,rgba(10,22,54,0.94),rgba(6,13,34,0.98))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.55)]"
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

                <label className="block space-y-1">
                  <span className="text-sm text-cyan-100/80">Activity type</span>
                  <select
                    value={activityType}
                    onChange={(eventItem) => setActivityType(eventItem.target.value as ActivityType)}
                    className={fieldClass}
                  >
                    <option value="collective">collective</option>
                    <option value="individual">individual</option>
                    <option value="cultural">cultural</option>
                  </select>
                </label>

                {activityType === "collective" ? (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <label className="space-y-1">
                      <span className="text-sm text-cyan-100/80">Time</span>
                      <input
                        type="datetime-local"
                        required
                        value={startsAt}
                        onChange={(eventItem) => setStartsAt(eventItem.target.value)}
                        className={fieldClass}
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-sm text-cyan-100/80">Location</span>
                      <input
                        required
                        value={venue}
                        onChange={(eventItem) => setVenue(eventItem.target.value)}
                        className={fieldClass}
                        placeholder="Location"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-sm text-cyan-100/80">Team 1</span>
                      <input
                        required
                        value={teamA}
                        onChange={(eventItem) => setTeamA(eventItem.target.value)}
                        className={fieldClass}
                        placeholder="Team 1"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-sm text-cyan-100/80">Team 2</span>
                      <input
                        required
                        value={teamB}
                        onChange={(eventItem) => setTeamB(eventItem.target.value)}
                        className={fieldClass}
                        placeholder="Team 2"
                      />
                    </label>
                    <label className="space-y-1 md:col-span-2">
                      <span className="text-sm text-cyan-100/80">Sport</span>
                      <select
                        value={effectiveSportId}
                        onChange={(eventItem) => setSportId(eventItem.target.value)}
                        className={fieldClass}
                        required
                      >
                        <option value="">Select sport</option>
                        {filteredSports.map((sport) => (
                          <option key={sport.id} value={sport.id}>
                            {sport.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                ) : null}

                {activityType === "individual" ? (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <label className="space-y-1">
                      <span className="text-sm text-cyan-100/80">Time</span>
                      <input
                        type="datetime-local"
                        required
                        value={startsAt}
                        onChange={(eventItem) => setStartsAt(eventItem.target.value)}
                        className={fieldClass}
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-sm text-cyan-100/80">Event name</span>
                      <input
                        required
                        value={eventName}
                        onChange={(eventItem) => setEventName(eventItem.target.value)}
                        className={fieldClass}
                        placeholder="Event name"
                      />
                    </label>
                    <label className="space-y-1 md:col-span-2">
                      <span className="text-sm text-cyan-100/80">Location</span>
                      <input
                        required
                        value={venue}
                        onChange={(eventItem) => setVenue(eventItem.target.value)}
                        className={fieldClass}
                        placeholder="Location"
                      />
                    </label>
                  </div>
                ) : null}

                {activityType === "cultural" ? (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <label className="space-y-1">
                      <span className="text-sm text-cyan-100/80">Event name</span>
                      <input
                        required
                        value={eventName}
                        onChange={(eventItem) => setEventName(eventItem.target.value)}
                        className={fieldClass}
                        placeholder="Event name"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-sm text-cyan-100/80">Location</span>
                      <input
                        required
                        value={venue}
                        onChange={(eventItem) => setVenue(eventItem.target.value)}
                        className={fieldClass}
                        placeholder="Location"
                      />
                    </label>
                    <label className="space-y-1 md:col-span-2">
                      <span className="text-sm text-cyan-100/80">Time</span>
                      <input
                        type="datetime-local"
                        required
                        value={startsAt}
                        onChange={(eventItem) => setStartsAt(eventItem.target.value)}
                        className={fieldClass}
                      />
                    </label>
                  </div>
                ) : null}

                <input type="hidden" name="title" value={computedTitle} />
                <input type="hidden" name="slug" value={computedSlug} />
                <input type="hidden" name="type" value={computedType} />
                <input type="hidden" name="category" value={computedCategory} />
                <input type="hidden" name="venue" value={venue} />
                <input type="hidden" name="starts_at" value={startsAt} />
                <input type="hidden" name="ends_at" value={computedEndsAt} />
                <input type="hidden" name="sport_id" value={effectiveSportId} />
                <input type="hidden" name="activity_id" value={effectiveActivityId} />
                <input type="hidden" name="status" value={defaults.status} />
                <input type="hidden" name="visibility" value={defaults.visibility} />
                <input type="hidden" name="show_in_schedule" value={defaults.show_in_schedule} />
                <input type="hidden" name="is_registration_open" value={defaults.is_registration_open} />
                <input type="hidden" name="is_featured" value={defaults.is_featured} />
                <input type="hidden" name="registration_deadline" value="" />
                <input type="hidden" name="max_participants" value="" />
                <input type="hidden" name="current_round" value="" />
                <input type="hidden" name="description" value={defaults.description} />
                <input type="hidden" name="icon_key" value={defaults.icon_key} />

                {!selectedActivity ? (
                  <p className="text-xs text-amber-300">
                    No linked activity found for this type. Event will still be created with a generic category.
                  </p>
                ) : null}

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
