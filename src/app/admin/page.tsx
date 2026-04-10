import { Button } from "@/components/ui/Button";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LayoutDashboard, Users, UserPlus, Palette, Calendar, Clock, CalendarDays, Activity, Video, Trophy, Swords, Medal, Shield } from "lucide-react";

export default async function AdminOverview() {
  const supabase = await createSupabaseServerClient();
  const now = new Date();
  const nowIso = now.toISOString();
  const last7DaysIso = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const todayIso = startOfToday.toISOString();

  const [
    { count: totalUsers },
    { count: totalAdmins },
    { count: registrations },
    { count: collectiveRegistrations },
    { count: individualRegistrations },
    { count: cultureRegistrations },
    { count: pendingRegistrations },
    { count: approvedRegistrations },
    { count: events },
    { count: predictions },
    { count: streams },
    { count: matches },
    { count: sports },
    { count: teams },
    { count: upcomingScheduleEvents },
    { count: todayScheduleEvents },
    { count: weekRegistrations },
    { data: logs },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "admin"),
    supabase.from("v_activity_registrations_all").select("id", { count: "exact", head: true }),
    supabase.from("v_activity_registrations_all").select("id", { count: "exact", head: true }).eq("category_type", "collective_sport"),
    supabase.from("v_activity_registrations_all").select("id", { count: "exact", head: true }).eq("category_type", "individual_sport"),
    supabase.from("v_activity_registrations_all").select("id", { count: "exact", head: true }).eq("category_type", "culture"),
    supabase.from("v_activity_registrations_all").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("v_activity_registrations_all").select("id", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("events").select("*", { count: "exact", head: true }),
    supabase.from("predictions").select("*", { count: "exact", head: true }),
    supabase.from("live_streams").select("*", { count: "exact", head: true }),
    supabase.from("matches").select("*", { count: "exact", head: true }),
    supabase.from("sports").select("*", { count: "exact", head: true }),
    supabase.from("teams").select("*", { count: "exact", head: true }),
    supabase.from("events").select("id", { count: "exact", head: true }).eq("show_in_schedule", true).gte("starts_at", nowIso),
    supabase.from("events").select("id", { count: "exact", head: true }).eq("show_in_schedule", true).gte("starts_at", todayIso),
    supabase.from("v_activity_registrations_all").select("id", { count: "exact", head: true }).gte("created_at", last7DaysIso),
    supabase.from("admin_activity_logs").select("action,created_at").order("created_at", { ascending: false }).limit(5),
  ]);

  const metricCards = [
    { label: "Users", value: totalUsers ?? 0, tone: "text-cyan-100" },
    { label: "Admins", value: totalAdmins ?? 0, tone: "text-cyan-100" },
    { label: "Registrations", value: registrations ?? 0, tone: "text-cyan-100" },
    { label: "Pending", value: pendingRegistrations ?? 0, tone: "text-amber-200" },
    { label: "Approved", value: approvedRegistrations ?? 0, tone: "text-emerald-200" },
  ];

  const overviewCards = [
    { label: "Collective Registrations", value: collectiveRegistrations ?? 0, icon: Users },
    { label: "Individual Registrations", value: individualRegistrations ?? 0, icon: UserPlus },
    { label: "Culture Registrations", value: cultureRegistrations ?? 0, icon: Palette },
    { label: "Upcoming In Schedule", value: upcomingScheduleEvents ?? 0, icon: CalendarDays },
    { label: "Today In Schedule", value: todayScheduleEvents ?? 0, icon: Clock },
    { label: "Registrations (7 days)", value: weekRegistrations ?? 0, icon: Activity },
    { label: "Events", value: events ?? 0, icon: Calendar },
    { label: "Live Streams", value: streams ?? 0, icon: Video },
    { label: "Predictions", value: predictions ?? 0, icon: Trophy },
    { label: "Matches", value: matches ?? 0, icon: Swords },
    { label: "Sports", value: sports ?? 0, icon: Medal },
    { label: "Teams", value: teams ?? 0, icon: Shield },
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
        {overviewCards.map((card, idx) => (
          <div key={idx} className="p-6 rounded-xl bg-card-bg border border-card-border flex items-start gap-4">
            <div className="p-3 bg-foreground/5 rounded-lg text-foreground/80">
              <card.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-foreground/60">{card.label}</p>
              <h3 className="text-2xl font-bold mt-1">{card.value}</h3>
            </div>
          </div>
        ))}
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

