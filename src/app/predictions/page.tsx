import { getCurrentUser } from "@/lib/auth";
import {
  getAppSettings,
  getLeaderboard,
  getPublicMatches,
  getUserPredictions,
} from "@/lib/queries";
import { PredictionsBoard } from "@/components/predictions/PredictionsBoard";

type PredictionMatch = {
  id: string;
  sport: string | null;
  round: string | null;
  status: "scheduled" | "live" | "completed";
  team_a: string;
  team_b: string;
  starts_at: string;
  is_prediction_locked: boolean | null;
};

type LeaderboardEntry = {
  name: string;
  points: number;
};

type ExistingPrediction = {
  match_id: string;
  predicted_winner: string;
  predicted_score_a: number;
  predicted_score_b: number;
  predicted_mvp_player: string | null;
  stake_points: number;
};

export default async function PredictionsPage() {
  const [settings, matches, leaderboard, user] = await Promise.all([
    getAppSettings(),
    getPublicMatches(),
    getLeaderboard(),
    getCurrentUser(),
  ]);
  const userPredictions = user ? await getUserPredictions(user.id) : [];

  return (
    <div className="container mx-auto px-4 py-16 max-w-7xl flex flex-col gap-8 flex-1">
      <div className="text-center mb-8">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4 text-white">Prediction Hub</h1>
        <p className="text-lg text-white/70 max-w-2xl mx-auto">
          Tap left or right to pick a winner, then lock your scoreline and MVP in seconds.
        </p>
      </div>

      {!settings.predictions_enabled ? (
        <div className="p-6 rounded-xl border border-yellow-500/40 bg-yellow-500/10 text-yellow-100">Predictions are currently disabled.</div>
      ) : (
        <PredictionsBoard
          matches={matches as PredictionMatch[]}
          leaderboard={leaderboard as LeaderboardEntry[]}
          user={user ? { id: user.id } : null}
          userPredictions={userPredictions as ExistingPrediction[]}
        />
      )}
    </div>
  );
}
