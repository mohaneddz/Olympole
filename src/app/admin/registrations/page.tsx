import { AdminRegistrationsDashboard } from "@/components/admin/AdminRegistrationsDashboard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ClipboardList } from "lucide-react";

export default async function AdminRegistrationsPage() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const [{ data: registrations }, { data: teams }] = await Promise.all([
    supabase
      .from("registrations")
      .select(
        "id, profile_id, full_name, email, phone, department_or_school, category_type, activity_slug, status, attendance_status, team_id, team_name, previous_experience, motivation, availability_date, preferred_role, created_at, events(title,slug,starts_at)"
      )
      .order("created_at", { ascending: false })
      .limit(1000),
    supabase
      .from("teams")
      .select("id, name, sports(name)")
      .order("name", { ascending: true }),
  ]);

  const normalizedRegistrations = (registrations ?? []).map((row) => {
    const event = Array.isArray(row.events) ? row.events[0] : row.events;
    return {
      id: row.id,
      profile_id: row.profile_id,
      full_name: row.full_name,
      email: row.email,
      phone: row.phone,
      department_or_school: row.department_or_school,
      category_type: row.category_type,
      activity_slug: row.activity_slug,
      status: row.status,
      attendance_status: row.attendance_status,
      team_id: row.team_id,
      team_name: row.team_name,
      previous_experience: row.previous_experience,
      motivation: row.motivation,
      availability_date: row.availability_date,
      preferred_role: row.preferred_role,
      created_at: row.created_at,
      event_title: event?.title ?? "-",
      event_slug: event?.slug ?? "-",
      event_starts_at: event?.starts_at ?? row.created_at,
    };
  });

  const normalizedTeams = (teams ?? []).map((row) => {
    const sport = Array.isArray(row.sports) ? row.sports[0] : row.sports;
    return {
      id: row.id,
      name: row.name,
      sport_name: sport?.name ?? "Unknown",
    };
  });

  return (
    <div className="space-y-8">
      <AdminPageHeader
        icon={<ClipboardList className="h-3.5 w-3.5" />}
        title="Registrations"
        description="Review registrations, approve/reject, and assign teams."
        stats={[
          { label: "Registrations", value: normalizedRegistrations.length },
          { label: "Teams", value: normalizedTeams.length },
        ]}
      />
      <AdminRegistrationsDashboard
        registrations={normalizedRegistrations}
        teams={normalizedTeams}
      />
    </div>
  );
}
