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


