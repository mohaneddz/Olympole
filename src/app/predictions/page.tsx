import Image from "next/image";
import { SHARED_DECORATIVE_ELEMENTS } from "@/data/decoration";
import { getCurrentUser } from "@/lib/auth";
import { getPublicMatches, getUserPredictions } from "@/lib/queries";
import { PredictionsTabbedContent } from "@/components/predictions/PredictionsTabbedContent";

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

export default async function PredictionsPage() {
  const [matches, user] = await Promise.all([getPublicMatches(), getCurrentUser()]);
  const userPredictions = user ? await getUserPredictions(user.id) : [];

  const matchRows = matches as MatchRow[];
  const upcoming = matchRows.filter((match) => match.status !== "completed");
  const results = matchRows.filter((match) => match.status === "completed");

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <section className="relative flex min-h-[60vh] flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src="/images/backgrounds/hero.avif" alt="" fill priority className="object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(5,5,15,0.4)_80%,rgba(5,5,15,0.5)_100%)] z-0" />
          <div className="absolute inset-0 bg-background/10 backdrop-blur-[1px]" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "40px 40px" }}
          />
        </div>

        <div className="mx-auto w-full max-w-6xl px-4 relative z-10 flex flex-col items-center justify-center gap-4 text-center">
          <Image src="/images/brand/fire.png" alt="" width={292} height={362} aria-hidden className="mb-2 h-auto w-32 md:w-40 animate-fade-in-up" />
          <Image src="/images/brand/circles.png" alt="" width={243} height={134} aria-hidden className="mb-6 h-auto w-16 md:w-20 animate-fade-in-up" />
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

          <PredictionsTabbedContent
            upcoming={upcoming}
            results={results}
            userPredictions={userPredictions as ExistingPrediction[]}
          />
        </div>
      </main>
    </div>
  );
}
