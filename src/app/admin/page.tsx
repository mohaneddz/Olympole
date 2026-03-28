import { Button } from "@/components/ui/Button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminOverview() {
  const supabase = await createSupabaseServerClient();
  const [
    { count: registrations },
    { count: events },
    { count: predictions },
    { count: streams },
    { count: matches },
    { count: sports },
    { count: teams },
    { data: logs },
  ] = await Promise.all([
    supabase.from("registrations").select("*", { count: "exact", head: true }),
    supabase.from("events").select("*", { count: "exact", head: true }),
    supabase.from("predictions").select("*", { count: "exact", head: true }),
    supabase.from("live_streams").select("*", { count: "exact", head: true }),
    supabase.from("matches").select("*", { count: "exact", head: true }),
    supabase.from("sports").select("*", { count: "exact", head: true }),
    supabase.from("teams").select("*", { count: "exact", head: true }),
    supabase.from("admin_activity_logs").select("action,created_at").order("created_at", { ascending: false }).limit(5),
  ]);

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-2">Platform Overview</h1>
        <p className="text-foreground/60">Real-time metrics and system alerts for Olympole 2026.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-xl bg-card-bg border border-card-border"><p className="text-sm text-foreground/60">Registrations</p><h3 className="text-3xl font-bold mt-2">{registrations ?? 0}</h3></div>
        <div className="p-6 rounded-xl bg-card-bg border border-card-border"><p className="text-sm text-foreground/60">Events</p><h3 className="text-3xl font-bold mt-2">{events ?? 0}</h3></div>
        <div className="p-6 rounded-xl bg-card-bg border border-card-border"><p className="text-sm text-foreground/60">Matches</p><h3 className="text-3xl font-bold mt-2">{matches ?? 0}</h3></div>
        <div className="p-6 rounded-xl bg-card-bg border border-card-border"><p className="text-sm text-foreground/60">Predictions</p><h3 className="text-3xl font-bold mt-2">{predictions ?? 0}</h3></div>
        <div className="p-6 rounded-xl bg-card-bg border border-card-border"><p className="text-sm text-foreground/60">Sports</p><h3 className="text-3xl font-bold mt-2">{sports ?? 0}</h3></div>
        <div className="p-6 rounded-xl bg-card-bg border border-card-border"><p className="text-sm text-foreground/60">Teams</p><h3 className="text-3xl font-bold mt-2">{teams ?? 0}</h3></div>
        <div className="p-6 rounded-xl bg-card-bg border border-card-border"><p className="text-sm text-foreground/60">Live Streams</p><h3 className="text-3xl font-bold mt-2">{streams ?? 0}</h3></div>
      </div>

      <div className="p-6 rounded-xl bg-card-bg border border-card-border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Recent Admin Activity</h3>
          <Button variant="outline" size="sm">Live</Button>
        </div>
        <ul className="space-y-3 text-sm">
          {(logs ?? []).map((item, index) => (
            <li key={`${item.created_at}-${index}`} className="flex justify-between border-b border-card-border/60 pb-2">
              <span>{item.action}</span>
              <span className="text-foreground/60">{new Date(item.created_at).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
