/* ───────── culture event data ───────── */
export interface CultureEvent {
  name: string;
  tagline: string;
  description: string;
  image: string;
  href: string;
  emoji: string;
  gradient: string;
}

export const CULTURE_EVENTS: CultureEvent[] = [
  {
    name: "Knowledge Cup",
    tagline: "Think fast, guess smarter, win together!",
    description: "Can you find the most popular answers?",
    image: "/images/activities/knowledge%20cup.avif",
    href: "/culture",
    emoji: "🧠",
    gradient: "from-violet-500/30 to-transparent",
  },
  {
    name: "Writing Contest",
    tagline: "Words have power, use yours!",
    description: "Write, inspire, and tell your story.",
    image: "/images/activities/writing.avif",
    href: "/culture/writing",
    emoji: "✍️",
    gradient: "from-indigo-500/30 to-transparent",
  },
  {
    name: "Drawing & Art",
    tagline: "Turn imagination into masterpieces.",
    description: "Create, express, and let your art speak.",
    image: "/images/activities/drawing.avif",
    href: "/culture/art",
    emoji: "🎨",
    gradient: "from-pink-500/30 to-transparent",
  },
  {
    name: "Talent Show",
    tagline: "Lights on, stage ready, it's your moment!",
    description: "Show your talent and impress the crowd.",
    image: "/images/activities/talent.avif",
    href: "/culture/talent",
    emoji: "🌟",
    gradient: "from-amber-500/30 to-transparent",
  },
];

export const CULTURE_DECORATIVE_ELEMENTS = [
  { src: "/svgs/artifacts/yellow-zigzag.svg", className: "absolute -right-4 top-[6%] w-14 md:w-20 opacity-80" },
  { src: "/svgs/artifacts/small-circles.svg", className: "absolute -left-2 top-[18%] w-9 md:w-16 opacity-70" },
  { src: "/svgs/artifacts/diamonds.svg", className: "absolute right-[5%] top-[28%] w-12 md:w-20 opacity-75" },
  { src: "/svgs/artifacts/blue-zigzag.svg", className: "absolute left-[8%] top-[40%] w-8 md:w-12 opacity-65" },
  { src: "/svgs/artifacts/big-circles.svg", className: "absolute -right-3 top-[50%] w-14 md:w-24 opacity-70" },
  { src: "/svgs/artifacts/pink-line.svg", className: "absolute -left-3 top-[62%] w-11 md:w-16 opacity-70" },
  { src: "/svgs/artifacts/diamonds.svg", className: "absolute right-[10%] top-[72%] w-8 md:w-12 opacity-60" },
  { src: "/svgs/artifacts/yellow-zigzag.svg", className: "absolute -left-4 bottom-[8%] w-14 md:w-20 opacity-70 rotate-45" },
  { src: "/svgs/artifacts/small-circles.svg", className: "absolute -right-3 bottom-[12%] w-14 md:w-20 opacity-65" },
  { src: "/svgs/artifacts/blue-zigzag.svg", className: "absolute left-[3%] bottom-[25%] w-12 md:w-16 opacity-60 rotate-180" },
];
