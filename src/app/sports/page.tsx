"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { SPORTS } from "@/data/sports";
import { SHARED_DECORATIVE_ELEMENTS } from "@/data/decoration";
import SportCard from "@/components/sports/SportCard";

export default function SportsPage() {
  const [activeCategory, setActiveCategory] = useState<"collective" | "individual">("collective");
  const visibleSports = useMemo(
    () => SPORTS.filter((sport) => sport.category === activeCategory),
    [activeCategory]
  );

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <section className="relative flex min-h-[60vh] flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/backgrounds/hero.avif"
            alt=""
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(5,5,15,0.4)_80%,rgba(5,5,15,0.5)_100%)] z-0" />
          <div className="absolute inset-0 bg-background/10 backdrop-blur-[1px]" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "40px 40px" }}
          />
        </div>

        <div className="container relative z-10 mx-auto flex flex-col items-center justify-center gap-4 px-4 text-center">
          <Image
            src="/images/brand/fire.webp"
            alt=""
            width={292}
            height={362}
            aria-hidden
            className="mb-2 h-auto w-32 md:w-40 animate-fade-in-up"
          />
          <Image
            src="/images/brand/circles.webp"
            alt=""
            width={243}
            height={134}
            aria-hidden
            className="mb-6 h-auto w-16 md:w-20 animate-fade-in-up"
          />
          <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
              AVAILABLE SPORTS
            </span>
          </h1>
        </div>
      </section>

      <section className="relative z-10 w-full bg-background pt-16 mt-4 pb-20">
        {SHARED_DECORATIVE_ELEMENTS.map((el, i: number) => (
          <Image
            key={i}
            src={el.src}
            alt=""
            width={120}
            height={120}
            aria-hidden
            className={`pointer-events-none ${el.className}`}
          />
        ))}

        <div className="z-10 mx-auto w-full max-w-7xl px-4 flex flex-col gap-20">
          <div className="mx-auto w-full max-w-4xl rounded-2xl border border-cyan-300/65 bg-[#202f68] p-1.5 grid grid-cols-2 my-4">
          <button
            type="button"
            onClick={() => setActiveCategory("collective")}
            className={`rounded-xl py-3 text-lg font-bold transition ${activeCategory === "collective" ? "bg-[#84d4e8] text-[#061a2d]" : "text-white"}`}
          >
            Collective
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory("individual")}
            className={`rounded-xl py-3 text-lg font-bold transition ${activeCategory === "individual" ? "bg-[#84d4e8] text-[#061a2d]" : "text-white"}`}
          >
            Individual
          </button>
        </div>

        <div className="flex flex-col gap-20">
          {visibleSports.map((sport, idx) => (
            <SportCard key={sport.name} sport={sport} index={idx} />
          ))}
        </div>
        </div>
      </section>
    </div>
  );
}
