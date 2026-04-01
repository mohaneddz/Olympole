"use client";

import Image from "next/image";
import Link from "next/link";
import { CULTURE_EVENTS } from "@/data/culture";
import { SHARED_DECORATIVE_ELEMENTS } from "@/data/decoration";
import { CultureCard } from "@/components/culture/CultureCard";

/* ───────── page ───────── */
export default function CulturePage() {
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
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(5,5,15,0.4)_80%,rgba(5,5,15,0.5)_100%)] z-0" />
          <div className="absolute inset-0 bg-background/10 backdrop-blur-[1px]" />
          {/* Cyber lines pattern */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}
          />
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
              className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60"
            >
              CULTURAL EVENTS
            </span>
          </h1>
        </div>
      </section>

      {/* ── Cards section ── */}
      <section id="culture-activities" className="relative z-10 w-full bg-background pt-16 mt-44 pb-20">
        <div className="z-10 mx-auto w-full max-w-7xl px-4 flex flex-col gap-20">
          {/* Decorative floating elements */}
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

          <div className="flex flex-col gap-20">
            {CULTURE_EVENTS.map((event, idx) => (
              <CultureCard key={event.name} event={event} index={idx} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
