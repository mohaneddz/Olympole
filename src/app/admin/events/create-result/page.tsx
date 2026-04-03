import { CreateResultAdminForm } from "@/components/admin/AdminEventCreateForms";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminCreateResultPage() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data: events } = await supabase.from("events").select("id,title").order("starts_at", { ascending: true });

  return (
    <div className="space-y-6">
      <CreateResultAdminForm events={events ?? []} />
    </div>
  );
}
