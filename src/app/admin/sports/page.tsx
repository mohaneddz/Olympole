import { AdminSportsOnlyDashboard } from "@/components/admin/AdminSportsOnlyDashboard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PlusCircle, Shield } from "lucide-react";
import Link from "next/link";

export default async function AdminSportsPage() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const [{ data: sports }, { count: teamsCount }] = await Promise.all([
    supabase
    .from("sports")
    .select("id, name, slug, sport_type, is_team_based, gender_division, is_active, created_at")
      .order("name", { ascending: true }),
    supabase.from("teams").select("*", { count: "exact", head: true }),
  ]);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        icon={<Shield className="h-3.5 w-3.5" />}
        title="Sports"
        description="Manage sports taxonomy and configuration."
        actions={
          <Link href="/admin/sports/new" className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/40 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-100">
            <PlusCircle className="h-4 w-4" />
            New Sport
          </Link>
        }
        stats={[
          { label: "Sports", value: sports?.length ?? 0 },
          { label: "Teams Linked", value: teamsCount ?? 0 },
        ]}
      />
      <AdminSportsOnlyDashboard sports={sports ?? []} />
    </div>
  );
}
