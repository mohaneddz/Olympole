import Link from "next/link";
import { notFound } from "next/navigation";
import { ActivityRegistrationForm } from "@/components/forms/ActivityRegistrationForm";
import { getRegistrationActivityBySlug } from "@/data/registration-activities";
import { getManagedActivityBySlug } from "@/lib/activity-registry";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth";
import { getAppSettings } from "@/lib/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function normalizeProfileGenderToCategory(
  value: string | null | undefined,
): "men" | "women" | "" {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();
  if (["man", "male", "men"].includes(normalized)) return "men";
  if (["woman", "female", "women"].includes(normalized)) return "women";
  return "";
}

function getBackHrefForActivityCategory(category: string) {
  if (category === "culture") {
    return "/culture";
  }

  return "/sports";
}

function getActivityRegistrationSelect(slug: string) {
  const baseSelect =
    "id, event_id, status, created_at, full_name, email, phone, department_or_school, team_name, additional_notes, emergency_contact, previous_experience, motivation, preferred_role, events(id,title,starts_at,venue,status,is_registration_open)";

  if (["football", "basketball", "handball", "volleyball"].includes(slug)) {
    return `${baseSelect}, detail_gender`;
  }

  if (slug === "chess") {
    return `${baseSelect}, detail_elo_rating, detail_participated_before`;
  }

  if (slug === "running") {
    return `${baseSelect}, detail_running_distance, detail_joined_marathon_before`;
  }

  if (slug === "talent-show") {
    return `${baseSelect}, detail_talent_type, detail_talent_type_other, detail_performance_description, detail_participated_before`;
  }

  if (slug === "writing-contest") {
    return `${baseSelect}, detail_writing_category, detail_participated_before`;
  }

  if (slug === "art-exhibition") {
    return `${baseSelect}, detail_art_category, detail_participated_before`;
  }

  return baseSelect;
}

