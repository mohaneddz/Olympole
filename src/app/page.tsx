import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { GlowCard, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { ArrowRight, Trophy, Calendar, Radio } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 w-full">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden w-full">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/hero.png" 
            alt="Olympole 2026 Background" 
            fill
            priority
            className="object-cover"
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(5,5,15,0.8)_80%,rgba(5,5,15,1)_100%)] z-0" />
          <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px]" />
          {/* Cyber lines pattern */}
          <div className="absolute inset-0 opacity-[0.03]" 
               style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} 
          />
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center mt-[-5vh] center col gap-4">

          <Image src="/images/fire.png" height={1024} width={1024} alt="" className="w-80"/>
          <Image src="/images/circles.png" height={1024} width={1024} alt="" className="w-48"/>
          
          <h1 className="font-extrabold tracking-tighter mb-6">
            <span className="text-6xl md:text-8xl lg:text-9xl text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
              OLYMPOLE
            </span>
            <br />
            <span className="text-2xl md:text-6xl lg:text-7xl text-transparent bg-clip-text  bg-gradient-to-b from-white to-white/60 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
              2026
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-foreground/80 mb-12 font-medium drop-shadow-md">
            Enter the Cyber-Stadium. The next generation of athletics, mind sports, and digital culture collide in a spectacular global tournament.
          </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button variant="neonPill" size="pill" className="w-full sm:w-auto text-lg px-8 h-14" asChild>
              <Link href="/register">Register to Compete</Link>
            </Button>
            <Button variant="neonPill" size="pill" className="w-full sm:w-auto text-lg px-8 h-14 bg-background/50 backdrop-blur-md border-primary/20 hover:border-primary/50" asChild>
              <Link href="/schedule">Explore Events</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Live Action & Scores Section */}
      <section className="py-24 relative z-10 bg-[linear-gradient(to_bottom,rgb(2,2,8),rgb(5,5,15))]">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-center mb-16 opacity-90">
            <div className="h-px bg-gradient-to-r from-transparent to-white/50 w-16 md:w-48" />
            <h2 className="text-xl md:text-3xl font-light tracking-[0.2em] px-6 uppercase text-center whitespace-nowrap">Live Action & Scores</h2>
            <div className="h-px bg-gradient-to-l from-transparent to-white/50 w-16 md:w-48" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="relative group rounded-[2rem] overflow-hidden flex flex-col justify-end transition-all duration-300 hover:shadow-[0_0_30px_rgba(96,165,250,0.5)]">
              <Image src="/images/cards/collective.png" width={400} height={800} alt="Collective Sports" className="w-full h-auto object-contain" />
              <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                <Button variant="outline" className="bg-black/40 backdrop-blur-md border-white/20 rounded-full px-8 hover:bg-white/20 hover:text-white transition-all uppercase text-xs tracking-widest" asChild>
                  <Link href="/sports">View Schedule</Link>
                </Button>
              </div>
            </div>
            
            <div className="relative group rounded-[2rem] overflow-hidden flex flex-col justify-end transition-all duration-300 hover:shadow-[0_0_30px_rgba(167,139,250,0.5)]">
              <Image src="/images/cards/individual.png" width={400} height={800} alt="Individual Sports" className="w-full h-auto object-contain" />
              <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                <Button variant="outline" className="bg-black/40 backdrop-blur-md border-white/20 rounded-full px-8 hover:bg-white/20 hover:text-white transition-all uppercase text-xs tracking-widest" asChild>
                  <Link href="/sports">View Schedule</Link>
                </Button>
              </div>
            </div>

            <div className="relative group rounded-[2rem] overflow-hidden flex flex-col justify-end transition-all duration-300 hover:shadow-[0_0_30px_rgba(244,114,182,0.5)]">
              <Image src="/images/cards/talent.png" width={400} height={800} alt="Talent Show Events" className="w-full h-auto object-contain" />
              <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                <Button variant="outline" className="bg-black/40 backdrop-blur-md border-white/20 rounded-full px-8 hover:bg-white/20 hover:text-white transition-all uppercase text-xs tracking-widest" asChild>
                  <Link href="/culture/talent">View Matches</Link>
                </Button>
              </div>
            </div>

            <div className="relative group rounded-[2rem] overflow-hidden flex flex-col justify-end transition-all duration-300 hover:shadow-[0_0_30px_rgba(251,191,36,0.5)]">
              <Image src="/images/cards/art.png" width={400} height={800} alt="Writing & Art" className="w-full h-auto object-contain" />
              <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                <Button variant="outline" className="bg-black/40 backdrop-blur-md border-white/20 rounded-full px-8 hover:bg-white/20 hover:text-white transition-all uppercase text-xs tracking-widest" asChild>
                  <Link href="/culture/art">View Schedule</Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-16 flex justify-center">
            <Button variant="outline" className="rounded-full px-12 py-6 text-sm tracking-[0.2em] uppercase border-blue-400/50 text-blue-100 hover:bg-blue-400/20 hover:border-blue-300 transition-all font-medium" style={{ boxShadow: '0 0 20px rgba(96, 165, 250, 0.2), inset 0 0 10px rgba(96, 165, 250, 0.1)' }} asChild>
              <Link href="/schedule">View Full Schedule</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-24 relative z-10 bg-[linear-gradient(to_bottom,rgb(5,5,15),rgb(2,2,8))] border-t border-card-border">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">The Arenas</h2>
              <p className="text-foreground/60 max-w-xl">
                Experience physical endurance, strategic brilliance, and creative mastery across our three main domains.
              </p>
            </div>
            <Button variant="ghost" className="mt-6 md:mt-0 text-primary hover:text-primary/80 group">
              View full schedule <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <GlowCard glowColor="cyan" className="min-h-[300px] flex flex-col justify-between p-8">
              <Trophy className="w-12 h-12 text-primary mb-6" />
              <div>
                <h3 className="text-2xl font-bold mb-3">Athletic Sports</h3>
                <p className="text-foreground/70 mb-6">
                  Classic team events, individual showdowns, and track & field inside the glowing Dome.
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-xs uppercase tracking-wider font-semibold text-primary px-3 py-1 bg-primary/10 rounded-full border border-primary/20">Collective</span>
                  <span className="text-xs uppercase tracking-wider font-semibold text-primary px-3 py-1 bg-primary/10 rounded-full border border-primary/20">Individual</span>
                </div>
              </div>
            </GlowCard>

            <GlowCard glowColor="purple" className="min-h-[300px] flex flex-col justify-between p-8">
              <Radio className="w-12 h-12 text-secondary mb-6" />
              <div>
                <h3 className="text-2xl font-bold mb-3">Culture & Arts</h3>
                <p className="text-foreground/70 mb-6">
                  Immerse in the neon exhibitions, literature, and electric performances marking the cultural height of 2026.
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs uppercase tracking-wider font-semibold text-secondary px-3 py-1 bg-secondary/10 rounded-full border border-secondary/20">Talent</span>
                  <span className="text-xs uppercase tracking-wider font-semibold text-secondary px-3 py-1 bg-secondary/10 rounded-full border border-secondary/20">Art Exhibition</span>
                </div>
              </div>
            </GlowCard>

            <GlowCard glowColor="cyan" className="min-h-[300px] flex flex-col justify-between p-8 group relative overflow-hidden">
               {/* Quick stats / live snippet illusion */}
              <div className="absolute top-8 right-8 w-6 h-6 flex items-center justify-center">
                 <span className="absolute w-full h-full rounded-full bg-accent/30 animate-ping"></span>
                 <span className="relative w-2 h-2 rounded-full bg-accent"></span>
              </div>
              <Calendar className="w-12 h-12 text-accent mb-6" />
              <div>
                <h3 className="text-2xl font-bold mb-3">Live Match Center</h3>
                <p className="text-foreground/70 mb-6">
                  Track dynamic data, view holographic match states, and follow the leaderboards in real-time.
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-xs uppercase tracking-wider font-semibold text-accent px-3 py-1 bg-accent/10 rounded-full border border-accent/20">Stats</span>
                  <span className="text-xs uppercase tracking-wider font-semibold text-accent px-3 py-1 bg-accent/10 rounded-full border border-accent/20">Predictions</span>
                </div>
              </div>
            </GlowCard>
          </div>
        </div>
      </section>
    </div>
  );
}
