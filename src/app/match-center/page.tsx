import Link from "next/link";
import { CalendarDays, Check, LocateFixed } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getLeaderboard, getPublicMatches, getUserPredictions } from "@/lib/queries";
import { PredictionTeamCanvas } from "@/components/match-center/PredictionTeamCanvas";

type MatchRow = {
  id: string;
  sport: string | null;
  round: string | null;
  status: "scheduled" | "live" | "completed";
  team_a: string;
  team_b: string;
  score_a: number;
  score_b: number;
  venue: string | null;
  starts_at: string;
};

type ExistingPrediction = {
  match_id: string;
  predicted_winner: string;
  outcome?: "won" | "lost" | "pending" | null;
};

type LeaderboardEntry = {
  name: string;
  points: number;
};

function hash(input: string) {
  let value = 0;
  for (let i = 0; i < input.length; i += 1) {
    value = (value * 31 + input.charCodeAt(i)) >>> 0;
  }
  return value;
}

function voteSplit(match: MatchRow) {
  const totalVotes = 35 + (hash(match.id) % 80);

  if (match.status === "completed") {
    const totalScore = Math.max(1, match.score_a + match.score_b);
    const teamAPct = Math.round((match.score_a / totalScore) * 100);
    return {
      totalVotes,
      teamAPct: Math.max(4, Math.min(96, teamAPct)),
    };
  }

  const teamAPct = 42 + (hash(`${match.id}-a`) % 17);
  return {
    totalVotes,
    teamAPct,
  };
}

function sectionHeading(title: string, accent: string, subtitle: string) {
  return (
    <div className="text-center">
      <h2 className="text-4xl md:text-5xl font-extrabold text-white">
        {title} <span className="text-primary">{accent}</span>
      </h2>
      <p className="mt-4 text-base md:text-lg text-white/80">{subtitle}</p>
    </div>
  );
}

