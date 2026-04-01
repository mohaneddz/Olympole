"use client";

import Image from "next/image";
import { Button } from "@/components/ui/Button";

export function HeroSection() {
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      // scroll-margin-top is already set on sections, so we can use smooth scroll directly
      element.scrollIntoView({ behavior: "smooth", block: "start" });

      // Update URL hash without jumping
      window.history.pushState(null, "", `#${id}`);
    }
  };

  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] w-full flex-col items-center justify-center overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/backgrounds/hero.avif"
          alt="Olympole 2026 Background"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(5,5,15,0.4)_80%,rgba(5,5,15,0.5)_100%)] z-0" />
        <div className="absolute inset-0 bg-background/10 backdrop-blur-[1px]" />
        {/* Cyber lines pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}
        />
      </div>

      <div className="container relative z-10 mx-auto flex w-full flex-col items-center justify-center gap-4 px-4 text-center">

        <Image src="/images/brand/fire.png" height={1024} width={1024} alt="" className="w-80 h-auto mx-auto" />
        <Image src="/images/brand/circles.png" height={1024} width={1024} alt="" className="w-48 h-auto mx-auto mb-6" />

        <h1 className="font-extrabold tracking-tighter mb-6">
          <span className="text-6xl md:text-8xl lg:text-9xl text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
            OLYMPOLE
          </span>
          <br />
          <span className="text-2xl md:text-6xl lg:text-7xl text-transparent bg-clip-text  bg-gradient-to-b from-white to-white/60">
            2026
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-lg md:text-xl text-foreground/80 mb-12 font-medium">
          Enter the Cyber-Stadium. The next generation of athletics, mind sports, and digital culture collide in a spectacular global tournament.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
          <Button variant="hero" size="pill" className="w-[18rem] text-2xl h-16" asChild>
            <a href="#about" onClick={(e) => scrollToSection(e, "about")}>
              About OLYMPOLE
            </a>
          </Button>
          <Button variant="hero" size="pill" className="w-[18rem] text-2xl h-16" asChild>
            <a href="#activities" onClick={(e) => scrollToSection(e, "activities")}>
              Explore Activities
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
