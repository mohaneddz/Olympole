import { getPublicEvents, getPublicMatches } from "@/lib/queries";
import ScheduleClient from "./ScheduleClient";

export default async function SchedulePage() {
  const events = await getPublicEvents();
  const matches = await getPublicMatches();

  return (
    <div className="flex flex-col flex-1 bg-[#020617] min-h-screen">
      <ScheduleClient matches={matches} events={events} />
    </div>
  );
}
