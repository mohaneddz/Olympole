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
    <section className="relative flex min-h-[calc(100svh-4rem)] w-full flex-col items-center justify-center overflow-hidden py-10 md:py-12">
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
        <div className="absolute inset-0 opacity-[0.02] md:opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}
        />
      </div>

      <div className="container relative z-10 mx-auto flex w-full flex-col items-center justify-center gap-5 px-4 text-center md:gap-6">

        <Image src="/images/brand/fire.webp" height={1024} width={1024} alt="" className="mx-auto h-auto w-52 md:w-64 lg:w-72" />
        <Image src="/images/brand/circles.webp" height={1024} width={1024} alt="" className="mx-auto mb-3 h-auto w-28 md:mb-4 md:w-36 lg:w-40" />

        <h1 className="mb-4 font-extrabold tracking-tighter md:mb-5">
          <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-5xl text-transparent md:text-7xl lg:text-8xl">
            OLYMPOLE
          </span>
          <br />
          <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-2xl text-transparent md:text-4xl lg:text-5xl">
            2026
          </span>
        </h1>

        <p className="mx-auto mb-7 max-w-xl text-base font-medium text-foreground/80 md:mb-8 md:max-w-2xl md:text-lg">
          Enter the Cyber-Stadium. The next generation of athletics, mind sports, and digital culture collide in a spectacular global tournament.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
          <Button variant="hero" size="pill" className="h-14 w-64 text-lg md:text-xl" asChild>
            <a href="#about" onClick={(e) => scrollToSection(e, "about")}>
              About OLYMPOLE
            </a>
          </Button>
          <Button variant="hero" size="pill" className="h-14 w-64 text-lg md:text-xl" asChild>
            <a href="#activities" onClick={(e) => scrollToSection(e, "activities")}>
              Explore Activities
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
