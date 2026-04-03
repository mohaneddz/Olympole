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

  if (!profile?.full_name || !profile?.school || !profile?.year_of_study) {
    return (
      <div className="container mx-auto flex min-h-screen max-w-4xl flex-1 items-center px-4 py-16">
        <div className="w-full space-y-4 rounded-2xl border border-card-border bg-card-bg/20 p-8">
          <h1 className="text-3xl font-black">Complete your profile first</h1>
          <p className="text-foreground/70">
            Before registering to {activity.title}, please complete your profile with name, school, and study year.
          </p>
          <Link href="/onboarding" className="inline-flex rounded-lg border border-primary/60 px-4 py-2 text-primary">
            Go to onboarding
          </Link>
        </div>
      </div>
    );
  }

  const { data: events } = await supabase
    .from("events")
    .select("id, title, starts_at, venue, status, is_registration_open, sports!inner(slug)")
    .eq("sports.slug", activity.slug)
    .eq("is_registration_open", true)
    .in("status", ["scheduled", "live"])
    .order("starts_at", { ascending: true });

  const openEvents = (events ?? []).map((event) => ({
    id: event.id,
    title: event.title,
    starts_at: event.starts_at,
    venue: event.venue,
  }));

  const draft = parseRegistrationDraftCookie(
    cookieStore.get(getRegistrationDraftCookieName(activity.slug))?.value
  );

  const highlightedDateLabel = openEvents[0]
    ? new Date(openEvents[0].starts_at).toLocaleDateString()
    : "the selected event date";

  return (
    <div className="container mx-auto flex min-h-screen max-w-5xl flex-1 flex-col gap-8 px-4 py-12 md:py-16">
      <section className="space-y-4 text-center">
        <p className="inline-flex items-center rounded-full border border-card-border px-3 py-1 text-xs uppercase tracking-[0.2em] text-foreground/70">
          {activity.category.replace("_", " ")}
        </p>
        <h1 className="text-4xl font-black tracking-tight md:text-6xl">
          <span className={`bg-gradient-to-r ${activity.heroGradient} bg-clip-text text-transparent`}>
            {activity.title} Registration
          </span>
        </h1>
        <p className="mx-auto max-w-2xl text-foreground/70">{activity.shortDescription}</p>
      </section>

      <ActivityRegistrationForm
        activity={activity}
        events={openEvents}
        highlightedDateLabel={highlightedDateLabel}
        defaults={{
          full_name: draft?.full_name ?? profile.full_name ?? "",
          email: draft?.email ?? profile.email ?? user.email ?? "",
          phone: draft?.phone ?? profile.phone ?? "",
          department_or_school: draft?.department_or_school ?? profile.school ?? "",
          team_name: draft?.team_name ?? "",
          emergency_contact: draft?.emergency_contact ?? "",
          previous_experience: draft?.previous_experience ?? "",
          motivation: draft?.motivation ?? "",
          availability_date: draft?.availability_date ?? "",
          preferred_role: draft?.preferred_role ?? "",
          additional_notes: draft?.additional_notes ?? "",
          detail_strengths: draft?.detail_strengths ?? "",
          detail_schedule: draft?.detail_schedule ?? "",
        }}
      />
    </div>
  );
}
