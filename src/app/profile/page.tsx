import Link from "next/link";
import { ProfileSettingsForm } from "@/components/forms/ProfileSettingsForm";
import { Button } from "@/components/ui/Button";
import { requireAuth, getCurrentProfile, getCurrentUserRoles } from "@/lib/auth";
import { getUserPredictions, getUserRegistrations } from "@/lib/queries";

export default async function ProfilePage() {
  const user = await requireAuth();
  const [profile, roles, registrations, predictions] = await Promise.all([
    getCurrentProfile(),
    getCurrentUserRoles(),
    getUserRegistrations(user.id),
    getUserPredictions(user.id),
  ]);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12 space-y-8 flex-1">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Your Profile</h1>
        <p className="text-foreground/70">
          Manage account information, track registrations, and monitor your prediction performance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProfileSettingsForm
            profile={{
              full_name: profile?.full_name ?? null,
              school: profile?.school ?? null,
              year_of_study: profile?.year_of_study ?? null,
              username: profile?.username ?? null,
              phone: profile?.phone ?? null,
              bio: profile?.bio ?? null,
              timezone: profile?.timezone ?? null,
            }}
          />
        </div>

        <aside className="rounded-xl border border-card-border bg-card-bg/30 p-6 space-y-4">
          <h2 className="text-xl font-semibold">Account Summary</h2>
          <p className="text-sm text-foreground/70">
            Signed in as <span className="text-foreground">{profile?.email ?? user.email}</span>
          </p>
          <div className="space-y-2">
            <p className="text-sm text-foreground/70">Roles</p>
            <div className="flex flex-wrap gap-2">
              {roles.length > 0 ? (
                roles.map((role) => (
                  <span key={role} className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs uppercase">
                    {role}
                  </span>
                ))
              ) : (
                <span className="text-sm text-foreground/60">participant</span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-lg border border-card-border p-3">
              <p className="text-xs text-foreground/60">Registrations</p>
              <p className="text-2xl font-semibold">{registrations.length}</p>
            </div>
            <div className="rounded-lg border border-card-border p-3">
              <p className="text-xs text-foreground/60">Predictions</p>
              <p className="text-2xl font-semibold">{predictions.length}</p>
            </div>
          </div>
          {roles.includes("admin") ? (
            <div className="rounded-lg border border-cyan-300/40 bg-[linear-gradient(130deg,rgba(6,24,66,0.65),rgba(7,44,74,0.45))] p-4 shadow-[0_0_0_1px_rgba(34,211,238,0.2),0_0_30px_rgba(34,211,238,0.2)]">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/85">Admin Access</p>
              <p className="mt-2 text-sm text-cyan-50/90">
                Manage events, registrations, livestreams, and system settings.
              </p>
              <Button className="mt-4 w-full" variant="neonPill" asChild>
                <Link href="/admin">Open Admin Dashboard</Link>
              </Button>
            </div>
          ) : null}
        </aside>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Your Registrations</h2>
        {registrations.length === 0 ? (
          <div className="rounded-xl border border-card-border p-4 text-foreground/70">
            No registrations yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {registrations.map((registration) => {
              const event = Array.isArray(registration.events)
                ? registration.events[0]
                : registration.events;

              return (
                <div key={registration.id} className="rounded-xl border border-card-border bg-card-bg/20 p-4 space-y-2">
                  <p className="font-semibold">{event?.title ?? "Unknown event"}</p>
                  <p className="text-sm text-foreground/70">
                    {event?.starts_at ? new Date(event.starts_at).toLocaleString() : "Date TBD"} • {event?.venue ?? "Venue TBD"}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full border border-card-border px-2 py-1">
                      registration: {registration.status}
                    </span>
                    <span className="rounded-full border border-card-border px-2 py-1">
                      attendance: {registration.attendance_status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Your Prediction History</h2>
        {predictions.length === 0 ? (
          <div className="rounded-xl border border-card-border p-4 text-foreground/70">
            No predictions yet.
          </div>
        ) : (
          <div className="space-y-3">
            {predictions.slice(0, 20).map((prediction) => {
              const matchRelation = prediction.matches as
                | { team_a?: string; team_b?: string }
                | Array<{ team_a?: string; team_b?: string }>
                | null;
              const match = Array.isArray(matchRelation)
                ? matchRelation[0]
                : matchRelation;
              return (
                <div key={prediction.id} className="rounded-xl border border-card-border bg-card-bg/20 p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {match?.team_a} vs {match?.team_b}
                    </p>
                    <p className="text-sm text-foreground/70">
                      Picked: {prediction.predicted_winner} ({prediction.predicted_score_a}-{prediction.predicted_score_b})
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm uppercase text-foreground/60">{prediction.outcome}</p>
                    <p className="text-xl font-semibold">{prediction.points_awarded ?? 0} pts</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
