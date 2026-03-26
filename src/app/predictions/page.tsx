import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getAppSettings, getLeaderboard, getPublicMatches } from "@/lib/queries";
import { PredictionForm } from "@/components/forms/PredictionForm";

export default async function PredictionsPage() {
  const [settings, matches, leaderboard, user] = await Promise.all([
    getAppSettings(),
    getPublicMatches(),
    getLeaderboard(),
    getCurrentUser(),
  ]);

  return (
    <div className="container mx-auto px-4 py-16 max-w-7xl flex flex-col gap-8 flex-1">
      <div className="text-center mb-8">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4 text-secondary">Prediction Hub</h1>
        <p className="text-lg text-foreground/70 max-w-2xl mx-auto">Winner-pick predictions with automated scoring (3 points for correct picks).</p>
      </div>

      {!settings.predictions_enabled ? (
        <div className="p-6 rounded-xl border border-yellow-500/40 bg-yellow-500/10 text-yellow-100">Predictions are currently disabled.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {matches.length === 0 ? (
              <div className="glass-card p-6 rounded-xl border border-card-border">No matches available for predictions.</div>
            ) : (
              matches.map((match) => (
                <div key={match.id} className="glass-card p-6 rounded-xl border border-card-border space-y-4">
                  <div className="flex justify-between text-sm text-foreground/60">
                    <span>{match.sport} - {match.round}</span>
                    <span>{match.status}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-center">{match.team_a} vs {match.team_b}</h3>
                  {user ? (
                    <PredictionForm matchId={match.id} teamA={match.team_a} teamB={match.team_b} />
                  ) : (
                    <p className="text-sm text-foreground/70 text-center">Please <Link href="/login" className="text-primary">login</Link> to submit predictions.</p>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="glass-card p-6 rounded-xl border border-card-border">
            <h3 className="text-xl font-bold mb-4">Leaderboard</h3>
            <div className="space-y-3">
              {leaderboard.length === 0 ? (
                <p className="text-sm text-foreground/70">No scored predictions yet.</p>
              ) : (
                leaderboard.map((entry, index) => (
                  <div key={`${entry.name}-${index}`} className="flex justify-between p-2 rounded bg-background border border-card-border">
                    <span>#{index + 1} {entry.name}</span>
                    <span className="text-primary">{entry.points}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
