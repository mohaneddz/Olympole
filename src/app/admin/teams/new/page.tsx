import { createTeamAction } from "@/app/actions/events";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PlusCircle, UsersRound } from "lucide-react";

export default async function AdminNewTeamPage() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data: sports } = await supabase.from("sports").select("id,name").order("name", { ascending: true });

  return (
    <div className="space-y-8">
      <AdminPageHeader
        icon={<UsersRound className="h-3.5 w-3.5" />}
        title="New Team"
        description="Create or update a team."
      />

      <section className="rounded-2xl border border-card-border bg-card-bg/20 p-5">
        <form action={createTeamAction} className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <select name="sport_id" required className="h-10 rounded border border-card-border bg-background px-3">
            <option value="">Select sport</option>
            {(sports ?? []).map((sport) => (
              <option key={sport.id} value={sport.id}>
                {sport.name}
              </option>
            ))}
          </select>
          <input name="name" required placeholder="Team name" className="h-10 rounded border border-card-border bg-background px-3" />
          <input name="short_code" placeholder="Code" className="h-10 rounded border border-card-border bg-background px-3" />
          <input name="city" placeholder="City" className="h-10 rounded border border-card-border bg-background px-3" />
          <input name="coach_name" placeholder="Coach name" className="md:col-span-4 h-10 rounded border border-card-border bg-background px-3" />
          <button className="md:col-span-4 inline-flex items-center justify-center gap-2 rounded-lg border border-primary/60 px-3 py-2 text-sm">
            <PlusCircle className="h-4 w-4" />
            Save Team
          </button>
        </form>
      </section>
    </div>
  );
}
