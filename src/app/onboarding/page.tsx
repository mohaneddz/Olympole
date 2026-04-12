// src/app/onboarding/page.tsx
import { redirect } from "next/navigation";

export default function OnboardingPage() {
  redirect("/profile");
}

// import { redirect } from "next/navigation";
// import { cookies } from "next/headers";
// import { ProfileCompletionForm } from "@/components/forms/ProfileCompletionForm";
// import { parseProfileDraftCookie, PROFILE_DRAFT_COOKIE } from "@/lib/cookie-drafts";
// import { getCurrentProfile, requireAuth } from "@/lib/auth";

// export default async function OnboardingPage() {
//   await requireAuth();
//   const profile = await getCurrentProfile();
//   const cookieStore = await cookies();
//   const draft = parseProfileDraftCookie(cookieStore.get(PROFILE_DRAFT_COOKIE)?.value);

//   if (
//     profile?.full_name?.trim()
//     && profile?.school?.trim()
//     && profile?.year_of_study?.trim()
//     && profile?.gender?.trim()
//     && profile?.student_id?.trim()
//   ) {
//     redirect("/profile");
//   }

//   return (
//     <div className="container mx-auto px-4 py-16 max-w-2xl flex-1">
//       <ProfileCompletionForm
//         defaultGender={profile?.gender ?? draft?.gender}
//       />
//     </div>
//   );
// }
