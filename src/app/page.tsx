import type { Metadata } from "next";
import { HeroSection } from "@/components/home/HeroSection";
import { AboutSection } from "@/components/home/AboutSection";
import { ActivitiesSection } from "@/components/home/ActivitiesSection";

export const metadata: Metadata = {
  title: "Home",
  description: "Olympole 2026 official portal for competitions, schedules, and registrations.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <div className="landing-page flex w-full flex-1 flex-col">
      <HeroSection />
      <AboutSection />
      <ActivitiesSection />
    </div>
  );
}
