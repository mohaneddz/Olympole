import { redirect } from "next/navigation";

export default function LegacyAdminRedirectPage() {
  redirect("/admin/registrations/culture-events");
}

