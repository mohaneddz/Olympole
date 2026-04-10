"use client";

import type { FantasyRegisteredPlayer } from "@/lib/queries";
import { PredictionTeamCanvas } from "@/components/match-center/PredictionTeamCanvas";

export function PredictionsTabbedContent({ availablePlayers }: { availablePlayers: FantasyRegisteredPlayer[] }) {
  return (
    <section id="fantasy" className="space-y-7">
      <PredictionTeamCanvas availablePlayers={availablePlayers} />
    </section>
  );
}
