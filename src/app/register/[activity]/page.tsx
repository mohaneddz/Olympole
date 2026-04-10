import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { ActivityRegistrationForm } from "@/components/forms/ActivityRegistrationForm";
import { getRegistrationActivityBySlug } from "@/data/registration-activities";
import {
  getRegistrationDraftCookieName,
  parseRegistrationDraftCookie,
} from "@/lib/cookie-drafts";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth";
import { getAppSettings } from "@/lib/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function readDetail(details: unknown, key: string) {
  if (!details || typeof details !== "object" || Array.isArray(details)) {
    return "";
  }

  const value = (details as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
}

function pickFirstNonEmpty(...values: Array<string | null | undefined>) {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }
  return "";
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

  const [settings, user] = await Promise.all([getAppSettings(), getCurrentUser()]);

  if (!settings.registration_enabled) {
    return (
      <div className="container mx-auto flex min-h-screen max-w-4xl flex-1 items-center px-4 py-16">
        <div className="w-full rounded-2xl border border-yellow-400/40 bg-yellow-400/10 p-6 text-yellow-200">
          Registration is currently disabled by administrators.
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto flex min-h-screen max-w-4xl flex-1 items-center px-4 py-16">
        <div className="w-full space-y-4 rounded-2xl border border-card-border bg-card-bg/20 p-8">
          <h1 className="text-3xl font-black">Register for {activity.title}</h1>
          <p className="text-foreground/70">
            You need an account first. Your registration draft will be saved in cookies once you start filling this
            form.
          </p>
          <Link href="/login" className="inline-flex rounded-lg border border-primary/60 px-4 py-2 text-primary">
            Login / Create account
          </Link>
        </div>
      </div>
    );
  }

  const [profile, cookieStore, supabase] = await Promise.all([
    getCurrentProfile(),
    cookies(),
    createSupabaseServerClient(),
  ]);

  if (!profile?.full_name || !profile?.school || !profile?.year_of_study || !profile?.student_id) {
    return (
      <div className="container mx-auto flex min-h-screen max-w-4xl flex-1 items-center px-4 py-16">
        <div className="w-full space-y-4 rounded-2xl border border-card-border bg-card-bg/20 p-8">
          <h1 className="text-3xl font-black">Complete your profile first</h1>
          <p className="text-foreground/70">
            Before registering to {activity.title}, please complete your profile with name, school, study year, and student ID.
          </p>
          <Link href="/onboarding" className="inline-flex rounded-lg border border-primary/60 px-4 py-2 text-primary">
            Go to onboarding
          </Link>
        </div>
      </div>
    );
  }

  const [{ data: events }, { data: existingRows }] = await Promise.all([
    supabase
      .from("events")
      .select("id, title, starts_at, venue, status, is_registration_open, sports!inner(slug)")
      .eq("sports.slug", activity.slug)
      .eq("is_registration_open", true)
      .in("status", ["scheduled", "live"])
      .order("starts_at", { ascending: true }),
    supabase
      .from("registrations")
      .select(
        "id, event_id, status, created_at, full_name, email, phone, department_or_school, team_name, additional_notes, emergency_contact, previous_experience, motivation, availability_date, preferred_role, registration_details, events(id,title,starts_at,venue,status,is_registration_open)"
      )
      .eq("user_id", user.id)
      .eq("activity_slug", activity.slug)
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  const existingRegistration = existingRows?.[0] ?? null;

  const openEvents = (events ?? []).map((event) => ({
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
    !!existingRegistration?.event_id && openEvents.some((event) => event.id === existingRegistration.event_id);

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
          ...openEvents,
        ]
      : openEvents;

  const draft = parseRegistrationDraftCookie(
    cookieStore.get(getRegistrationDraftCookieName(activity.slug))?.value
  );

  const details = existingRegistration?.registration_details;

  const defaultEventId = existingRegistration?.event_id ?? draft?.event_id ?? allEvents[0]?.id ?? "";

  return (
    <div className="container mx-auto flex min-h-screen max-w-6xl flex-1 flex-col gap-8 px-4 py-12 md:py-16">
      <section className="space-y-4 text-center">
        <p className="inline-flex items-center rounded-full border border-card-border px-3 py-1 text-xs uppercase tracking-[0.2em] text-foreground/70">
          {activity.category.replace("_", " ")}
        </p>
        <h1 className="text-4xl font-black tracking-tight md:text-6xl">
          <span className={`bg-gradient-to-r ${activity.heroGradient} bg-clip-text text-transparent`}>
            {activity.title} Registration
          </span>
        </h1>
        <p className="mx-auto max-w-3xl text-lg text-foreground/80">{activity.shortDescription}</p>
      </section>

      <ActivityRegistrationForm
        activity={activity}
        events={allEvents}
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
          full_name: pickFirstNonEmpty(existingRegistration?.full_name, draft?.full_name, profile.full_name),
          email: pickFirstNonEmpty(existingRegistration?.email, draft?.email, profile.email, user.email),
          phone: pickFirstNonEmpty(existingRegistration?.phone, draft?.phone, profile.phone),
          department_or_school: pickFirstNonEmpty(existingRegistration?.department_or_school, draft?.department_or_school, profile.school),
          team_name: existingRegistration?.team_name ?? draft?.team_name ?? "",
          emergency_contact: existingRegistration?.emergency_contact ?? draft?.emergency_contact ?? "",
          previous_experience: existingRegistration?.previous_experience ?? draft?.previous_experience ?? "",
          motivation: existingRegistration?.motivation ?? draft?.motivation ?? "",
          availability_date: "",
          preferred_role: existingRegistration?.preferred_role ?? draft?.preferred_role ?? "",
          additional_notes: "",
          detail_gender: readDetail(details, "gender") || draft?.detail_gender || (activity.slug === "football" ? "men" : ""),
          detail_competition_level: readDetail(details, "competition_level") || draft?.detail_competition_level || "",
          detail_race_category: readDetail(details, "race_category") || draft?.detail_race_category || "",
          detail_elo_rating: readDetail(details, "elo_rating") || draft?.detail_elo_rating || "",
          detail_talent_type: readDetail(details, "talent_type") || draft?.detail_talent_type || "",
          detail_performance_description: readDetail(details, "performance_description") || draft?.detail_performance_description || "",
          detail_art_category: readDetail(details, "art_category") || draft?.detail_art_category || "",
          detail_strengths: "",
          detail_schedule: "",
        }}
      />
    </div>
  );
}