export default async function ActivityRegistrationPage({
  params,
}: {
  params: Promise<{ activity: string }>;
}) {
  const { activity: activitySlug } = await params;
  const activity = getRegistrationActivityBySlug(activitySlug);
  if (!activity) {
    notFound();
  }

  const managedActivity = getManagedActivityBySlug(activity.slug);
  if (!managedActivity) {
    notFound();
  }

  const [settings, user] = await Promise.all([
    getAppSettings(),
    getCurrentUser(),
  ]);

  if (!settings.registration_enabled) {
    return (
      <div className="container mx-auto flex min-h-screen max-w-4xl flex-1 items-center px-4 py-16">
        <div className="w-full rounded-2xl border border-yellow-400/40 bg-yellow-400/10 p-6 text-yellow-200">
          Registration is currently disabled by administrators.
        </div>
      </div>
    );
  }

  const backHref = getBackHrefForActivityCategory(activity.category);

  // ── Guest path ────────────────────────────────────────────────────────────
  // No account required. Fetch available events, render the form with blank
  // defaults. user_id / profile_id will be null on submission.
  if (!user) {
    const supabase = await createSupabaseServerClient();

    const { data: events } = await supabase
      .from("events")
      .select(
        "id, title, starts_at, venue, status, is_registration_open, activities!inner(slug)",
      )
      .eq("activities.slug", activity.slug)
      .order("starts_at", { ascending: true });

    const linkedEvents = (events ?? []).map((event) => ({
      id: event.id,
      title: event.title,
      starts_at: event.starts_at,
      venue: event.venue,
      status: event.status,
      is_registration_open: event.is_registration_open,
    }));

    return (
      <div className="container mx-auto flex min-h-screen max-w-6xl flex-1 flex-col gap-8 px-4 py-12 md:py-16">
        <section className="space-y-4 text-center">
          <div className="flex justify-start">
            <Link
              href={backHref}
              className="inline-flex items-center rounded-lg border border-cyan-300/40 px-3 py-1.5 text-sm text-cyan-100 hover:bg-cyan-400/15"
            >
              Go back
            </Link>
          </div>
          <p className="inline-flex items-center rounded-full border border-card-border px-3 py-1 text-xs uppercase tracking-[0.2em] text-foreground/70">
            {activity.category.replace("_", " ")}
          </p>
          <h1 className="text-4xl font-black tracking-tight md:text-6xl">
            <span
              className={`bg-gradient-to-r ${activity.heroGradient} bg-clip-text text-transparent`}
            >
              {activity.title} Registration
            </span>
          </h1>
          <p className="mx-auto max-w-3xl text-lg text-foreground/80">
            {activity.shortDescription}
          </p>
        </section>

        <ActivityRegistrationForm
          activity={activity}
          events={linkedEvents}
          lockedGenderCategory=""
          existingRegistration={null}
          defaults={{
            event_id: linkedEvents[0]?.id ?? "",
            full_name: "",
            email: "",
            phone: "",
            department_or_school: "",
            team_name: "",
            emergency_contact: "",
            previous_experience: "",
            motivation: "",
            availability_date: "",
            preferred_role: "",
            additional_notes: "",
            detail_gender: activity.slug === "football" ? "men" : "",
            detail_competition_level: "",
            detail_running_distance: "",
            detail_joined_marathon_before: "no",
            detail_participated_before: "no",
            detail_elo_rating: "",
            detail_talent_type: "",
            detail_talent_type_other: "",
            detail_performance_description: "",
            detail_writing_category: "",
            detail_art_category: "",
            detail_strengths: "",
            detail_schedule: "",
          }}
        />
      </div>
    );
  }

  // ── Authenticated path ─────────────────────────────────────────────────────
  // User is logged in. We attempt to pre-fill from their profile and load
  // any existing registration. Profile completeness is no longer a hard gate
  // — the form will just have fewer pre-filled fields if the profile is sparse.
  const [profile, supabase] = await Promise.all([
    getCurrentProfile(),
    createSupabaseServerClient(),
  ]);

  const [{ data: events }, { data: existingRows }] = await Promise.all([
    supabase
      .from("events")
      .select(
        "id, title, starts_at, venue, status, is_registration_open, activities!inner(slug)",
      )
      .eq("activities.slug", activity.slug)
      .order("starts_at", { ascending: true }),
    (supabase as any)
      .from(managedActivity.tableName)
      .select(getActivityRegistrationSelect(activity.slug))
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  const existingRegistration = existingRows?.[0] ?? null;

  const linkedEvents = (events ?? []).map((event) => ({
    id: event.id,
    title: event.title,
    starts_at: event.starts_at,
    venue: event.venue,
    status: event.status,
    is_registration_open: event.is_registration_open,
  }));

  const existingEventRelation = Array.isArray(existingRegistration?.events)
    ? existingRegistration?.events[0]
    : existingRegistration?.events;

  const includesExistingEvent =
    !!existingRegistration?.event_id &&
    linkedEvents.some((event) => event.id === existingRegistration.event_id);

  const allEvents =
    existingEventRelation && !includesExistingEvent
      ? [
          {
            id: existingEventRelation.id,
            title: existingEventRelation.title,
            starts_at: existingEventRelation.starts_at,
            venue: existingEventRelation.venue,
            status: existingEventRelation.status,
            is_registration_open: existingEventRelation.is_registration_open,
          },
          ...linkedEvents,
        ]
      : linkedEvents;

  const defaultEventId =
    existingRegistration?.event_id ?? allEvents[0]?.id ?? "";
  const lockedGenderCategory = normalizeProfileGenderToCategory(
    profile?.gender,
  );

  return (
    <div className="container mx-auto flex min-h-screen max-w-6xl flex-1 flex-col gap-8 px-4 py-12 md:py-16">
      <section className="space-y-4 text-center">
        <div className="flex justify-start">
          <Link
            href={backHref}
            className="inline-flex items-center rounded-lg border border-cyan-300/40 px-3 py-1.5 text-sm text-cyan-100 hover:bg-cyan-400/15"
          >
            Go back
          </Link>
        </div>
        <p className="inline-flex items-center rounded-full border border-card-border px-3 py-1 text-xs uppercase tracking-[0.2em] text-foreground/70">
          {activity.category.replace("_", " ")}
        </p>
        <h1 className="text-4xl font-black tracking-tight md:text-6xl">
          <span
            className={`bg-gradient-to-r ${activity.heroGradient} bg-clip-text text-transparent`}
          >
            {activity.title} Registration
          </span>
        </h1>
        <p className="mx-auto max-w-3xl text-lg text-foreground/80">
          {activity.shortDescription}
        </p>
      </section>

      <ActivityRegistrationForm
        activity={activity}
        events={allEvents}
        lockedGenderCategory={lockedGenderCategory}
        existingRegistration={
          existingRegistration
            ? {
                id: existingRegistration.id,
                status: existingRegistration.status,
                created_at: existingRegistration.created_at,
              }
            : null
        }
        defaults={{
          event_id: defaultEventId,
          full_name:
            existingRegistration?.full_name ?? profile?.full_name ?? "",
          email:
            existingRegistration?.email ?? profile?.email ?? user.email ?? "",
          phone: existingRegistration?.phone ?? profile?.phone ?? "",
          department_or_school:
            existingRegistration?.department_or_school ?? profile?.school ?? "",
          team_name: existingRegistration?.team_name ?? "",
          emergency_contact: existingRegistration?.emergency_contact ?? "",
          previous_experience: existingRegistration?.previous_experience ?? "",
          motivation: existingRegistration?.motivation ?? "",
          availability_date: "",
          preferred_role: existingRegistration?.preferred_role ?? "",
          additional_notes: "",
          detail_gender:
            lockedGenderCategory ||
            String(existingRegistration?.detail_gender ?? "") ||
            (activity.slug === "football" ? "men" : ""),
          detail_competition_level:
            String(existingRegistration?.detail_competition_level ?? "") || "",
          detail_running_distance:
            String(existingRegistration?.detail_running_distance ?? "") || "",
          detail_joined_marathon_before:
            String(existingRegistration?.detail_joined_marathon_before ?? "") ||
            "no",
          detail_participated_before:
            String(existingRegistration?.detail_participated_before ?? "") ||
            "no",
          detail_elo_rating:
            String(existingRegistration?.detail_elo_rating ?? "") || "",
          detail_talent_type:
            String(existingRegistration?.detail_talent_type ?? "") || "",
          detail_talent_type_other:
            String(existingRegistration?.detail_talent_type_other ?? "") || "",
          detail_performance_description:
            String(
              existingRegistration?.detail_performance_description ?? "",
            ) || "",
          detail_writing_category:
            String(existingRegistration?.detail_writing_category ?? "") || "",
          detail_art_category:
            String(existingRegistration?.detail_art_category ?? "") || "",
          detail_strengths: "",
          detail_schedule: "",
        }}
      />
    </div>
  );
}
