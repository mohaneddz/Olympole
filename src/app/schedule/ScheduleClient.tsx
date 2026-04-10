"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, CalendarDays, ChevronRight } from "lucide-react";

type ScheduleClientProps = {
  matches: any[];
  events: any[];
};

type TabType = "Collective Sports" | "Individual Sports" | "Cultural Events";

function formatDateHeader(dateStr: string) {
  const d = new Date(dateStr);
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayName = days[d.getDay()];
  const monthName = months[d.getMonth()];
  const dateNum = d.getDate();
  const suffix =
    dateNum % 10 === 1 && dateNum !== 11
      ? "st"
      : dateNum % 10 === 2 && dateNum !== 12
      ? "nd"
      : dateNum % 10 === 3 && dateNum !== 13
      ? "rd"
      : "th";
  return `${dayName} ${dateNum}${suffix} ${monthName}`;
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const hours = d.getHours();
  const ampm = hours >= 12 ? "pm" : "am";
  let h = hours % 12;
  h = h ? h : 12;
  const m = d.getMinutes();
  return `${h}${m > 0 ? ":" + m.toString().padStart(2, "0") : ""}${ampm}`;
}

// Ensure sports names match ignoring case
function normalize(s: string) {
  return s.trim().toLowerCase();
}

function getSportColor(sportName: string) {
  const name = normalize(sportName);
  if (name.includes("handball")) return "bg-yellow-300 text-yellow-950";
  if (name.includes("basketball")) return "bg-emerald-300 text-emerald-950";
  if (name.includes("volleyball")) return "bg-white text-black";
  if (name.includes("football")) return "bg-blue-300 text-blue-950";
  return "bg-cyan-200 text-cyan-950";
}

