import { redirect } from "next/navigation";
import { ProfileCompletionForm } from "@/components/forms/ProfileCompletionForm";
import { getCurrentProfile, requireAuth } from "@/lib/auth";

export default async function OnboardingPage() {
  await requireAuth();
  const profile = await getCurrentProfile();

  if (profile?.full_name && profile?.school && profile?.year_of_study) {
    if (profile.role === "admin") {
      redirect("/admin");
    }
    redirect("/");
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl flex-1">
      <ProfileCompletionForm
        defaultName={profile?.full_name}
        defaultSchool={profile?.school}
        defaultYear={profile?.year_of_study}
      />
    </div>
  );
}
