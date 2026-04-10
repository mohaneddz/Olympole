export type ActivityCategory = "collective_sport" | "individual_sport" | "culture";

export type RegistrationActivity = {
  slug: string;
  title: string;
  shortDescription: string;
  category: ActivityCategory;
  teamBased: boolean;
  heroGradient: string;
  experiencePrompt: string;
  motivationPrompt: string;
  rolePrompt: string;
  rolesList?: string[];
  defaultAvailabilityHint: string;
};

export const REGISTRATION_ACTIVITIES: RegistrationActivity[] = [
  {
    slug: "football",
    title: "Football",
    shortDescription: "Join the tournament squad and compete through group and knockout phases.",
    category: "collective_sport",
    teamBased: true,
    heroGradient: "from-emerald-400/70 via-cyan-300/50 to-sky-500/60",
    experiencePrompt: "Tell us your football experience (position, years played, and recent competitions).",
    motivationPrompt: "Why do you want to represent your school in Football this year?",
    rolePrompt: "Preferred position / role",
    rolesList: ["Field Player", "Goal Keeper"],
    defaultAvailabilityHint: "availability for match days and team training",
  },
  {
    slug: "basketball",
    title: "Basketball",
    shortDescription: "Be part of the court rotation and tournament run.",
    category: "collective_sport",
    teamBased: true,
    heroGradient: "from-orange-400/70 via-amber-300/50 to-yellow-300/60",
    experiencePrompt: "Share your basketball experience (position, level, and recent participation).",
    motivationPrompt: "What drives you to play Basketball in Olympole?",
    rolePrompt: "Preferred position / role",
    defaultAvailabilityHint: "availability for practice sessions and game windows",
  },
  {
    slug: "handball",
    title: "Handball",
    shortDescription: "Compete in dynamic handball matches with your team.",
    category: "collective_sport",
    teamBased: true,
    heroGradient: "from-orange-500/70 via-rose-300/50 to-fuchsia-400/60",
    experiencePrompt: "Describe your handball experience and preferred tactical role.",
    motivationPrompt: "What makes you a strong candidate for the Handball lineup?",
    rolePrompt: "Preferred position / role",
    defaultAvailabilityHint: "availability for training, warm-up, and match slots",
  },
  {
    slug: "volleyball",
    title: "Volleyball",
    shortDescription: "Play in synchronized team-based volleyball fixtures.",
    category: "collective_sport",
    teamBased: true,
    heroGradient: "from-cyan-400/70 via-sky-300/50 to-blue-500/60",
    experiencePrompt: "Tell us your volleyball background and your strongest skills.",
    motivationPrompt: "Why should we select you for Volleyball this season?",
    rolePrompt: "Preferred position / role",
    defaultAvailabilityHint: "availability around court reservations and match days",
  },
  {
    slug: "swimming",
    title: "Swimming",
    shortDescription: "Race in timed swimming events and finals.",
    category: "individual_sport",
    teamBased: false,
    heroGradient: "from-sky-300/70 via-cyan-300/50 to-blue-400/60",
    experiencePrompt: "Share your swimming experience (strokes, distances, and best times).",
    motivationPrompt: "What are your goals in the Swimming competition?",
    rolePrompt: "Preferred discipline / event type",
    defaultAvailabilityHint: "availability for qualification and finals dates",
  },
  {
    slug: "tennis",
    title: "Tennis",
    shortDescription: "Compete in singles tournament brackets.",
    category: "individual_sport",
    teamBased: false,
    heroGradient: "from-lime-300/70 via-emerald-300/50 to-yellow-300/60",
    experiencePrompt: "Provide your tennis experience and playing style summary.",
    motivationPrompt: "What motivates you to compete in Tennis at Olympole?",
    rolePrompt: "Preferred court style / strengths",
    defaultAvailabilityHint: "availability for tournament bracket scheduling",
  },
  {
    slug: "chess",
    title: "Chess",
    shortDescription: "Play strategic rounds in the campus chess cup.",
    category: "individual_sport",
    teamBased: false,
    heroGradient: "from-slate-300/70 via-zinc-300/50 to-stone-300/60",
    experiencePrompt: "Describe your chess experience (rating, tournaments, preferred openings).",
    motivationPrompt: "Why do you want to join the Chess Grand Cup?",
    rolePrompt: "Preferred style / opening families",
    defaultAvailabilityHint: "availability for swiss rounds and tie-break sessions",
  },
  {
    slug: "running",
    title: "Running",
    shortDescription: "Join sprint and endurance race disciplines.",
    category: "individual_sport",
    teamBased: false,
    heroGradient: "from-rose-300/70 via-orange-300/50 to-amber-300/60",
    experiencePrompt: "Tell us your running history (events, distances, and personal records).",
    motivationPrompt: "What performance target are you pursuing in Running?",
    rolePrompt: "Preferred distance / race category",
    defaultAvailabilityHint: "availability for heats, finals, and route checks",
  },
  {
    slug: "talent-show",
    title: "Talent Show",
    shortDescription: "Take the stage and perform in front of the jury and audience.",
    category: "culture",
    teamBased: false,
    heroGradient: "from-fuchsia-300/70 via-violet-300/50 to-pink-400/60",
    experiencePrompt: "Describe your talent background and previous performances.",
    motivationPrompt: "What is your motivation for joining the Talent Show?",
    rolePrompt: "Performance type / act",
    defaultAvailabilityHint: "availability for rehearsals and stage checks",
  },
  {
    slug: "knowledge-cup",
    title: "Knowledge Cup",
    shortDescription: "Join fast-paced quiz battles across multiple categories.",
    category: "culture",
    teamBased: true,
    heroGradient: "from-violet-300/70 via-indigo-300/50 to-sky-300/60",
    experiencePrompt: "Share your quiz experience and strongest topics.",
    motivationPrompt: "Why are you a good fit for the Knowledge Cup?",
    rolePrompt: "Preferred topic area / team role",
    defaultAvailabilityHint: "availability for qualifiers and final rounds",
  },
  {
    slug: "writing-contest",
    title: "Writing Contest",
    shortDescription: "Submit your writing and compete in published rounds.",
    category: "culture",
    teamBased: false,
    heroGradient: "from-indigo-300/70 via-purple-300/50 to-blue-300/60",
    experiencePrompt: "Tell us about your writing background and preferred genres.",
    motivationPrompt: "What message or theme do you want to bring through your writing?",
    rolePrompt: "Preferred writing format",
    defaultAvailabilityHint: "availability for submission and review windows",
  },
  {
    slug: "art-exhibition",
    title: "Drawing & Art",
    shortDescription: "Present your visual work in the art exhibition program.",
    category: "culture",
    teamBased: false,
    heroGradient: "from-pink-300/70 via-rose-300/50 to-orange-300/60",
    experiencePrompt: "Describe your art background and medium specialties.",
    motivationPrompt: "Why do you want to participate in the Art Exhibition?",
    rolePrompt: "Preferred medium / style",
    defaultAvailabilityHint: "availability for setup, curation, and showcase day",
  },
];

export const REGISTRATION_ACTIVITY_MAP = new Map(
  REGISTRATION_ACTIVITIES.map((activity) => [activity.slug, activity])
);

export function getRegistrationActivityBySlug(slug: string) {
  return REGISTRATION_ACTIVITY_MAP.get(slug);
}
