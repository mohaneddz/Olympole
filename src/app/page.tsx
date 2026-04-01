import { HeroSection } from "@/components/home/HeroSection";
import { AboutSection } from "@/components/home/AboutSection";
import { ActivitiesSection } from "@/components/home/ActivitiesSection";

export default function Home() {
  return (
    <div className="landing-page flex w-full flex-1 flex-col">
      <HeroSection />
      <AboutSection />
      <ActivitiesSection />
    </div>
  );
}