function MatchCard({
  match,
  userPrediction,
}: {
  match: MatchRow;
  userPrediction?: ExistingPrediction;
}) {
  const split = voteSplit(match);
  const teamBPct = 100 - split.teamAPct;
  const winner = match.score_a === match.score_b
    ? null
    : match.score_a > match.score_b
      ? match.team_a
      : match.team_b;
  const predictedCorrect = winner && userPrediction?.predicted_winner === winner;

  return (
    <article
      className={`rounded-xl border p-4 md:p-5 bg-[#1b2b63]/85 ${
        predictedCorrect ? "border-emerald-400/70 shadow-[0_0_0_1px_rgba(16,185,129,0.45)]" : "border-cyan-300/18"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-cyan-100/85">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{new Date(match.starts_at).toLocaleDateString()}</span>
          <span className="inline-flex items-center gap-1"><LocateFixed className="h-3.5 w-3.5" />{match.venue ?? "Venue TBA"}</span>
        </div>
        <span className="font-semibold">{split.totalVotes} Votes</span>
      </div>

      <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className={`h-11 rounded-md border flex items-center justify-center px-3 text-sm md:text-base font-semibold ${
          winner === match.team_a || userPrediction?.predicted_winner === match.team_a
            ? "border-cyan-300/70 text-cyan-100 bg-[#1d9ec2]/30"
            : "border-cyan-200/25 text-white bg-[#060d22]"
        }`}>
          {predictedCorrect && userPrediction?.predicted_winner === match.team_a ? <Check className="mr-1 h-4 w-4" /> : null}
          {match.team_a}
        </div>

        <span className="text-cyan-100 text-lg md:text-xl font-black">VS</span>

        <div className={`h-11 rounded-md border flex items-center justify-center px-3 text-sm md:text-base font-semibold ${
          winner === match.team_b || userPrediction?.predicted_winner === match.team_b
            ? "border-cyan-300/70 text-cyan-100 bg-[#1d9ec2]/30"
            : "border-cyan-200/25 text-white bg-[#060d22]"
        }`}>
          {predictedCorrect && userPrediction?.predicted_winner === match.team_b ? <Check className="mr-1 h-4 w-4" /> : null}
          {match.team_b}
        </div>
      </div>

      {match.status === "completed" ? (
        <p className="mt-2 text-center text-xs md:text-sm text-white/80">
          Final score: {match.score_a} - {match.score_b}
        </p>
      ) : null}

      <div className="mt-3 h-1.5 rounded bg-[#0f1d4c] overflow-hidden">
        <div className="h-full bg-cyan-300" style={{ width: `${split.teamAPct}%` }} />
      </div>
      <div className="mt-1 flex items-center justify-between text-xs font-semibold text-cyan-200">
        <span>{split.teamAPct}%</span>
        <span>{teamBPct}%</span>
      </div>

      {predictedCorrect ? (
        <p className="mt-3 text-center text-sm text-emerald-300 font-medium">
          Congratulations! You predicted right.
        </p>
      ) : null}
    </article>
  );
}

export default async function MatchCenter() {
  const [matches, leaderboard, user] = await Promise.all([
    getPublicMatches(),
    getLeaderboard(),
    getCurrentUser(),
  ]);

  const userPredictions = user ? await getUserPredictions(user.id) : [];
  const predictionsMap = new Map((userPredictions as ExistingPrediction[]).map((item) => [item.match_id, item]));

  const matchRows = (matches as MatchRow[]);
  const upcoming = matchRows.filter((match) => match.status !== "completed");
  const results = matchRows.filter((match) => match.status === "completed");

  return (
    <div className="relative flex-1 pb-16">
      <section className="relative min-h-[62vh] overflow-hidden border-b border-cyan-300/20">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/images/backgrounds/hero.avif')] bg-cover bg-center opacity-70" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,19,57,0.25),rgba(2,10,34,0.96))]" />
        </div>

        <div className="container relative z-10 mx-auto px-4 pt-16 pb-12 text-center max-w-7xl">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white">MATCH PREDICTIONS</h1>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 md:gap-5">
            <a href="#upcoming" className="min-w-52 rounded-xl border border-cyan-200/70 bg-[#0d1b4a]/80 px-6 py-3 text-white font-semibold hover:bg-cyan-300 hover:text-[#071432] transition">Make Predictions</a>
            <Link href="#results" className="min-w-52 rounded-xl border border-cyan-200/70 bg-[#0d1b4a]/80 px-6 py-3 text-white font-semibold hover:bg-cyan-300 hover:text-[#071432] transition">See Results</Link>
          </div>
        </div>
      </section>

      <main className="container mx-auto max-w-7xl px-4 py-14 space-y-16">
        <section id="upcoming" className="space-y-7">
          {sectionHeading("Upcoming", "Matches", "Make your predictions about the winning team and win the prize")}
          <div className="space-y-4">
            {upcoming.length === 0 ? (
              <div className="glass-card rounded-xl border border-card-border p-7 text-center text-white/70">No upcoming matches yet.</div>
            ) : (
              upcoming.map((match) => <MatchCard key={match.id} match={match} userPrediction={predictionsMap.get(match.id)} />)
            )}
          </div>
        </section>

        <PredictionTeamCanvas />

        <section id="results" className="space-y-7">
          {sectionHeading("Match", "Results", "Review finished matches and how your predictions performed")}
          <div className="space-y-4">
            {results.length === 0 ? (
              <div className="glass-card rounded-xl border border-card-border p-7 text-center text-white/70">No final results yet.</div>
            ) : (
              results.map((match) => <MatchCard key={match.id} match={match} userPrediction={predictionsMap.get(match.id)} />)
            )}
          </div>
        </section>

        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white">
              Users with highest <span className="text-primary">Scores</span>
            </h2>
          </div>
          <div className="space-y-3">
            {(leaderboard as LeaderboardEntry[]).slice(0, 7).map((entry, index) => (
              <div key={`${entry.name}-${index}`} className="rounded-xl border border-cyan-200/20 bg-[#1a2b66]/80 px-4 py-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-white">
                  <div className={`h-10 w-10 rounded-md grid place-items-center text-lg font-black ${index < 3 ? "bg-[#eff06a] text-[#192866]" : "bg-[#b8e6f6] text-[#192866]"}`}>
                    {index + 1}
                  </div>
                  <span className="font-semibold">{entry.name}</span>
                </div>
                <span className="text-cyan-200 font-bold">{entry.points} pts</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
