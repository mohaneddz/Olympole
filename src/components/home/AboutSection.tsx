import { Calendar, Trophy, Users } from "lucide-react";

export function AboutSection() {
  return (
    <section className="py-24 relative z-10 bg-[linear-gradient(to_bottom,rgb(2,2,8),rgb(5,5,15))]">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            About <span className="text-blue-400 underline decoration-blue-500/50 underline-offset-8">Olympole</span>
          </h2>
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-foreground/80 font-medium drop-shadow-md">
            Inspired by the Olympic spirit, Olympole is an event that brings together athletes, artists, and thinkers for an entire month of competition and fun
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="relative group rounded-3xl overflow-hidden p-8 flex flex-col items-center text-center bg-black/40 backdrop-blur-md border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all duration-300">
            <Calendar className="w-12 h-12 text-blue-400 mb-6 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
            <h3 className="text-2xl font-bold mb-3 text-white">6th April</h3>
            <p className="text-blue-100/70 uppercase tracking-widest text-sm font-semibold">1 month duration</p>
          </div>
          
          <div className="relative group rounded-3xl overflow-hidden p-8 flex flex-col items-center text-center bg-black/40 backdrop-blur-md border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all duration-300">
            <Trophy className="w-12 h-12 text-blue-400 mb-6 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
            <h3 className="text-2xl font-bold mb-3 text-white">3 Categories</h3>
            <p className="text-blue-100/70 uppercase tracking-widest text-sm font-semibold">Collective, individual sports, culture</p>
          </div>

          <div className="relative group rounded-3xl overflow-hidden p-8 flex flex-col items-center text-center bg-black/40 backdrop-blur-md border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all duration-300">
            <Users className="w-12 h-12 text-blue-400 mb-6 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
            <h3 className="text-2xl font-bold mb-3 text-white">12+</h3>
            <p className="text-blue-100/70 uppercase tracking-widest text-sm font-semibold">Activities</p>
          </div>
        </div>
      </div>
    </section>
  );
}