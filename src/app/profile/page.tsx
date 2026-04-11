import { ProfileSettingsForm } from "@/components/forms/ProfileSettingsForm";
import { ActivityPanel } from "@/components/profile/ActivityPanel";
import { ProfileHeaderCard } from "@/components/profile/ProfileHeaderCard";
import Link from "next/link";
import { requireAuth, getCurrentProfile, getCurrentUserRoles } from "@/lib/auth";
import { getAdminEmails } from "@/lib/env";
import { getUserPredictions, getUserRegistrations } from "@/lib/queries";
import { Shield } from "lucide-react";

function schoolLabel(value: string | null | undefined) {
  if (!value) {
    return "School not set";
  }

  if (value === "ENSIA") {
    return "Ecole Nationale Superieure d'Informatique";
  }

  return value;
}

function initialsFromName(name: string | null, fallback: string) {
  if (name?.trim()) {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }

  return fallback.slice(0, 2).toUpperCase();
}

export default async function ProfilePage() {
  const user = await requireAuth();
  const [profile, roles, registrations, predictions] = await Promise.all([
    getCurrentProfile(),
    getCurrentUserRoles(),
    getUserRegistrations(user.id),
    getUserPredictions(user.id),
  ]);

  const displayName = profile?.full_name ?? "Participant";
  const displayEmail = profile?.email ?? user.email ?? "Unknown email";
  const initials = initialsFromName(profile?.full_name ?? null, displayEmail);
  const school = schoolLabel(profile?.school);
  const timezone = profile?.timezone || "Africa/Algiers";
  const yearLabel = profile?.year_of_study ?? "";
  const isAdmin = roles.includes("admin");
  const isEnvAdmin = getAdminEmails().includes((user.email ?? "").toLowerCase());

  const activityRegistrations = registrations.map((registration) => {
    if (!["pending", "approved"].includes(registration.status)) {
      return null;
    }

    return {
      id: registration.id,
      title: registration.activity_title || registration.activity_slug || "Unknown activity",
      statusLabel: registration.status === "approved" ? "Accepted" : "Pending",
      activityType: registration.category_type,
    };
  }).filter((registration): registration is NonNullable<typeof registration> => Boolean(registration));

  return (
    <div className="w-full min-h-screen">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 md:py-14">
        <ProfileHeaderCard
          displayName={displayName}
          displayEmail={displayEmail}
          schoolLabel={`${profile?.school ?? "School"} - ${school}`}
          timezone={timezone}
          yearLabel={yearLabel}
          avatarUrl={profile?.avatar_url ?? null}
          initials={initials}
          registrationsCount={registrations.length}
          predictionsCount={predictions.length}
          roleLabel={isAdmin ? "Admin" : "Participant"}
          avatarSeed={profile?.id ?? displayEmail}
        />

        <div className="mt-6 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
          <section id="profile-info" className="h-full lg:col-span-7">
            <ProfileSettingsForm
              profile={{
                full_name: profile?.full_name ?? null,
                school: profile?.school ?? null,
                year_of_study: profile?.year_of_study ?? null,
                student_id: profile?.student_id ?? null,
                username: profile?.username ?? null,
                phone: profile?.phone ?? null,
                bio: profile?.bio ?? null,
                timezone: profile?.timezone ?? null,
              }}
            />
          </section>

          <section className="h-full lg:col-span-5">
            <ActivityPanel registrations={activityRegistrations} />
          </section>
        </div>
      </div>

      {isEnvAdmin ? (
        <Link
          href="/admin"
          aria-label="Open Admin Dashboard"
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-cyan-300/70 bg-[linear-gradient(145deg,rgba(8,30,72,0.95),rgba(6,22,58,0.92))] text-cyan-100 shadow-[0_0_0_1px_rgba(34,211,238,0.4),0_0_24px_rgba(34,211,238,0.45)] transition-transform hover:scale-105 hover:text-white"
        >
          <Shield className="h-6 w-6" />
        </Link>
      ) : null}
    </div>
  );
}
