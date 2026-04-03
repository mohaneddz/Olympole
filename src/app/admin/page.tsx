import { Button } from "@/components/ui/Button";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LayoutDashboard } from "lucide-react";

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

  const metricCards = [
    { label: "Registrations", value: registrations ?? 0, tone: "text-cyan-100" },
    { label: "Events", value: events ?? 0, tone: "text-cyan-100" },
    { label: "Matches", value: matches ?? 0, tone: "text-emerald-200" },
    { label: "Live Streams", value: streams ?? 0, tone: "text-amber-200" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        icon={<LayoutDashboard className="h-3.5 w-3.5" />}
        title="Platform Overview"
        description="Real-time operational snapshot across registrations, events, matches, and live coverage."
        stats={metricCards.map((metric) => ({
          label: metric.label,
          value: metric.value,
          tone: metric.tone.includes("emerald") ? "success" : metric.tone.includes("amber") ? "warning" : "default",
        }))}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-6 rounded-xl bg-card-bg border border-card-border"><p className="text-sm text-foreground/60">Predictions</p><h3 className="text-3xl font-bold mt-2">{predictions ?? 0}</h3></div>
        <div className="p-6 rounded-xl bg-card-bg border border-card-border"><p className="text-sm text-foreground/60">Sports</p><h3 className="text-3xl font-bold mt-2">{sports ?? 0}</h3></div>
        <div className="p-6 rounded-xl bg-card-bg border border-card-border"><p className="text-sm text-foreground/60">Teams</p><h3 className="text-3xl font-bold mt-2">{teams ?? 0}</h3></div>
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
