import { GlowCard } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Trophy, Users, PersonStanding } from "lucide-react";

const sportsCategories = [
  {
    title: "Collective Sports",
    icon: <Users className="w-8 h-8 text-primary" />,
    description: "Team-based events including Basketball, Cyber-Soccer, and Relay.",
    color: "cyan",
  },
  {
    title: "Individual Events",
    icon: <PersonStanding className="w-8 h-8 text-secondary" />,
    description: "Athletics, Swimming, Gymnastics and solo Mind Sports.",
    color: "purple",
  },
  {
    title: "Women's Competitions",
    icon: <Trophy className="w-8 h-8 text-accent" />,
    description: "Featured leagues and tournaments across all major categories.",
    color: "cyan",
  },
];

const featuredMatches = [
  { team1: "Neo-Tokyo", team2: "Paris Prime", sport: "Cyber-Soccer", time: "14:00 Today" },
  { team1: "New York", team2: "London", sport: "Basketball", time: "18:30 Today" },
];

export default function SportsHub() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-7xl flex flex-col gap-12 flex-1">
      <div className="text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-br from-primary via-blue-400 to-secondary">
          Sports Hub
        </h1>
        <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
          The pinnacle of physical and tactical competition. Choose a category to track schedules, teams, and live events.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {sportsCategories.map((cat, i) => (
          <GlowCard key={i} glowColor={cat.color as "cyan" | "purple"} className="p-8 flex flex-col items-center text-center">
            <div className={`w-16 h-16 rounded-full bg-background border border-card-border flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(0,0,0,0.5)]`}>
              {cat.icon}
            </div>
            <h3 className="text-2xl font-bold mb-4">{cat.title}</h3>
            <p className="text-foreground/70 mb-8 flex-1">{cat.description}</p>
            <Button variant="neonPill" size="pill" className="w-full group">
              Explore <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </GlowCard>
        ))}
      </div>

      <div className="mt-12 py-12 border-t border-card-border">
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-accent animate-pulse shadow-[0_0_10px_rgba(255,0,85,0.8)]"></span>
          Upcoming Finals Spotlight
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredMatches.map((match, i) => (
            <div key={i} className="flex flex-col sm:flex-row items-center justify-between p-6 glass-card rounded-xl border border-primary/20 hover:border-primary/50 transition-colors">
              <div className="flex-1 text-center sm:text-left mb-4 sm:mb-0">
                <span className="text-xs uppercase tracking-wider text-primary font-semibold block mb-2">{match.sport} • {match.time}</span>
                <div className="flex items-center justify-center sm:justify-start gap-4 text-xl font-bold">
                  <span>{match.team1}</span>
                  <span className="text-foreground/40 text-sm">VS</span>
                  <span>{match.team2}</span>
                </div>
              </div>
              <Button variant="neonPill" size="pill">Set Reminder</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
