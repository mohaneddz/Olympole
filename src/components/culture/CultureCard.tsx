"use client";

import Image from "next/image";
import Link from "next/link";
import { CultureEvent } from "@/data/culture";

export function CultureCard({ event, index }: { event: CultureEvent; index: number }) {
  const isEven = index % 2 === 0;

  return (
    <article
      className={`animate-fade-in-up group relative flex flex-col ${
        isEven ? "sm:flex-row" : "sm:flex-row-reverse"
      } items-center gap-10 sm:gap-32 lg:gap-48`}
      style={{ animationDelay: `${index * 120}ms` }}
    >
      {/* Text content */}
      <div className="flex-1 text-left">
        <div className="mb-6 inline-flex flex-col">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white">
            {event.name}
          </h2>
          {/* Accent Underline matching the design */}
          <div className="h-1.5 w-full bg-[#ffc040] mt-3 rounded-full shadow-[0_0_10px_#ffc040]" />
        </div>
        
        <p className="text-lg md:text-xl lg:text-2xl text-white/90 leading-relaxed mb-2 max-w-xl">
          {event.tagline}
        </p>
        <p className="text-base md:text-xl text-white/80 leading-relaxed mb-8 max-w-xl">
          {event.description}
        </p>
        <Link
          href={event.href}
          className="inline-flex items-center justify-center rounded-full border border-[#ffc040] bg-[#101423] px-14 py-3.5 text-base md:text-lg font-bold text-white transition-all duration-300 hover:bg-[#ffc040] hover:text-black active:scale-95"
        >
          Register Now !
        </Link>
      </div>

      {/* Image Container with Backdrop */}
      <div className="relative w-72 h-[22rem] md:w-80 md:h-[25rem] lg:w-96 lg:h-[30rem] flex-shrink-0 mt-8 md:mt-0">
        {/* Activity Holder Backdrop - Alternating based on image position */}
        <div
          className={`absolute -inset-1 opacity-100 transition-all duration-500 ${
            isEven ? "translate-x-6" : "-translate-x-6"
          } -translate-y-6`}
        >
          <Image
            src="/svgs/artifacts/activity-holder.svg"
            alt=""
            fill
            className="w-full h-full"
            aria-hidden
          />
        </div>

        {/* Main image container */}
        <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden bg-black/50 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-500 group-hover:scale-[1.03] group-hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)]">
          <Image
            src={event.image}
            alt={event.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {/* Event-specific gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t opacity-60 mix-blend-overlay ${event.gradient}`} />
          {/* Bottom dark gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#030b2b]/80 via-transparent to-transparent" />

        </div>
      </div>
    </article>
  );
}
