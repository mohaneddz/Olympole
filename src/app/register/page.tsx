import Link from "next/link";
import { REGISTRATION_ACTIVITIES } from "@/data/registration-activities";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth";
import { getAppSettings } from "@/lib/queries";

const categoryLabel: Record<string, string> = {
  collective_sport: "Collective Sports",
  individual_sport: "Individual Sports",
  culture: "Culture Events",
};

export default async function RegisterPage() {
  const [settings, user, profile] = await Promise.all([
    getAppSettings(),
    getCurrentUser(),
    getCurrentProfile(),
  ]);

  if (!settings.registration_enabled) {
    return (
      <div className="container mx-auto flex min-h-screen max-w-4xl flex-1 items-center px-4 py-16">
        <div className="w-full rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-6 text-yellow-200">
          Registration is currently closed by administrators.
        </div>
      </div>
    );
  }

  // No auth redirect — guests are welcome to browse and register.
  const isLoggedIn = !!user;
  const hasCompleteProfile =
    isLoggedIn &&
    !!profile?.full_name &&
    !!profile?.school &&
    !!profile?.year_of_study &&
    !!profile?.student_id;

  return (
    <div className="container mx-auto flex max-w-6xl flex-1 flex-col gap-10 px-4 py-12 md:py-16">
      <section className="text-center">
        <h1 className="text-4xl font-black tracking-tight md:text-6xl">
          Activity Registration Portal
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-foreground/70">
          Choose one of the 10 activities below. No account required — fill in
          your details directly on the registration form. Creating an account
          lets you track your registration status later.
        </p>

        {/* Contextual nudge — only shown to logged-in users with incomplete profiles */}
        {isLoggedIn && !hasCompleteProfile && (
          <p className="mx-auto mt-3 max-w-xl text-sm text-yellow-300/80">
            Your profile is incomplete.{" "}
            <Link href="/onboarding" className="underline underline-offset-2">
              Complete it
            </Link>{" "}
            to have your details pre-filled on registration forms.
          </p>
        )}

        {/* CTA for guests */}
        {!isLoggedIn && (
          <p className="mx-auto mt-3 max-w-xl text-sm text-foreground/50">
            Already have an account?{" "}
            <Link href="/login" className="text-primary underline underline-offset-2">
              Log in
            </Link>{" "}
            to track your registrations.
          </p>
        )}
      </section>

      {(["collective_sport", "individual_sport", "culture"] as const).map((category) => {
        const items = REGISTRATION_ACTIVITIES.filter((item) => item.category === category);
        return (
          <section key={category} className="space-y-4">
            <h2 className="text-2xl font-bold">{categoryLabel[category]}</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {items.map((activity) => (
                <Link
                  key={activity.slug}
                  href={`/register/${activity.slug}`}
                  className="group rounded-2xl border border-card-border bg-card-bg/20 p-5 transition hover:border-primary/60 hover:bg-card-bg/40"
                >
                  <h3 className="text-xl font-semibold">{activity.title}</h3>
                  <p className="mt-2 text-sm text-foreground/70">{activity.shortDescription}</p>
                  <p className="mt-4 text-sm font-semibold text-primary">Open form →</p>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}