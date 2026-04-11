import Image from "next/image";
import { EVENT_STATS } from "@/data/event";

export function AboutSection() {
  return (
    <section id="about" className="relative z-10 flex min-h-screen scroll-mt-20 items-center overflow-hidden bg-[#030b2b] py-14 md:py-20">
      <Image
        src="/svgs/artifacts/yellow-zigzag.svg"
        alt=""
        width={400}
        height={400}
        aria-hidden
        className="pointer-events-none absolute -right-[6%] top-[10%] h-auto w-50 opacity-25 md:w-90 md:opacity-100"
      />
      <Image
        src="/svgs/artifacts/small-circles.svg"
        alt=""
        width={400}
        height={400}
        aria-hidden
        className="pointer-events-none absolute left-[12%] top-[10%] h-auto w-20 opacity-20 md:w-70 md:opacity-100"
      />
      <Image
        src="/svgs/artifacts/big-circles.svg"
        alt=""
        width={400}
        height={400}
        aria-hidden
        className="pointer-events-none absolute -left-[6%] bottom-[30%] h-auto w-20 opacity-20 md:w-70 md:opacity-100"
      />
      <Image
        src="/svgs/artifacts/yellow-zigzag.svg"
        alt=""
        width={400}
        height={400}
        aria-hidden
        className="pointer-events-none absolute -left-[6%] bottom-[10%] h-auto w-50 opacity-25 md:w-90 md:opacity-100"
      />
      <div className="container relative z-10 mx-auto w-full max-w-7xl px-4">
        <div className="mx-auto mb-14 max-w-4xl text-center md:mb-16">
          <h2 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-6xl">
            About{" "}
            <span className="relative inline-block text-[#9fe8ff]">
              Olympole
              <span className="absolute -bottom-2 left-1/2 h-1.5 w-[8.5rem] -translate-x-1/2 rounded-full bg-[#86deff]" />
            </span>
          </h2>
          <p className="mx-auto max-w-3xl text-xl leading-relaxed text-white/90 md:text-[2rem] md:leading-[1.45]">
            Inspired by the Olympic spirit, Olympole is an event that brings together athletes,
            artists, and thinkers for an entire month of competition and fun
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {EVENT_STATS.map(({ title, subtitle, icon: Icon }) => (
            <article
              key={title}
              className="rounded-2xl border border-[#72dfff] bg-[#1b2a62] px-6 py-7 text-center shadow-[0_0_0_1px_rgba(114,223,255,0.25),0_0_22px_rgba(0,224,255,0.28)]"
            >
              <Icon className="mx-auto mb-5 h-8 w-8 text-[#f4ef66] md:h-9 md:w-9" />
              <h3 className="mb-1 text-[2.05rem] font-bold leading-tight text-white md:text-[2.2rem]">
                {title}
              </h3>
              <p className="text-lg text-white/65 md:text-xl">{subtitle}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
