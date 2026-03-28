import { createSportAction, createTeamAction, deleteSportAction, deleteTeamAction } from "@/app/actions/events";
import { requireAdmin } from "@/lib/auth";
import { getPublicSports } from "@/lib/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminSportsPage() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const [sports, teamsResponse] = await Promise.all([
    getPublicSports(),
    supabase
      .from("teams")
      .select("id, name, short_code, city, coach_name, sport_id, sports(name)")
      .order("name", { ascending: true }),
  ]);
  const teams = teamsResponse.data ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Sports & Teams Management</h1>
        <p className="text-foreground/60">Maintain the sports catalog and participating teams.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form action={createSportAction} className="rounded-xl border border-card-border p-4 space-y-3">
          <h2 className="font-semibold">Create / Update Sport</h2>
          <input name="name" required placeholder="Sport name" className="w-full h-10 px-3 rounded bg-background border border-card-border" />
          <input name="slug" required placeholder="sport-slug" className="w-full h-10 px-3 rounded bg-background border border-card-border" />
          <div className="grid grid-cols-2 gap-3">
            <select name="sport_type" className="h-10 px-3 rounded bg-background border border-card-border">
              <option value="collective">collective</option>
              <option value="individual">individual</option>
              <option value="culture">culture</option>
            </select>
            <input name="gender_division" placeholder="mixed / men_women" className="h-10 px-3 rounded bg-background border border-card-border" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select name="is_team_based" defaultValue="false" className="h-10 px-3 rounded bg-background border border-card-border">
              <option value="false">team based: no</option>
              <option value="true">team based: yes</option>
            </select>
            <select name="is_active" defaultValue="true" className="h-10 px-3 rounded bg-background border border-card-border">
              <option value="true">active</option>
              <option value="false">inactive</option>
            </select>
          </div>
          <textarea name="description" placeholder="Description" className="w-full min-h-20 px-3 py-2 rounded bg-background border border-card-border" />
          <button className="px-4 py-2 rounded border border-primary/50">Save Sport</button>
        </form>

        <form action={createTeamAction} className="rounded-xl border border-card-border p-4 space-y-3">
          <h2 className="font-semibold">Create / Update Team</h2>
          <select name="sport_id" required className="w-full h-10 px-3 rounded bg-background border border-card-border">
            <option value="">Select sport</option>
            {sports.map((sport) => (
              <option key={sport.id} value={sport.id}>
                {sport.name}
              </option>
            ))}
          </select>
          <input name="name" required placeholder="Team name" className="w-full h-10 px-3 rounded bg-background border border-card-border" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input name="short_code" placeholder="Code" className="h-10 px-3 rounded bg-background border border-card-border" />
            <input name="city" placeholder="City" className="h-10 px-3 rounded bg-background border border-card-border" />
            <input name="coach_name" placeholder="Coach name" className="h-10 px-3 rounded bg-background border border-card-border" />
          </div>
          <button className="px-4 py-2 rounded border border-primary/50">Save Team</button>
        </form>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Current Sports</h2>
        {sports.length === 0 ? (
          <div className="rounded-xl border border-card-border p-4 text-foreground/70">No sports found.</div>
        ) : (
          sports.map((sport) => (
            <div key={sport.id} className="rounded-xl border border-card-border p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium">{sport.name}</p>
                <p className="text-sm text-foreground/60">
                  {sport.sport_type} • {sport.is_team_based ? "team based" : "solo"}
                </p>
              </div>
              <form action={deleteSportAction}>
                <input type="hidden" name="id" value={sport.id} />
                <button className="px-3 py-1 rounded border border-red-500/50 text-red-300 text-sm">Delete</button>
              </form>
            </div>
          ))
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Current Teams</h2>
        {teams.length === 0 ? (
          <div className="rounded-xl border border-card-border p-4 text-foreground/70">No teams found.</div>
        ) : (
          teams.map((team) => {
            const sport = Array.isArray(team.sports) ? team.sports[0] : team.sports;
            return (
              <div key={team.id} className="rounded-xl border border-card-border p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{team.name}</p>
                  <p className="text-sm text-foreground/60">
                    {sport?.name ?? "Unknown sport"} • {team.short_code ?? "N/A"} • {team.city ?? "N/A"}
                  </p>
                </div>
                <form action={deleteTeamAction}>
                  <input type="hidden" name="id" value={team.id} />
                  <button className="px-3 py-1 rounded border border-red-500/50 text-red-300 text-sm">Delete</button>
                </form>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
