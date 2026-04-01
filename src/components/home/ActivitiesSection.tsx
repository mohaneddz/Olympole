import Link from "next/link";
import Image from "next/image";
import { ACTIVITY_COLUMNS } from "@/data/activities";

export function ActivitiesSection() {
  const registerLabel = "REGISTER";

  return (
    <section id="activities" className="relative z-10 flex min-h-screen items-center overflow-hidden bg-[#030b2b] py-14 md:py-20">
      <Image
        src="/svgs/artifacts/big-circles.svg"
        alt=""
        width={400}
        height={400}
        aria-hidden
        className="pointer-events-none absolute -right-[6%] -top-[2%] h-auto w-40 opacity-100 md:w-90"
      />
      <Image
        src="/svgs/artifacts/dashes.svg"
        alt=""
        width={400}
        height={400}
        aria-hidden
        className="pointer-events-none absolute right-[34%] top-[4%] h-auto w-20 opacity-100 md:w-50"
      />
      <Image
        src="/svgs/artifacts/small-circles.svg"
        alt=""
        width={400}
        height={400}
        aria-hidden
        className="pointer-events-none absolute left-[34%] top-[4%] h-auto w-20 opacity-100 md:w-50"
      />
      <Image
        src="/svgs/artifacts/big-circles.svg"
        alt=""
        width={400}
        height={400}
        aria-hidden
        className="pointer-events-none absolute -left-[6%] right-[12%] h-auto w-20 opacity-100 md:w-70"
      />
      <Image
        src="/svgs/artifacts/blue-zigzag.svg"
        alt=""
        width={400}
        height={400}
        aria-hidden
        className="pointer-events-none absolute -left-[6%] -bottom-[5%] h-auto w-20 opacity-100 md:w-70"
      />
      <Image
        src="/svgs/artifacts/blue-zigzag.svg"
        alt=""
        width={400}
        height={400}
        aria-hidden
        className="pointer-events-none absolute -right-[6%] top-[30%] h-auto w-20 opacity-100 md:w-70"
      />
      <Image
        src="/svgs/artifacts/yellow-zigzag.svg"
        alt=""
        width={400}
        height={400}
        aria-hidden
        className="pointer-events-none absolute -right-[5%] top-[40%] h-auto w-20 opacity-100 md:w-50"
      />

      <div className="container relative z-20 mx-auto w-full max-w-7xl px-4">
        <div className="mb-12 flex flex-col items-center text-center md:mb-14">
          <Image
            src="/images/brand/fire.png"
            alt=""
            width={292}
            height={362}
            aria-hidden
            className="mb-1 h-auto w-24 md:w-28"
          />
          <Image
            src="/images/brand/circles.png"
            alt=""
            width={243}
            height={134}
            aria-hidden
            className="mb-4 h-auto w-14 md:w-16"
          />
          <h2 className="relative mb-5 text-5xl font-bold tracking-tight text-[#a6eaff] md:text-6xl">
            Activities
            <span className="absolute -bottom-2 left-1/2 h-2 w-[9.5rem] -translate-x-1/2 rounded-full bg-[#86deff]" />
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
