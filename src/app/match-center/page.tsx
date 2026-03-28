import { getPublicMatches } from "@/lib/queries";

export default async function MatchCenter() {
  const matches = await getPublicMatches();

  return (
    <div className="container mx-auto px-4 py-16 max-w-7xl flex flex-col gap-8 flex-1">
      <div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2 text-primary glow-text-cyan">Match Center</h1>
        <p className="text-lg text-foreground/70">Near-live scoreboard sourced from persisted match data.</p>
      </div>

      {matches.length === 0 ? (
        <div className="glass-card rounded-xl p-8 border border-card-border text-foreground/70">No matches yet.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {matches.map((match) => (
            <div key={match.id} className="glass-card rounded-xl border border-card-border p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-primary text-sm">{match.sport} - {match.round}</span>
                <span className="px-2 py-1 rounded text-xs uppercase border border-primary/30 text-primary">{match.status}</span>
              </div>
              <div className="flex items-center justify-between text-xl font-bold mb-2">
                <span>{match.team_a}</span>
                <span>{match.score_a}</span>
              </div>
              <div className="flex items-center justify-between text-xl font-bold mb-2">
                <span>{match.team_b}</span>
                <span>{match.score_b}</span>
              </div>
              <div className="mt-4 space-y-1 text-sm text-foreground/60">
                <p>{new Date(match.starts_at).toLocaleString()} - {match.venue}</p>
                {match.live_minute !== null && match.live_minute !== undefined ? (
                  <p>Live minute: {match.live_minute}&apos;</p>
                ) : null}
                {match.mvp_player ? <p>MVP: {match.mvp_player}</p> : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
