"use client";

import Link from "next/link";
import { 
  Music2, Sparkles, Trophy, Users, UserRound, 
  Gamepad2, Lightbulb, PersonStanding, Blocks, 
  Dribbble, Target, Activity, Rocket, Zap
} from "lucide-react";

type RegistrationItem = {
  id: string;
  title: string;
  activitySlug: string | null;
  statusLabel: string;
  activityType: string;
};

type ActivityPanelProps = {
  registrations: RegistrationItem[];
};

export function ActivityPanel({ registrations }: ActivityPanelProps) {
  function activityTypeLabel(value: string) {
    if (value === "collective_sport") return "Collective Sport";
    if (value === "individual_sport") return "Individual Sport";
    if (value === "culture") return "Culture";
    return "Activity";
  }

  function ActivityIcon({ activityType, activitySlug, title }: { activityType: string, activitySlug: string | null, title: string }) {
    const defaultColor = "h-5 w-5 text-cyan-200/90";
    
    const lowerTitle = (title || "").toLowerCase();
    const slug = (activitySlug || "").toLowerCase();
    
    if (lowerTitle.includes("talent") || slug.includes("talent")) return <Music2 className={defaultColor} />;
    if (lowerTitle.includes("knowledge") || slug.includes("knowledge")) return <Lightbulb className={defaultColor} />;
    if (lowerTitle.includes("chess") || slug.includes("chess")) return <Blocks className={defaultColor} />;
    if (lowerTitle.includes("esport") || lowerTitle.includes("gaming") || slug.includes("gaming") || slug.includes("esport")) return <Gamepad2 className={defaultColor} />;
    if (lowerTitle.includes("basketball") || slug.includes("basketball")) return <Dribbble className={defaultColor} />;
    if (lowerTitle.includes("running") || slug.includes("run")) return <PersonStanding className={defaultColor} />;
    if (lowerTitle.includes("volleyball") || slug.includes("volley")) return <Target className={defaultColor} />;

    if (activityType === "collective_sport") {
      return <Users className={defaultColor} />;
    }
    if (activityType === "individual_sport") {
      return <UserRound className={defaultColor} />;
    }
    if (activityType === "culture") {
      return <Activity className={defaultColor} />;
    }
    return <Trophy className={defaultColor} />;
  }

  return (
    <div className="flex h-full max-h-[42rem] min-h-0 flex-col overflow-hidden rounded-3xl border border-cyan-300/20 bg-[linear-gradient(130deg,rgba(4,17,50,0.82),rgba(3,10,32,0.92))] p-6 shadow-[0_0_0_1px_rgba(34,211,238,0.12)]">
      <h2 className="flex items-center gap-2 text-2xl font-black text-white md:text-3xl">
        <Sparkles className="h-6 w-6 text-violet-300" />
        Registrations
      </h2>


      <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
        {registrations.length === 0 ? (
          <>
            <p className="text-xl text-white/95">No registrations yet.</p>
            <p className="mt-1 text-cyan-100/70">Browse events and register to get started.</p>
            <Link href="/schedule" className="mt-4 inline-flex items-center gap-2 text-base font-semibold text-cyan-300 hover:text-cyan-200">
              Explore Events
              <span aria-hidden>{"->"}</span>
            </Link>
          </>
        ) : (
          <div className="flex flex-col gap-3">
            {registrations.map((registration) => (
              <div key={registration.id} className="w-full rounded-2xl border border-cyan-300/20 bg-background/35 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-white">{registration.title}</p>
                    <p className="mt-1 text-sm text-cyan-100/70">{activityTypeLabel(registration.activityType)}</p>
                    <p className="mt-2 text-xs uppercase text-cyan-100/65">{registration.statusLabel}</p>
                  </div>
                  <ActivityIcon activityType={registration.activityType} activitySlug={registration.activitySlug} title={registration.title} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
