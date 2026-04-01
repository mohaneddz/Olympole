"use client";

import Image from "next/image";
import Link from "next/link";
import { SportItem } from "@/data/sports";

export default function SportCard({ sport, index }: { sport: SportItem; index: number }) {
  const isEven = index % 2 === 0;

  return (
    <article
      className={`animate-fade-in-up group relative flex flex-col ${
        isEven ? "md:flex-row" : "md:flex-row-reverse"
      } items-center justify-between gap-10 md:gap-20`}
      style={{ animationDelay: `${index * 120}ms` }}
    >
      {/* Text content */}
      <div className={`flex-1 flex flex-col ${isEven ? "items-start md:text-left" : "items-end md:text-right"} text-center`}>
        <div className="mb-6 inline-flex flex-col">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white">
            {sport.name}
          </h2>
          {/* Cyan Underline matching the design */}
          <div className="h-1.5 w-full bg-[#80d4ff] mt-3 rounded-full shadow-[0_0_10px_#80d4ff]" />
        </div>
        
        <p className="text-lg md:text-xl lg:text-2xl text-white/90 leading-relaxed mb-2 max-w-xl">
          {sport.tagline}
        </p>
        <p className="text-base md:text-xl text-white/80 leading-relaxed mb-8 max-w-xl">
          {sport.description}
        </p>
        <Link
          href="/register"
          className="inline-flex items-center justify-center rounded-full border border-[#80d4ff] bg-[#101423] px-8 py-3.5 text-base md:text-lg font-bold text-white transition-all duration-300 hover:bg-[#80d4ff] hover:text-black active:scale-95"
        >
          Register Now !
        </Link>
      </div>

      {/* Image */}
      <div className="relative w-72 h-[22rem] md:w-80 md:h-[25rem] lg:w-96 lg:h-[30rem] flex-shrink-0 mt-8 md:mt-0">

        {/* Main image container */}
        <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden bg-black/50 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-500 group-hover:scale-[1.03] group-hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)]">
          <Image
            src={sport.image}
            alt={sport.name}
            fill
            className="object-cover"
          />
          {/* Sport-specific gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t opacity-60 mix-blend-overlay ${sport.gradient}`} />
          {/* Subtle bottom dark gradient for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050B14]/80 via-transparent to-transparent" />
          
          {/* Emoji overlay removed or kept? The requested image doesn't show emojis. I'll remove it to match the clean design in the screenshot, or keep it subtle if desired. Let's omit it for a cleaner match to the image. */}
        </div>
      </div>
    </article>
  );
}
