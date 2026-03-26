import { GlowCard } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const scheduleData = [
  {
    time: "09:00 - 11:30",
    event: "Opening Ceremony Preludes",
    category: "Culture",
    venue: "Main Stadium",
    status: "Upcoming",
  },
  {
    time: "12:00 - 14:00",
    event: "Athletics: 100m Heats",
    category: "Individual",
    venue: "Oval Track",
    status: "Upcoming",
  },
  {
    time: "15:00 - 18:00",
    event: "Cyber-Chess Quarterfinals",
    category: "Mind Sports",
    venue: "Neon Hall",
    status: "Upcoming",
  },
  {
    time: "19:00 - 22:00",
    event: "Basketball: Semifinals",
    category: "Collective",
    venue: "Dome Arena",
    status: "Upcoming",
  },
];

export default function SchedulePage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-7xl flex flex-col gap-8 flex-1">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 glow-text-cyan">
            Official Schedule
          </h1>
          <p className="text-lg text-foreground/70 max-w-2xl">
            Filter by day, category, and venue to build your perfect Olympole 2026 itinerary.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <Button variant="default" className="rounded-full px-6">Day 1</Button>
        <Button variant="outline" className="rounded-full px-6">Day 2</Button>
        <Button variant="outline" className="rounded-full px-6">Day 3</Button>
        <div className="h-10 w-px bg-card-border mx-2 hidden sm:block"></div>
        <Button variant="ghost" className="rounded-full px-6 text-primary">All Categories</Button>
        <Button variant="ghost" className="rounded-full px-6 text-foreground/70">Athletics</Button>
        <Button variant="ghost" className="rounded-full px-6 text-foreground/70">Culture</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 flex flex-col gap-6">
          {scheduleData.map((item, i) => (
            <GlowCard key={i} glowColor="cyan" className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="flex-shrink-0 w-32 border-l-2 border-primary pl-4">
                <p className="text-xl font-mono font-bold">{item.time}</p>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">{item.event}</h3>
                <div className="flex flex-wrap items-center gap-3 text-sm text-foreground/60">
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> {item.category}</span>
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-accent"></span> {item.venue}</span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <span className="px-3 py-1 text-xs font-semibold rounded-full border border-primary/30 text-primary bg-primary/10">
                  {item.status}
                </span>
              </div>
            </GlowCard>
          ))}
        </div>

        <div className="hidden lg:block">
          <GlowCard glowColor="purple" className="p-6 sticky top-24">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Live Now
            </h3>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-card-bg border border-card-border">
                <p className="text-sm text-primary mb-1">Rowing Finals</p>
                <p className="font-semibold">Aqua Arena</p>
              </div>
              <div className="p-4 rounded-lg bg-card-bg border border-card-border">
                <p className="text-sm text-secondary mb-1">Talent Show Heats</p>
                <p className="font-semibold">Main Stage</p>
              </div>
            </div>
          </GlowCard>
        </div>
      </div>
    </div>
  );
}
