import { createTournamentAction } from "@/app/actions/admin-management";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { GitBranch, PlusCircle } from "lucide-react";

export default async function AdminNewTournamentPage() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const [{ data: sports }, { data: events }] = await Promise.all([
    supabase.from("sports").select("id, name").order("name", { ascending: true }),
    supabase.from("events").select("id, title").order("starts_at", { ascending: true }),
  ]);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        icon={<GitBranch className="h-3.5 w-3.5" />}
        title="New Tournament"
        description="Create a tournament and link it to a sport/event."
      />

      <section className="rounded-2xl border border-card-border bg-card-bg/20 p-5">
        <form action={createTournamentAction} className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <input name="name" required placeholder="Tournament name" className="h-10 rounded border border-card-border bg-background px-3" />
          <select name="sport_id" className="h-10 rounded border border-card-border bg-background px-3">
            <option value="">No linked sport</option>
            {(sports ?? []).map((sport) => (
              <option key={sport.id} value={sport.id}>
                {sport.name}
              </option>
            ))}
          </select>
          <select name="event_id" className="h-10 rounded border border-card-border bg-background px-3">
            <option value="">No linked event</option>
            {(events ?? []).map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
          <select name="format" defaultValue="knockout" className="h-10 rounded border border-card-border bg-background px-3">
            <option value="knockout">knockout</option>
            <option value="group">group</option>
            <option value="league">league</option>
            <option value="hybrid">hybrid</option>
          </select>
          <select name="status" defaultValue="draft" className="h-10 rounded border border-card-border bg-background px-3">
            <option value="draft">draft</option>
            <option value="scheduled">scheduled</option>
            <option value="live">live</option>
            <option value="completed">completed</option>
            <option value="cancelled">cancelled</option>
          </select>
          <input name="starts_at" type="datetime-local" className="h-10 rounded border border-card-border bg-background px-3" />
          <textarea name="notes" placeholder="Notes" className="md:col-span-3 min-h-20 rounded border border-card-border bg-background px-3 py-2" />
          <button className="md:col-span-3 inline-flex items-center justify-center gap-2 rounded-lg border border-primary/60 px-3 py-2 text-sm">
            <PlusCircle className="h-4 w-4" />
            Create Tournament
          </button>
        </form>
      </section>
    </div>
  );
}
