import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminUsersDashboard } from "@/components/admin/AdminUsersDashboard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Users } from "lucide-react";

export default async function AdminUsersPage() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email, school, year_of_study, username, phone, avatar_url, role, created_at, last_seen_at")
    .order("created_at", { ascending: false })
    .limit(1000);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        icon={<Users className="h-3.5 w-3.5" />}
        title="User Management"
        description="Manage user roles, profile data, and account visibility."
        stats={[
          { label: "Users", value: profiles?.length ?? 0 },
          {
            label: "Admins",
            value: (profiles ?? []).filter((user) => user.role === "admin").length,
          },
        ]}
      />
      <AdminUsersDashboard profiles={profiles ?? []} />
    </div>
  );
}