export default function ScheduleClient({ matches, events }: ScheduleClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>("Collective Sports");

  // Filter data based on tabs
  const filteredData = useMemo(() => {
    let items: any[] = [];

    if (activeTab === "Collective Sports") {
      const collectiveEvents = events.filter(
        (event) =>
          event.activities?.category === "collective_sport"
          || event.sports?.sport_type === "collective"
      );
      items = [...collectiveEvents];
    } else if (activeTab === "Individual Sports") {
      const indEvents = events.filter(
        (event) =>
          event.activities?.category === "individual_sport"
          || event.sports?.sport_type === "individual"
      );
      items = [...indEvents];
    } else if (activeTab === "Cultural Events") {
      const cultEvents = events.filter(
        (event) =>
          event.activities?.category === "culture"
          || event.type === "culture"
      );
      items = [...cultEvents];
    }

    // Sort items by starts_at
    items.sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());

    // Group by Date
    const grouped: Record<string, any[]> = {};
    for (const item of items) {
      const dateKey = new Date(item.starts_at).toISOString().split("T")[0];
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(item);
    }

    return grouped;
  }, [activeTab, matches, events]);

  const dates = Object.keys(filteredData).sort();

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center overflow-hidden bg-background">
      <section className="relative flex min-h-[60vh] w-full flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/backgrounds/hero.avif"
            alt=""
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 z-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(5,5,15,0.4)_80%,rgba(5,5,15,0.5)_100%)]" />
          <div className="absolute inset-0 bg-background/10 backdrop-blur-[1px]" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="container relative z-10 mx-auto flex flex-col items-center justify-center gap-4 px-4 text-center">
          <Image
            src="/images/brand/fire.png"
            alt=""
            width={292}
            height={362}
            aria-hidden
            className="mb-2 h-auto w-32 animate-fade-in-up md:w-40"
          />
          <Image
            src="/images/brand/circles.png"
            alt=""
            width={243}
            height={134}
            aria-hidden
            className="mb-6 h-auto w-16 animate-fade-in-up md:w-20"
          />
          <h1 className="mb-8 font-heading text-5xl font-black tracking-tight md:text-7xl lg:text-8xl">
            <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
              EVENT SCHEDULES
            </span>
          </h1>
        </div>
      </section>

      <div className="w-full bg-background pt-16">
        <div className="relative z-20 mb-20 flex justify-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-1 rounded-full border-2 border-[#80d4ff] bg-[#1a2238] p-1 shadow-lg">
            {(["Collective Sports", "Individual Sports", "Cultural Events"] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-8 py-2.5 text-sm font-bold tracking-wide transition-colors duration-300 md:px-12 md:py-3 md:text-base ${
                  activeTab === tab ? "bg-[#80d4ff] text-black" : "text-white hover:text-[#80d4ff]/80"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-5xl px-4 pb-10">

          {/* Schedule List */}
          <div className="space-y-12">
            {dates.length === 0 ? (
              <div className="py-12 text-center text-cyan-200/50">
                No scheduled events found for this category.
              </div>
            ) : (
              dates.map((dateStr) => (
                <div key={dateStr} className="space-y-3">
                  {/* Date Header */}
                  <div className="mb-4 inline-block rounded-lg bg-[#eafc4d] px-5 py-2.5 text-sm font-bold text-gray-900 shadow-md">
                    {formatDateHeader(dateStr)}
                  </div>

                  {/* Items for this date */}
                  <div className="flex flex-col gap-2">
                    {filteredData[dateStr].map((item) => {
                      const isMatch = !!item.team_a; // Check if it's a match row
                      const bgClass = "bg-[#181f3a]"; // from design

                      // Left Block: Time & Venue
                      const leftBlock = (
                        <div className="flex min-w-[100px] shrink-0 flex-col justify-center">
                          <span className="text-md font-bold tracking-wide text-white">{formatTime(item.starts_at)}</span>
                          <span className="break-words text-sm font-medium leading-tight text-white">{item.venue}</span>
                        </div>
                      );

                      // For Matches (Collective Sports usually)
                      if (isMatch) {
                        return (
                          <div key={item.id} className={`flex flex-col items-stretch rounded-xl border border-transparent p-4 transition-colors hover:border-cyan-500/20 hover:bg-[#1a2342] md:flex-row md:p-6 ${bgClass}`}>
                            {leftBlock}

                            <div className="mt-4 flex flex-1 flex-col justify-between gap-4 md:mt-0 md:flex-row md:items-center md:pl-8">
                              {/* Teams */}
                              <div className="flex flex-1 items-center gap-6 text-sm font-bold text-white md:text-base">
                                <span className="flex-1 text-right">{item.team_a}</span>
                                <span className="text-xl font-black text-cyan-400">VS</span>
                                <span className="flex-1 text-left">{item.team_b}</span>
                              </div>

                              {/* Right Action / Badge */}
                              <div className="flex min-w-[150px] shrink-0 justify-end">
                                {activeTab === "Collective Sports" && new Date(item.starts_at) > new Date() ? (
                                  <Link
                                    href={`/predictions`}
                                    className="flex items-center justify-center gap-2 rounded-full border border-[#8b91a2] px-5 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
                                  >
                                    Vote for Winner <ChevronRight className="h-3 w-3" />
                                  </Link>
                                ) : (
                                  <span className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider shadow-sm ${getSportColor(item.sport)}`}>
                                    {item.sport}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      }

                      // For Events (Individual & Cultural)
                      const title = item.title || (item.sports && item.sports.name) || item.category || "Event";
                      const endTimeStr = item.ends_at ? formatTime(item.ends_at) : null;

                      return (
                        <div key={item.id} className={`flex flex-col items-center justify-between gap-4 rounded-xl border border-transparent p-4 transition-colors hover:border-cyan-500/20 hover:bg-[#1a2342] md:flex-row md:p-6 ${bgClass}`}>
                          <div className="flex w-full items-center md:w-1/3">
                            <span className="text-base font-bold text-white md:text-lg">{title}</span>
                          </div>

                          <div className="flex w-full items-center justify-start gap-3 text-sm font-bold text-white md:w-1/3 md:justify-center md:text-base">
                            <CalendarDays className="h-5 w-5 text-[#eafc4d]" />
                            <span>{formatTime(item.starts_at)}{endTimeStr ? ` - ${endTimeStr}` : ""}</span>
                          </div>

                          <div className="flex w-full items-center justify-start gap-3 text-sm font-bold text-white md:w-1/3 md:justify-end md:text-base">
                            <MapPin className="h-5 w-5 text-[#eafc4d]" />
                            <span className="truncate">{item.venue}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
