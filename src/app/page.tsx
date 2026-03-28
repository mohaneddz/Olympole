import { HeroSection } from "@/components/home/HeroSection";
import { AboutSection } from "@/components/home/AboutSection";
import { ActivitiesSection } from "@/components/home/ActivitiesSection";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 w-full">
      <HeroSection />
      <AboutSection />
      <ActivitiesSection />
    </div>
  );
}
