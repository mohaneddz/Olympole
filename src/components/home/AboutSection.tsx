import { Calendar, Trophy, Users } from "lucide-react";
import { getHomeMetrics } from "@/lib/queries";

export async function AboutSection() {
  const metrics = await getHomeMetrics();
  const startDate = metrics.eventWindowStart.toLocaleDateString();
  const endDate = metrics.eventWindowEnd.toLocaleDateString();

  return (
    <section className="py-24 relative z-10 bg-[linear-gradient(to_bottom,rgb(2,2,8),rgb(5,5,15))]">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            About{" "}
            <span className="text-blue-400 underline decoration-blue-500/50 underline-offset-8">
              Olympole
            </span>
          </h2>
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-foreground/80 font-medium">
            Olympole combines sports, culture, and community-building in a single month-long
            festival with live management tools and real-time updates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="relative rounded-3xl overflow-hidden p-8 flex flex-col items-center text-center bg-black/40 backdrop-blur-md border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
            <Calendar className="w-12 h-12 text-blue-400 mb-6" />
            <h3 className="text-2xl font-bold mb-3 text-white">{startDate}</h3>
            <p className="text-blue-100/70 uppercase tracking-widest text-sm font-semibold">
              Until {endDate}
            </p>
          </div>

          <div className="relative rounded-3xl overflow-hidden p-8 flex flex-col items-center text-center bg-black/40 backdrop-blur-md border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
            <Trophy className="w-12 h-12 text-blue-400 mb-6" />
            <h3 className="text-2xl font-bold mb-3 text-white">{metrics.totalSports}</h3>
            <p className="text-blue-100/70 uppercase tracking-widest text-sm font-semibold">
              Active sports tracks
            </p>
          </div>

          <div className="relative rounded-3xl overflow-hidden p-8 flex flex-col items-center text-center bg-black/40 backdrop-blur-md border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
            <Users className="w-12 h-12 text-blue-400 mb-6" />
            <h3 className="text-2xl font-bold mb-3 text-white">{metrics.totalRegistrations}</h3>
            <p className="text-blue-100/70 uppercase tracking-widest text-sm font-semibold">
              Registrations logged
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
