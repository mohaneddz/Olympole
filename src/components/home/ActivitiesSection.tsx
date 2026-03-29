import Link from "next/link";
import Image from "next/image";
import { CircleDot, Dumbbell, Palette } from "lucide-react";

const ACTIVITY_COLUMNS = [
  {
    title: "Collective Sports",
    icon: CircleDot,
    border: "border-[#f18cd4]",
    heading: "text-[#f2acd9]",
    rowBg: "bg-[#ef8dd6]",
    text: "text-[#120920]",
    button: "border-[#3d243a] text-[#1a1026]",
    items: [
      { name: "Football", href: "/register" },
      { name: "Basketball", href: "/register" },
      { name: "Handball", href: "/register" },
      { name: "Volleyball", href: "/register" },
    ],
  },
  {
    title: "Individual Sports",
    icon: Dumbbell,
    border: "border-[#eef15b]",
    heading: "text-[#eef15b]",
    rowBg: "bg-[#ecec65]",
    text: "text-[#181717]",
    button: "border-[#46412b] text-[#1d1b12]",
    items: [
      { name: "Swimming", href: "/register" },
      { name: "Tennis", href: "/register" },
      { name: "Chess", href: "/register" },
      { name: "Running", href: "/register" },
    ],
  },
  {
    title: "Cultural Events",
    icon: Palette,
    border: "border-[#00d8ff]",
    heading: "text-[#90edff]",
    rowBg: "bg-[#13c8e5]",
    text: "text-white",
    button: "border-white text-white",
    items: [
      { name: "Talent Show", href: "/culture/talent" },
      { name: "Knowledge Cup", href: "/culture" },
      { name: "Writing Contest", href: "/culture/writing" },
      { name: "Drawing & Art", href: "/culture/art" },
    ],
  },
] as const;

export function ActivitiesSection() {
  const registerLabel = "REGISTER";

  return (
    <section className="relative z-10 overflow-hidden bg-[#030b2b] pb-24 pt-16 md:pb-28 md:pt-24">
      {/* Non-cropped (full circles) in the center area */}
      <Image
        src="/images/artifacts/Rectangle-6.png"
        alt=""
        width={135}
        height={135}
        aria-hidden
        className="pointer-events-none absolute left-[25%] top-[10%] h-auto w-[60px] opacity-95 md:w-[90px]"
      />
      <Image
        src="/images/artifacts/Rectangle-7.png"
        alt=""
        width={113}
        height={113}
        aria-hidden
        className="pointer-events-none absolute left-[45%] top-[80%] h-auto w-[50px] opacity-95 md:w-[70px]"
      />
      <Image
        src="/images/artifacts/Rectangle-12.png"
        alt=""
        width={126}
        height={128}
        aria-hidden
        className="pointer-events-none absolute right-[35%] top-[5%] h-auto w-[65px] opacity-95 md:w-[85px]"
      />
      <Image
        src="/images/artifacts/Rectangle-4.png"
        alt=""
        width={135}
        height={135}
        aria-hidden
        className="pointer-events-none absolute right-[25%] top-[60%] h-auto w-[55px] opacity-95 md:w-[80px]"
      />

      {/* Cropped images strictly on the borders */}
      <Image
        src="/images/artifacts/Rectangle-2.png"
        alt=""
        width={141}
        height={206}
        aria-hidden
        className="pointer-events-none absolute left-0 bottom-[15%] h-auto w-[82px] opacity-95 md:w-[118px]"
      />
      <Image
        src="/images/artifacts/Rectangle-10.png"
        alt=""
        width={145}
        height={205}
        aria-hidden
        className="pointer-events-none absolute right-0 bottom-[30%] h-auto w-[84px] opacity-95 md:w-[122px]"
      />
      <Image
        src="/images/artifacts/Rectangle-11.png"
        alt=""
        width={149}
        height={248}
        aria-hidden
        className="pointer-events-none absolute right-0 top-[20%] h-auto w-[88px] opacity-85 md:w-[116px]"
      />

      <div className="container relative z-20 mx-auto max-w-7xl px-4">
        <div className="mb-12 flex flex-col items-center text-center md:mb-14">
          <Image
            src="/images/brand/fire.png"
            alt=""
            width={292}
            height={362}
            aria-hidden
            className="mb-1 h-auto w-[92px] md:w-[112px]"
          />
          <Image
            src="/images/brand/circles.png"
            alt=""
            width={243}
            height={134}
            aria-hidden
            className="mb-4 h-auto w-[54px] md:w-[64px]"
          />
          <h2 className="relative mb-5 text-5xl font-bold tracking-tight text-[#a6eaff] md:text-6xl">
            Activities
            <span className="absolute -bottom-2 left-1/2 h-[8px] w-[9.5rem] -translate-x-1/2 rounded-full bg-[#86deff]" />
          </h2>
          <p className="max-w-4xl text-xl leading-snug text-white md:text-3xl">
            Register On Your Favorite Activity and Join the Fun
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          {ACTIVITY_COLUMNS.map((column) => (
            <article
              key={column.title}
              className={`group/card rounded-3xl border bg-[#071034]/95 p-5 md:p-6 ${column.border} shadow-[0_0_0_1px_rgba(255,255,255,0.1)] transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]`}
            >
              <div className={`mb-5 flex items-center gap-3 text-xl font-bold md:text-3xl ${column.heading}`}>
                <column.icon className="h-6 w-6 md:h-8 md:w-8" />
                <h3>{column.title}</h3>
              </div>

              <div className="space-y-3 md:space-y-4">
                {column.items.map((item) => (
                  <div
                    key={item.name}
                    className={`group/row flex items-center gap-3 rounded-2xl px-4 py-3 md:px-5 md:py-3.5 ${column.rowBg} transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
                  >
                    <span className={`min-w-0 flex-1 text-base font-bold leading-tight md:text-xl ${column.text} transition-opacity group-hover/row:opacity-90`}>
                      {item.name}
                    </span>
                    <Link
                      href={item.href}
                      className={`inline-flex h-8 min-w-[6.5rem] shrink-0 items-center justify-center rounded-xl border-2 px-3 text-xs font-extrabold tracking-wide whitespace-nowrap md:h-10 md:min-w-[8rem] md:text-sm ${column.button} transition-all duration-300 hover:scale-105 hover:brightness-110 hover:shadow-md active:scale-95`}
                    >
                      {registerLabel}
                    </Link>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
