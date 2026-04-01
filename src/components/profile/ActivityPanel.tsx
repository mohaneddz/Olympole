"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Sparkles, Trophy } from "lucide-react";

type PredictionItem = {
  id: string;
  matchLabel: string;
  picked: string;
  outcome: string;
  points: number;
  createdAt: string;
};

type RegistrationItem = {
  id: string;
  title: string;
  startsAt: string;
  venue: string;
  status: string;
};

type ActivityPanelProps = {
  predictions: PredictionItem[];
  registrations: RegistrationItem[];
};

export function ActivityPanel({ predictions, registrations }: ActivityPanelProps) {
  const [activeTab, setActiveTab] = useState<"predictions" | "registrations">("predictions");
  const totalPoints = useMemo(
    () => predictions.reduce((sum, prediction) => sum + (prediction.points ?? 0), 0),
    [predictions]
  );

  return (
    <div className="flex h-full flex-col rounded-3xl border border-cyan-300/20 bg-[linear-gradient(130deg,rgba(4,17,50,0.82),rgba(3,10,32,0.92))] p-6 shadow-[0_0_0_1px_rgba(34,211,238,0.12)]">
      <h2 className="flex items-center gap-2 text-3xl font-black text-white">
        <Sparkles className="h-6 w-6 text-violet-300" />
        Activity
      </h2>

      <div className="mt-5 inline-flex w-fit rounded-full border border-cyan-300/20 bg-background/40 p-1 text-sm">
        <button
          type="button"
          onClick={() => setActiveTab("predictions")}
          className={`rounded-full px-4 py-1.5 font-semibold transition-colors ${
            activeTab === "predictions" ? "bg-cyan-300/20 text-cyan-100" : "text-cyan-100/65"
          }`}
        >
          Predictions
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("registrations")}
          className={`rounded-full px-4 py-1.5 font-semibold transition-colors ${
            activeTab === "registrations" ? "bg-cyan-300/20 text-cyan-100" : "text-cyan-100/65"
          }`}
        >
          Registrations
        </button>
      </div>

      {activeTab === "predictions" ? (
        <>
          <div className="mt-5 border-t border-cyan-300/20 pt-5">
            <h3 className="text-2xl font-bold text-white">Your Prediction History</h3>
            <p className="mt-1 text-cyan-100/70">
              {predictions.length} predictions • {totalPoints} pts
            </p>
          </div>
          <div className="mt-5 flex-1 space-y-3">
            {predictions.length === 0 ? (
              <div className="rounded-2xl border border-cyan-300/20 bg-background/35 p-4 text-cyan-100/70">
                No predictions yet.
              </div>
            ) : (
              predictions.slice(0, 4).map((prediction) => (
                <div key={prediction.id} className="rounded-2xl border border-cyan-300/20 bg-background/35 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-white">{prediction.matchLabel}</p>
                    <span className="rounded-full border border-amber-300/45 px-2 py-0.5 text-xs uppercase text-amber-300">
                      {prediction.outcome}
                    </span>
                  </div>
                  <p className="mt-2 text-cyan-100/80">
                    Your Pick: <span className="font-semibold text-white">{prediction.picked}</span>
                  </p>
                  <p className="mt-1 text-sm text-cyan-100/65">
                    Picked on {new Date(prediction.createdAt).toLocaleDateString()}
                  </p>
                  <p className="mt-2 text-right text-2xl font-bold text-white">{prediction.points} pts</p>
                </div>
              ))
            )}
          </div>
          <Link href="/predictions" className="mt-4 inline-flex items-center gap-2 text-base font-semibold text-cyan-300 hover:text-cyan-200">
            View All Predictions
            <span aria-hidden>→</span>
          </Link>
        </>
      ) : (
        <>
          <div className="mt-5 border-t border-cyan-300/20 pt-5">
            <h3 className="flex items-center gap-2 text-2xl font-bold text-white">
              <Trophy className="h-5 w-5 text-violet-300" />
              Your Registrations
            </h3>
            <p className="mt-1 text-cyan-100/70">{registrations.length} registrations</p>
          </div>
          <div className="mt-5 flex-1">
            {registrations.length === 0 ? (
              <>
                <p className="text-xl text-white/95">No registrations yet.</p>
                <p className="mt-1 text-cyan-100/70">Browse events and register to get started.</p>
                <Link href="/schedule" className="mt-4 inline-flex items-center gap-2 text-base font-semibold text-cyan-300 hover:text-cyan-200">
                  Explore Events
                  <span aria-hidden>→</span>
                </Link>
              </>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {registrations.slice(0, 6).map((registration) => (
                  <div key={registration.id} className="rounded-2xl border border-cyan-300/20 bg-background/35 p-4">
                    <p className="font-semibold text-white">{registration.title}</p>
                    <p className="mt-1 text-sm text-cyan-100/70">
                      {registration.startsAt} • {registration.venue}
                    </p>
                    <p className="mt-2 text-xs uppercase text-cyan-100/65">{registration.status}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
