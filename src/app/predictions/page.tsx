import type { Metadata } from "next";
import Image from "next/image";
import { getAppSettings, getFantasyRegisteredPlayers } from "@/lib/queries";
import { PredictionsTabbedContent } from "@/components/predictions/PredictionsTabbedContent";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Fantasy Predictions",
  description: "Join Olympole fantasy predictions and track player standings.",
  alternates: {
    canonical: "/predictions",
  },
};

export default async function PredictionsPage() {
  const settings = await getAppSettings();
  const fantasyEnabled = settings.fantasy_launch;
  const availablePlayers = fantasyEnabled ? await getFantasyRegisteredPlayers() : [];
  const decorativeElements = fantasyEnabled
    ? [
        { src: "/svgs/artifacts/big-circles.svg", className: "absolute -left-6 top-[10%] w-24 md:w-44 opacity-75" },
        { src: "/svgs/artifacts/blue-zigzag.svg", className: "absolute -left-6 top-[34%] w-20 md:w-36 opacity-70" },
        { src: "/svgs/artifacts/diamonds.svg", className: "absolute right-[4%] top-[8%] w-20 md:w-32 opacity-70" },
        { src: "/svgs/artifacts/small-circles.svg", className: "absolute left-1/2 top-[24%] w-16 -translate-x-1/2 md:w-24 opacity-60" },
        { src: "/svgs/artifacts/big-circles.svg", className: "absolute right-[4%] top-[52%] w-24 md:w-40 opacity-75" },
        { src: "/svgs/artifacts/blue-zigzag.svg", className: "absolute right-[2%] bottom-[10%] w-24 md:w-40 opacity-70" },
        { src: "/svgs/artifacts/big-circles.svg", className: "absolute left-[4%] bottom-[8%] w-24 md:w-40 opacity-75" },
      ]
    : [
        { src: "/svgs/artifacts/big-circles.svg", className: "absolute -left-6 top-[14%] w-24 md:w-44 opacity-75" },
        { src: "/svgs/artifacts/diamonds.svg", className: "absolute right-[4%] top-[12%] w-20 md:w-32 opacity-70" },
        { src: "/svgs/artifacts/small-circles.svg", className: "absolute left-1/2 top-[30%] w-16 -translate-x-1/2 md:w-24 opacity-60" },
        { src: "/svgs/artifacts/big-circles.svg", className: "absolute right-[4%] bottom-[12%] w-24 md:w-40 opacity-75" },
        { src: "/svgs/artifacts/blue-zigzag.svg", className: "absolute right-[2%] bottom-[4%] w-24 md:w-40 opacity-70" },
        { src: "/svgs/artifacts/big-circles.svg", className: "absolute left-[4%] bottom-[8%] w-24 md:w-40 opacity-75" },
      ];

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <section className={`relative flex flex-col items-center justify-center overflow-hidden ${fantasyEnabled ? "min-h-[60vh]" : "min-h-[42vh] md:min-h-[50vh]"}`}>
        <div className="absolute inset-0 z-0">
          <Image src="/images/backgrounds/hero.avif" alt="" fill className="object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(5,5,15,0.4)_80%,rgba(5,5,15,0.5)_100%)] z-0" />
          <div className="absolute inset-0 bg-background/10 backdrop-blur-[1px]" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "40px 40px" }}
          />
        </div>

        <div className="mx-auto w-full max-w-6xl px-4 relative z-10 flex flex-col items-center justify-center gap-4 text-center">
          <Image src="/images/brand/fire.webp" alt="" width={292} height={362} aria-hidden className="mb-2 h-auto w-32 md:w-40 animate-fade-in-up" />
          <Image src="/images/brand/circles.webp" alt="" width={243} height={134} aria-hidden className="mb-6 h-auto w-16 md:w-20 animate-fade-in-up" />
          <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
              FANTASY
            </span>
          </h1>
        </div>
      </section>

      <main className={`relative z-10 w-full bg-background ${fantasyEnabled ? "pb-14 pt-8 md:pb-20 md:pt-16" : "flex min-h-[40vh] flex-1 items-center py-6 md:min-h-[48vh] md:py-8"}`}>
        <div className={`relative z-10 mx-auto flex w-full max-w-6xl flex-col px-4 ${fantasyEnabled ? "gap-16" : "justify-center"}`}>
          {decorativeElements.map((el, i: number) => (
            <Image
              key={i}
              src={el.src}
              alt=""
              width={120}
              height={120}
              aria-hidden
              className={`pointer-events-none z-0 ${el.className} max-md:opacity-5`}
            />
          ))}

          {fantasyEnabled ? (
            <PredictionsTabbedContent availablePlayers={availablePlayers} />
          ) : (
            <section id="fantasy" className="mx-auto w-full max-w-4xl rounded-2xl border border-cyan-300/65 bg-[#202f68] p-5 text-center md:p-7">
              <p className="font-heading text-3xl font-black tracking-tight text-white md:text-4xl">Fantasy Coming Soon</p>
              <p className="mt-3 text-sm text-foreground/70 md:text-base">
                Fantasy will open once all football players have registered.
              </p>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
