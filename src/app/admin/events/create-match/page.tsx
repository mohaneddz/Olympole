import { CreateMatchAdminForm } from "@/components/admin/AdminEventCreateForms";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminCreateMatchPage() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const [{ data: events }, { data: teams }] = await Promise.all([
    supabase.from("events").select("id,title").order("starts_at", { ascending: true }),
    supabase.from("teams").select("id,name").order("name", { ascending: true }),
  ]);

  return (
    <div className="space-y-6">
      <CreateMatchAdminForm events={events ?? []} teams={teams ?? []} />
    </div>
  );
}
