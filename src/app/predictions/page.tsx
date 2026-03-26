import { GlowCard } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const predictions = [
    { match: "GER vs BRA", sport: "Cyber-Soccer", pool: "2.4M Credits", time: "Ends in 2h" },
    { match: "USA vs ESP", sport: "Basketball", pool: "1.1M Credits", time: "Ends in 4h" },
    { match: "Tokyo vs Seoul", sport: "e-Athletics", pool: "850K Credits", time: "Ends Tomorrow" },
];

export default function PredictionsPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-7xl flex flex-col gap-8 flex-1">
            <div className="text-center mb-12">
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4 text-secondary glow-text-purple">
                    Prediction Hub
                </h1>
                <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
                    Test your knowledge. Back your teams. Climb the global leaderboard.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-secondary shadow-[0_0_10px_rgba(189,0,255,0.8)]"></span>
                        Featured Predictions
                    </h2>

                    {predictions.map((p, i) => (
                        <GlowCard key={i} glowColor="purple" className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-xs uppercase tracking-wider text-secondary font-semibold bg-secondary/10 px-3 py-1 rounded-full">{p.sport}</span>
                                <span className="text-xs text-foreground/60 font-mono">{p.time}</span>
                            </div>
                            <h3 className="text-3xl font-bold mb-2 font-mono text-center tracking-widest">{p.match}</h3>
                            <p className="text-center text-primary text-sm mb-8">Prize Pool: {p.pool}</p>

                            <div className="grid grid-cols-2 gap-4">
                                <button className="h-14 rounded-md border-2 border-card-border hover:border-secondary transition-all bg-background hover:bg-secondary/10 font-bold text-lg font-mono">
                                    {p.match.split("vs")[0]} (1.5x)
                                </button>
                                <button className="h-14 rounded-md border-2 border-card-border hover:border-primary transition-all bg-background hover:bg-primary/10 font-bold text-lg font-mono">
                                    {p.match.split("vs")[1]} (2.8x)
                                </button>
                            </div>
                        </GlowCard>
                    ))}
                </div>

                <div>
                    <GlowCard glowColor="cyan" className="p-6 sticky top-24">
                        <h3 className="text-xl font-bold mb-6 border-b border-card-border pb-4">Global Leaderboard</h3>
                        <div className="space-y-4">
                            {[
                                { rank: 1, name: "NeonKing", points: "15,420" },
                                { rank: 2, name: "Oracle_99", points: "14,890" },
                                { rank: 3, name: "CypherPulse", points: "14,100" },
                                { rank: 4, name: "NovaBet", points: "13,550" },
                                { rank: 5, name: "ZeroCool", points: "12,900" },
                            ].map((user) => (
                                <div key={user.rank} className="flex items-center justify-between p-3 rounded bg-background border border-card-border">
                                    <div className="flex items-center gap-4">
                                        <span className={`font-mono font-bold ${user.rank === 1 ? 'text-yellow-400' : user.rank === 2 ? 'text-gray-300' : user.rank === 3 ? 'text-amber-600' : 'text-foreground/50'}`}>#{user.rank}</span>
                                        <span className="font-medium">{user.name}</span>
                                    </div>
                                    <span className="text-primary font-mono text-sm">{user.points}</span>
                                </div>
                            ))}
                        </div>
                        <Button variant="ghost" className="w-full mt-6 text-primary">View Full Rankings</Button>
                    </GlowCard>
                </div>
            </div>
        </div>
    );
}
