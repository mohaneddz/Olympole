/* sport data */
export type SportCategory = "collective" | "individual";

export interface SportItem {
  name: string;
  href: string;
  tagline: string;
  description: string;
  image: string;
  category: SportCategory;
  emoji: string;
  gradient: string;
}

export const SPORTS: SportItem[] = [
  {
    name: "Football",
    href: "/register/football",
    tagline: "Kick off the month with exciting matches!",
    description: "Join the game and score your goal.",
    image: "/images/activities/football.avif",
    category: "collective",
    emoji: "FB",
    gradient: "from-green-500/30 to-transparent",
  },
  {
    name: "Handball",
    href: "/register/handball",
    tagline: "Bring your team and join the handball fun.",
    description: "Show your skills and pace.",
    image: "/images/activities/handball.avif",
    category: "collective",
    emoji: "HB",
    gradient: "from-orange-500/30 to-transparent",
  },
  {
    name: "Basketball",
    href: "/register/basketball",
    tagline: "Shoot, score, and dominate the court!",
    description: "Teamwork, speed, and clutch moments await.",
    image: "/images/activities/basketball.avif",
    category: "collective",
    emoji: "BB",
    gradient: "from-amber-500/30 to-transparent",
  },
  {
    name: "Volleyball",
    href: "/register/volleyball",
    tagline: "Team up and enjoy thrilling volleyball matches.",
    description: "Serve, block, and win together.",
    image: "/images/activities/volleyball.avif",
    category: "collective",
    emoji: "VB",
    gradient: "from-yellow-400/30 to-transparent",
  },
  {
    name: "Chess",
    href: "/register/chess",
    tagline: "Think ahead and outsmart your opponent.",
    description: "Every move counts on the road to checkmate.",
    image: "/images/activities/chess.avif",
    category: "individual",
    emoji: "CH",
    gradient: "from-slate-400/30 to-transparent",
  },
  {
    name: "Running",
    href: "/register/running",
    tagline: "Push your limits and chase the finish line!",
    description: "Speed, endurance, and determination.",
    image: "/images/activities/running.avif",
    category: "individual",
    emoji: "RN",
    gradient: "from-red-500/30 to-transparent",
  },
];

