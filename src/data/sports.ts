/* ───────── sport data ───────── */
export type SportCategory = "collective" | "individual";

export interface SportItem {
    name: string;
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
        tagline: "Kick off the month with exciting matches!",
        description: "Join the game and score your goal.",
        image: "/images/activities/football.avif",
        category: "collective",
        emoji: "⚽",
        gradient: "from-green-500/30 to-transparent",
    },
    {
        name: "Handball",
        tagline: "Bring your team, join the handball fun and",
        description: "show your skills!",
        image: "/images/activities/handball.avif",
        category: "collective",
        emoji: "🤾",
        gradient: "from-orange-500/30 to-transparent",
    },
    {
        name: "Basketball",
        tagline: "Shoot, score, and dominate the court!",
        description: "Teamwork, speed, and clutch moments await!",
        image: "/images/activities/basketball.avif",
        category: "collective",
        emoji: "🏀",
        gradient: "from-amber-500/30 to-transparent",
    },
    {
        name: "Volleyball",
        tagline: "Team up and enjoy thrilling volleyball",
        description: "matches!",
        image: "/images/activities/volleyball.avif",
        category: "collective",
        emoji: "🏐",
        gradient: "from-yellow-400/30 to-transparent",
    },
    {
        name: "Swimming",
        tagline: "Dive in and race the clock!",
        description: "Make waves and finish strong.",
        image: "/images/activities/swimming.avif",
        category: "individual",
        emoji: "🏊",
        gradient: "from-sky-500/30 to-transparent",
    },
    {
        name: "Tennis",
        tagline: "Serve it, smash it, win it!",
        description: "Precision and power on every point.",
        image: "/images/activities/tennis.avif",
        category: "individual",
        emoji: "🎾",
        gradient: "from-lime-500/30 to-transparent",
    },
    {
        name: "Chess",
        tagline: "Think ahead and outsmart your opponent.",
        description: "Every move counts on the road to checkmate.",
        image: "/images/activities/chess.avif",
        category: "individual",
        emoji: "♟️",
        gradient: "from-slate-400/30 to-transparent",
    },
    {
        name: "Running",
        tagline: "Push your limits and chase the finish line!",
        description: "Speed, endurance, and pure determination.",
        image: "/images/activities/running.avif",
        category: "individual",
        emoji: "🏃",
        gradient: "from-red-500/30 to-transparent",
    },
];

export const SPORTS_DECORATIVE_ELEMENTS = [
    { src: "/svgs/artifacts/blue-zigzag.svg", className: "absolute -left-4 top-[8%] w-12 md:w-20 opacity-80" },
    { src: "/svgs/artifacts/yellow-zigzag.svg", className: "absolute -right-4 top-[15%] w-16 md:w-20 opacity-80" },
    { src: "/svgs/artifacts/small-circles.svg", className: "absolute left-[5%] top-[30%] w-8 md:w-16 opacity-70" },
    { src: "/svgs/artifacts/diamonds.svg", className: "absolute right-[8%] top-[35%] w-8 md:w-16 opacity-70" },
    { src: "/svgs/artifacts/pink-line.svg", className: "absolute -left-2 top-[52%] w-11 md:w-16 opacity-75" },
    { src: "/svgs/artifacts/big-circles.svg", className: "absolute right-[3%] top-[55%] w-12 md:w-20 opacity-75" },
    { src: "/svgs/artifacts/blue-zigzag.svg", className: "absolute left-[10%] top-[70%] w-8 md:w-16 opacity-65 rotate-45" },
    { src: "/svgs/artifacts/diamonds.svg", className: "absolute -right-5 top-[75%] w-14 md:w-20 opacity-70" },
    { src: "/svgs/artifacts/yellow-zigzag.svg", className: "absolute left-[3%] bottom-[8%] w-14 md:w-20 opacity-70 rotate-180" },
    { src: "/svgs/artifacts/small-circles.svg", className: "absolute -right-2 bottom-[5%] w-16 md:w-24 opacity-65" },
];
