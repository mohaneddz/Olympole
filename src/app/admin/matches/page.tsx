import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MatchesManagementBoard } from "@/components/admin/MatchesManagementBoard";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { FlagTriangleRight, Trophy } from "lucide-react";

export default async function AdminMatchesPage() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const [{ data: matches }, { data: events }, { data: sports }] = await Promise.all([
    supabase.from("matches").select("*").order("starts_at", { ascending: true }),
    supabase.from("events").select("id,title,type,sport_id").order("starts_at", { ascending: true }),
    supabase.from("sports").select("id,name,sport_type").order("name", { ascending: true }),
  ]);

  const totalMatches = matches?.length ?? 0;
  const liveMatches = (matches ?? []).filter((match) => match.status === "live").length;

  return (
    <div className="space-y-10">
      <AdminPageHeader
        icon={<Trophy className="h-3.5 w-3.5" />}
        title="Match Management"
        description="Manage match scores, statuses, and prediction scoring."
        stats={[
          { label: "Matches", value: totalMatches },
          { label: "Live Matches", value: liveMatches, tone: "success" },
        ]}
      />

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold">Matches</h2>
          <Link href="/admin/events/create-match" className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/40 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-100 transition hover:bg-cyan-400/20">
            <FlagTriangleRight className="h-4 w-4" />
            Create New Match
          </Link>
        </div>
        <MatchesManagementBoard matches={matches ?? []} events={events ?? []} sports={sports ?? []} />
      </section>
    </div>
  );
}
