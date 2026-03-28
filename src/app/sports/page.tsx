import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { getPublicEvents, getPublicMatches, getPublicSports } from "@/lib/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function SportsHub() {
  const supabase = await createSupabaseServerClient();
  const [sports, events, matches, teamsRes] = await Promise.all([
    getPublicSports(),
    getPublicEvents(),
    getPublicMatches(),
    supabase.from("teams").select("id, sport_id"),
  ]);
  const teams = teamsRes.data ?? [];

  const teamCountBySport = teams.reduce<Record<string, number>>((acc, team) => {
    acc[team.sport_id] = (acc[team.sport_id] ?? 0) + 1;
    return acc;
  }, {});

  const featuredMatches = matches.filter((match) => match.status !== "completed").slice(0, 4);

  return (
    <div className="container mx-auto px-4 py-16 max-w-7xl flex flex-col gap-12 flex-1">
      <div className="text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-br from-primary via-blue-400 to-secondary">
          Sports Hub
        </h1>
        <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
          Track all collective and individual competitions with real event data from the operations backend.
        </p>
      </div>

      {sports.length === 0 ? (
        <div className="rounded-xl border border-card-border p-6 text-foreground/70">
          No sports configured yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sports.map((sport) => {
            const relatedEvents = events.filter((event) => event.sport_id === sport.id);
            return (
              <article key={sport.id} className="glass-card rounded-xl border border-card-border p-6 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-2xl font-bold">{sport.name}</h2>
                  <span className="text-xs uppercase rounded-full border border-card-border px-2 py-1">
                    {sport.sport_type}
                  </span>
                </div>
                <p className="text-sm text-foreground/70">
                  {sport.description ?? "No description provided."}
                </p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg border border-card-border p-2">
                    <p className="text-xs text-foreground/60">Events</p>
                    <p className="text-lg font-semibold">{relatedEvents.length}</p>
                  </div>
                  <div className="rounded-lg border border-card-border p-2">
                    <p className="text-xs text-foreground/60">Teams</p>
                    <p className="text-lg font-semibold">{teamCountBySport[sport.id] ?? 0}</p>
                  </div>
                  <div className="rounded-lg border border-card-border p-2">
                    <p className="text-xs text-foreground/60">Mode</p>
                    <p className="text-sm font-semibold">{sport.is_team_based ? "Team" : "Solo"}</p>
                  </div>
                </div>
                <div className="pt-2">
                  <Button variant="outline" asChild>
                    <Link href="/schedule">View Schedule</Link>
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <section className="space-y-4">
        <h2 className="text-3xl font-bold">Upcoming Matches</h2>
        {featuredMatches.length === 0 ? (
          <div className="rounded-xl border border-card-border p-4 text-foreground/70">
            No upcoming matches.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredMatches.map((match) => (
              <div key={match.id} className="rounded-xl border border-card-border p-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">
                    {match.team_a} vs {match.team_b}
                  </p>
                  <p className="text-sm text-foreground/60">
                    {match.sport} • {new Date(match.starts_at).toLocaleString()}
                  </p>
                </div>
                <span className="text-xs uppercase rounded-full border border-card-border px-2 py-1">
                  {match.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
