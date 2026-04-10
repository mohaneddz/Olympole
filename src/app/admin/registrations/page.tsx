import { redirect } from "next/navigation";

export default function LegacyAdminRedirectPage() {
  redirect("/admin/registrations/collective-sports");
}

