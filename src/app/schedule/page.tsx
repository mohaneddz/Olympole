import type { Metadata } from "next";
import { getPublicEvents, getPublicMatches } from "@/lib/queries";
import ScheduleClient from "./ScheduleClient";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Schedule",
  description: "Explore Olympole event schedules across collective sports, individual sports, and culture.",
  alternates: {
    canonical: "/schedule",
  },
};

export default async function SchedulePage() {
  const [events, matches] = await Promise.all([getPublicEvents(), getPublicMatches()]);

  return (
    <div className="flex flex-col flex-1 bg-[#020617] min-h-screen">
      <ScheduleClient matches={matches} events={events} />
    </div>
  );
}
