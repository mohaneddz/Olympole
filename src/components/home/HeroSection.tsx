import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden w-full">
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/images/backgrounds/hero.png" 
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

        <Image src="/images/brand/fire.png" height={1024} width={1024} alt="" className="w-80 h-auto mx-auto"/>
        <Image src="/images/brand/circles.png" height={1024} width={1024} alt="" className="w-48 h-auto mx-auto mb-6"/>
        
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
  );
}