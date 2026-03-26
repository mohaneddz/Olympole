import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function getCount(table: string) {
  const supabase = await createSupabaseServerClient();
  const { count } = await supabase.from(table as never).select("*", { count: "exact", head: true });
  return count ?? 0;
}

export default async function AdminSystemPage() {
  await requireAdmin();

  const [events, matches, registrations, predictions] = await Promise.all([
    getCount("events"),
    getCount("matches"),
    getCount("registrations"),
    getCount("predictions"),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">System Status</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[{ label: "Events", value: events }, { label: "Matches", value: matches }, { label: "Registrations", value: registrations }, { label: "Predictions", value: predictions }].map((item) => (
          <div key={item.label} className="p-6 rounded-xl bg-card-bg border border-card-border">
            <p className="text-sm text-foreground/60">{item.label}</p>
            <p className="text-3xl font-bold mt-2">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
