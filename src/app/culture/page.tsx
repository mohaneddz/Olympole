import Image from "next/image";
import Link from "next/link";
import { CULTURE_EVENTS, CULTURE_DECORATIVE_ELEMENTS, CultureEvent } from "@/data/culture";

/* ───────── page ───────── */
export default function CulturePage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      {/* ── Hero banner ── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
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
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
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
              CULTURAL EVENTS
            </span>
          </h1>

          <div className="mt-8">
            <Link
              href="#culture-activities"
              className="inline-flex h-14 items-center justify-center rounded-full border border-secondary/40 bg-secondary/10 px-8 text-lg font-bold text-secondary backdrop-blur-md transition-all hover:bg-secondary hover:text-white hover:shadow-none active:scale-95"
            >
              Explore Culture
            </Link>
          </div>
        </div>
      </section>

      {/* ── Cards section ── */}
      <section id="culture-activities" className="relative z-10 w-full bg-background pt-24 pb-20">
        <div className="mx-auto max-w-3xl px-4">
          {/* Decorative floating elements */}
          {CULTURE_DECORATIVE_ELEMENTS.map((el, i) => (
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

          <div className="flex flex-col gap-10">
            {CULTURE_EVENTS.map((event, idx) => (
              <CultureCard key={event.name} event={event} index={idx} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ───────── culture card ───────── */
function CultureCard({ event, index }: { event: CultureEvent; index: number }) {
  const isEven = index % 2 === 0;

  return (
    <article
      className={`animate-fade-in-up group relative flex flex-col ${isEven ? "sm:flex-row" : "sm:flex-row-reverse"
        } items-center gap-5 sm:gap-8`}
      style={{ animationDelay: `${index * 120}ms` }}
    >
      {/* Text content */}
      <div className={`flex-1 ${isEven ? "sm:text-left" : "sm:text-right"}`}>
        <h2 className="text-2xl md:text-3xl font-extrabold mb-2 underline underline-offset-4 decoration-[#ffc040]/50 decoration-2">
          {event.name}
        </h2>
        <p className="text-sm md:text-base text-foreground/80 leading-relaxed mb-1">
          {event.tagline}
        </p>
        <p className="text-sm md:text-base text-foreground/70 leading-relaxed mb-4">
          {event.description}
        </p>
        <Link
          href={event.href}
          className="inline-flex items-center gap-2 rounded-lg border-2 border-foreground/80 bg-transparent px-5 py-2.5 text-sm font-bold tracking-wide text-foreground transition-all duration-300 hover:bg-[#ffc040] hover:border-[#ffc040] hover:text-black hover:shadow-none active:scale-95"
        >
          Register Now !
        </Link>
      </div>

      {/* Image */}
      <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex-shrink-0">
        <div className="absolute inset-0 rounded-2xl overflow-hidden border border-card-border/60 transition-shadow duration-500">
          <Image
            src={event.image}
            alt={event.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {/* Event-specific gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t ${event.gradient}`} />
          {/* Bottom dark gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#030b2b]/70 via-transparent to-transparent" />
          {/* Emoji overlay */}
          <div className="absolute bottom-3 right-3 text-3xl opacity-80">
            {event.emoji}
          </div>
        </div>
      </div>
    </article>
  );
}
