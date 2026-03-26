import { GlowCard } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Paintbrush, Mic2, BookOpen } from "lucide-react";

export default function CultureHub() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-7xl flex flex-col gap-12 flex-1">
      <div className="text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-secondary to-pink-500">
          Culture Hub
        </h1>
        <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
          Olympole 2026 isn't just about physical superiority. Explore the apex of human creativity in our digital exhibits.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Link href="/culture/art" className="block outline-none">
          <GlowCard glowColor="purple" className="p-8 flex flex-col items-center text-center h-full hover:scale-105 transition-transform">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-6 border border-secondary/50">
              <Paintbrush className="w-10 h-10 text-secondary" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Digital Art Exhibition</h3>
            <p className="text-foreground/70 mb-6 flex-1">
              Immersive holographic galleries and algorithmic masterpiece displays.
            </p>
            <span className="text-secondary font-bold text-sm uppercase tracking-wider">Enter Gallery</span>
          </GlowCard>
        </Link>

        <Link href="/culture/talent" className="block outline-none">
          <GlowCard glowColor="cyan" className="p-8 flex flex-col items-center text-center h-full hover:scale-105 transition-transform">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center mb-6 border border-primary/50">
              <Mic2 className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Cyber-Talent Show</h3>
            <p className="text-foreground/70 mb-6 flex-1">
              Live performances augmented by neural-reactive visuals and droneography.
            </p>
            <span className="text-primary font-bold text-sm uppercase tracking-wider">Watch Live</span>
          </GlowCard>
        </Link>

        <Link href="/culture/writing" className="block outline-none">
          <GlowCard glowColor="purple" className="p-8 flex flex-col items-center text-center h-full hover:scale-105 transition-transform cursor-pointer">
            <div className="w-20 h-20 rotate-45 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-6 border border-indigo-500/50">
              <div className="-rotate-45">
                <BookOpen className="w-10 h-10 text-indigo-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-4">Writing Contest</h3>
            <p className="text-foreground/70 mb-6 flex-1">
              The grand archive of neo-literature. Read, judge, and submit.
            </p>
            <span className="text-indigo-400 font-bold text-sm uppercase tracking-wider">Read Archives</span>
          </GlowCard>
        </Link>
      </div>
    </div>
  );
}
