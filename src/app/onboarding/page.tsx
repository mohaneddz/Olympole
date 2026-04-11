import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ProfileCompletionForm } from "@/components/forms/ProfileCompletionForm";
import { parseProfileDraftCookie, PROFILE_DRAFT_COOKIE } from "@/lib/cookie-drafts";
import { getCurrentProfile, requireAuth } from "@/lib/auth";

export default async function OnboardingPage() {
  await requireAuth();
  const profile = await getCurrentProfile();
  const cookieStore = await cookies();
  const draft = parseProfileDraftCookie(cookieStore.get(PROFILE_DRAFT_COOKIE)?.value);

  if (
    profile?.full_name?.trim()
    && profile?.school?.trim()
    && profile?.year_of_study?.trim()
    && profile?.gender?.trim()
    && profile?.student_id?.trim()
  ) {
    if (profile.role === "admin") {
      redirect("/admin");
    }
    redirect("/");
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl flex-1">
      <ProfileCompletionForm
        defaultName={profile?.full_name ?? draft?.full_name}
        defaultSchool={profile?.school ?? draft?.school}
        defaultYear={profile?.year_of_study ?? draft?.year_of_study}
        defaultGender={profile?.gender ?? draft?.gender}
        defaultStudentId={profile?.student_id ?? draft?.student_id}
      />
    </div>
  );
}
