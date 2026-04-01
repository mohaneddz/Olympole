"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { SPORTS, SPORTS_DECORATIVE_ELEMENTS, SportCategory } from "@/data/sports";
import SportCard from "@/components/sports/SportCard";

/* ───────── component ───────── */
export default function SportsPage() {
  const [activeTab, setActiveTab] = useState<SportCategory>("collective");

  const filteredSports = SPORTS.filter((s) => s.category === activeTab);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      {/* ── Hero banner ── */}
      <section className="relative flex min-h-[60vh] flex-col items-center justify-center overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/backgrounds/hero.avif"
            alt=""
            fill
            priority
            className="object-cover"
          />
          {/* Subtle overlay to make text pop, but NO bottom fade */}
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm" />
        </div>

        <div className="container relative z-10 mx-auto flex flex-col items-center justify-center gap-4 px-4 text-center">
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
            <span
              className="text-white"
            >
              AVAILABLE SPORTS
            </span>
          </h1>
        </div>
      </section>

      <div id="category-toggle" className="relative z-10 w-full bg-background pt-16">
        {/* ── Category tabs ── */}
        <div className="relative z-20 flex justify-center mb-36">
          <div className="inline-flex rounded-full border-2 border-[#80d4ff] bg-[#1a2238] p-1 shadow-lg">
            <button
              onClick={() => setActiveTab("collective")}
              className={`px-8 md:px-12 py-2.5 md:py-3 text-sm md:text-base font-bold tracking-wide transition-colors duration-300 rounded-full ${activeTab === "collective"
                ? "bg-[#80d4ff] text-black"
                : "text-white hover:text-[#80d4ff]/80"
                }`}
            >
              Collective Sports
            </button>
            <button
              onClick={() => setActiveTab("individual")}
              className={`px-8 md:px-12 py-2.5 md:py-3 text-sm md:text-base font-bold tracking-wide transition-colors duration-300 rounded-full ${activeTab === "individual"
                ? "bg-[#80d4ff] text-black"
                : "text-white hover:text-[#80d4ff]/80"
                }`}
            >
              Individual Sports
            </button>
          </div>
        </div>

        {/* ── Cards grid ── */}
        <section className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-20 flex flex-col gap-20">
          {/* Decorative floating elements */}
          {SPORTS_DECORATIVE_ELEMENTS.map((el, i) => (
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

          <div className="flex flex-col gap-20">
            {filteredSports.map((sport, idx) => (
              <SportCard key={sport.name} sport={sport} index={idx} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

