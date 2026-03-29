import Image from "next/image";
import { CalendarDays, Trophy, UsersRound } from "lucide-react";

export function AboutSection() {
  const stats = [
    {
      title: "6th April",
      subtitle: "1 month duration",
      icon: CalendarDays,
    },
    {
      title: "3 Categories",
      subtitle: "Collective, individual sports, culture",
      icon: Trophy,
    },
    {
      title: "12+",
      subtitle: "Activities",
      icon: UsersRound,
    },
  ] as const;

  return (
    <section className="relative z-10 overflow-hidden bg-[#030b2b] py-[5.5rem] md:py-28">
      <Image
        src="/images/artifacts/Rectangle-6.png"
        alt=""
        width={135}
        height={135}
        aria-hidden
        className="pointer-events-none absolute left-7 top-10 h-auto w-[88px] opacity-95 md:w-[120px]"
      />
      <Image
        src="/images/artifacts/Rectangle-7.png"
        alt=""
        width={113}
        height={113}
        aria-hidden
        className="pointer-events-none absolute left-[5.5rem] top-[6.5rem] h-auto w-[68px] opacity-95 md:w-[96px]"
      />
      <Image
        src="/images/artifacts/Rectangle-9.png"
        alt=""
        width={118}
        height={178}
        aria-hidden
        className="pointer-events-none absolute -left-8 top-52 h-auto w-[64px] opacity-90 md:w-[96px]"
      />
      <Image
        src="/images/artifacts/Rectangle-4.png"
        alt=""
        width={135}
        height={135}
        aria-hidden
        className="pointer-events-none absolute right-6 top-24 h-auto w-[72px] opacity-95 md:w-[108px]"
      />
      <Image
        src="/images/artifacts/Rectangle-5.png"
        alt=""
        width={113}
        height={113}
        aria-hidden
        className="pointer-events-none absolute right-20 top-[9.5rem] h-auto w-[58px] opacity-95 md:w-[82px]"
      />
      <Image
        src="/images/artifacts/Rectangle-10.png"
        alt=""
        width={145}
        height={205}
        aria-hidden
        className="pointer-events-none absolute -right-6 top-[13.5rem] h-auto w-[98px] opacity-95 md:w-[128px]"
      />
      <Image
        src="/images/artifacts/Rectangle-11.png"
        alt=""
        width={149}
        height={248}
        aria-hidden
        className="pointer-events-none absolute -left-10 bottom-2 h-auto w-[94px] opacity-90 md:w-[124px]"
      />
      <Image
        src="/images/artifacts/Rectangle-2.png"
        alt=""
        width={141}
        height={206}
        aria-hidden
        className="pointer-events-none absolute -right-7 bottom-3 h-auto w-[92px] opacity-90 md:w-[122px]"
      />

      <div className="container relative z-10 mx-auto max-w-7xl px-4">
        <div className="mx-auto mb-14 max-w-4xl text-center md:mb-16">
          <h2 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-6xl">
            About{" "}
            <span className="relative inline-block text-[#9fe8ff]">
              Olympole
              <span className="absolute -bottom-2 left-1/2 h-[6px] w-[8.5rem] -translate-x-1/2 rounded-full bg-[#86deff]" />
            </span>
          </h2>
          <p className="mx-auto max-w-3xl text-xl leading-relaxed text-white/90 md:text-[2rem] md:leading-[1.45]">
            Inspired by the Olympic spirit, Olympole is an event that brings together athletes,
            artists, and thinkers for an entire month of competition and fun
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {stats.map(({ title, subtitle, icon: Icon }) => (
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
