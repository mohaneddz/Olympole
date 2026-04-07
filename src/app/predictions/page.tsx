import Image from "next/image";
import { CalendarDays, Check, LocateFixed } from "lucide-react";
import { SHARED_DECORATIVE_ELEMENTS } from "@/data/decoration";
import { getCurrentUser } from "@/lib/auth";
import { getPublicMatches, getUserPredictions } from "@/lib/queries";
import { PredictionTeamCanvas } from "@/components/match-center/PredictionTeamCanvas";

type MatchRow = {
  id: string;
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
    return { totalVotes, teamAPct: Math.max(4, Math.min(96, teamAPct)) };
  }
  return { totalVotes, teamAPct: 42 + (hash(`${match.id}-a`) % 17) };
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

function MatchCard({ match, userPrediction }: { match: MatchRow; userPrediction?: ExistingPrediction }) {
  const split = voteSplit(match);
  const teamBPct = 100 - split.teamAPct;
  const winner = match.score_a === match.score_b ? null : match.score_a > match.score_b ? match.team_a : match.team_b;
  const predictedCorrect = winner && userPrediction?.predicted_winner === winner;

  return (
    <article className={`rounded-xl border p-4 md:p-5 bg-[#1b2b63]/85 ${predictedCorrect ? "border-emerald-400/70 shadow-[0_0_0_1px_rgba(16,185,129,0.45)]" : "border-cyan-300/18"}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-cyan-100/85">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{new Date(match.starts_at).toLocaleDateString()}</span>
          <span className="inline-flex items-center gap-1"><LocateFixed className="h-3.5 w-3.5" />{match.venue ?? "Venue TBA"}</span>
        </div>
        <span className="font-semibold">{split.totalVotes} Votes</span>
      </div>

      <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className={`h-11 rounded-md border flex items-center justify-center px-3 text-sm md:text-base font-semibold ${winner === match.team_a || userPrediction?.predicted_winner === match.team_a ? "border-cyan-300/70 text-cyan-100 bg-[#1d9ec2]/30" : "border-cyan-200/25 text-white bg-[#060d22]"}`}>
          {predictedCorrect && userPrediction?.predicted_winner === match.team_a ? <Check className="mr-1 h-4 w-4" /> : null}
          {match.team_a}
        </div>
        <span className="text-cyan-100 text-lg md:text-xl font-black">VS</span>
        <div className={`h-11 rounded-md border flex items-center justify-center px-3 text-sm md:text-base font-semibold ${winner === match.team_b || userPrediction?.predicted_winner === match.team_b ? "border-cyan-300/70 text-cyan-100 bg-[#1d9ec2]/30" : "border-cyan-200/25 text-white bg-[#060d22]"}`}>
          {predictedCorrect && userPrediction?.predicted_winner === match.team_b ? <Check className="mr-1 h-4 w-4" /> : null}
          {match.team_b}
        </div>
      </div>

      {match.status === "completed" ? <p className="mt-2 text-center text-xs md:text-sm text-white/80">Final score: {match.score_a} - {match.score_b}</p> : null}

      <div className="mt-3 h-1.5 rounded bg-[#0f1d4c] overflow-hidden">
        <div className="h-full bg-cyan-300" style={{ width: `${split.teamAPct}%` }} />
      </div>
      <div className="mt-1 flex items-center justify-between text-xs font-semibold text-cyan-200">
        <span>{split.teamAPct}%</span>
        <span>{teamBPct}%</span>
      </div>
    </article>
  );
}

export default async function PredictionsPage() {
  const [matches, user] = await Promise.all([getPublicMatches(), getCurrentUser()]);
  const userPredictions = user ? await getUserPredictions(user.id) : [];
  const predictionsMap = new Map((userPredictions as ExistingPrediction[]).map((item) => [item.match_id, item]));

  const matchRows = matches as MatchRow[];
  const upcoming = matchRows.filter((match) => match.status !== "completed");
  const results = matchRows.filter((match) => match.status === "completed");

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <section className="relative flex min-h-[60vh] flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/backgrounds/hero.avif"
            alt=""
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(5,5,15,0.4)_80%,rgba(5,5,15,0.5)_100%)] z-0" />
          <div className="absolute inset-0 bg-background/10 backdrop-blur-[1px]" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "40px 40px" }}
          />
        </div>

        <div className="mx-auto w-full max-w-6xl px-4 relative z-10 flex flex-col items-center justify-center gap-4 text-center">
          <Image
            src="/images/brand/fire.png"
            alt=""
            width={292}
            height={362}
            aria-hidden
            className="mb-2 h-auto w-32 md:w-40 animate-fade-in-up"
          />
          <Image
            src="/images/brand/circles.png"
            alt=""
            width={243}
            height={134}
            aria-hidden
            className="mb-6 h-auto w-16 md:w-20 animate-fade-in-up"
          />
          <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
              PREDICTIONS
            </span>
          </h1>
        </div>
      </section>

      <main className="relative z-10 w-full bg-background pt-16 pb-20">
        <div className="mx-auto w-full max-w-6xl px-4 flex flex-col gap-16">
          {SHARED_DECORATIVE_ELEMENTS.map((el, i: number) => (
            <Image key={i} src={el.src} alt="" width={120} height={120} aria-hidden className={`pointer-events-none ${el.className}`} />
          ))}
          <section className="space-y-7">
            {sectionHeading("Upcoming", "Matches", "Make your predictions about the winning team and win the prize")}
            <div className="space-y-4">
              {upcoming.length === 0 ? <div className="glass-card rounded-xl border border-card-border p-7 text-center text-white/70">No upcoming matches yet.</div> : upcoming.map((match) => <MatchCard key={match.id} match={match} userPrediction={predictionsMap.get(match.id)} />)}
            </div>
          </section>
          <section className="space-y-7">
            {sectionHeading("Olympole", "Fantasy", "Build your lineup in pitch and list views")}
            <PredictionTeamCanvas />
          </section>
          <section className="space-y-7">
            {sectionHeading("Match", "Results", "Review finished matches and how your predictions performed")}
            <div className="space-y-4">
              {results.length === 0 ? <div className="glass-card rounded-xl border border-card-border p-7 text-center text-white/70">No final results yet.</div> : results.map((match) => <MatchCard key={match.id} match={match} userPrediction={predictionsMap.get(match.id)} />)}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
