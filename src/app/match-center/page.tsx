import { GlowCard } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const liveMatches = [
    { id: 1, sport: "Cyber-Soccer", phase: "Live - 2nd Half", team1: "GER", team2: "BRA", score1: 2, score2: 1, timer: "67:23" },
    { id: 2, sport: "Basketball", phase: "Live - Q3", team1: "USA", team2: "ESP", score1: 78, score2: 74, timer: "04:15" },
];

export default function MatchCenter() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-7xl flex flex-col gap-8 flex-1">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2 text-primary glow-text-cyan flex items-center gap-4">
                        <span className="w-4 h-4 rounded-full bg-primary animate-ping"></span>
                        Match Center
                    </h1>
                    <p className="text-lg text-foreground/70">Real-time telemetry and broadcasting.</p>
                </div>
                <div className="hidden md:flex gap-2">
                    <Button variant="outline" className="border-primary/30 text-primary">All Live</Button>
                    <Button variant="ghost">Completed</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Live Match Hero */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <GlowCard glowColor="cyan" className="p-8 border-primary relative overflow-hidden hidden md:block">
                        <div className="absolute inset-0 bg-primary/5 z-0" style={{ backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(0, 240, 255, 0.1) 50%, transparent 100%)' }}></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-12">
                                <span className="px-3 py-1 bg-red-500/20 text-red-400 font-bold uppercase text-xs rounded-full border border-red-500/50 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> {liveMatches[0].phase}
                                </span>
                                <span className="text-sm font-mono text-primary font-bold">{liveMatches[0].sport} • {liveMatches[0].timer}</span>
                            </div>

                            <div className="flex justify-between items-center text-center">
                                <div className="flex flex-col items-center">
                                    <div className="w-24 h-24 rounded-full bg-background border-2 border-primary flex items-center justify-center text-3xl font-bold font-mono shadow-[0_0_20px_rgba(0,240,255,0.5)] mb-4">
                                        {liveMatches[0].team1}
                                    </div>
                                    <h3 className="text-2xl font-bold">Germany</h3>
                                </div>

                                <div className="flex flex-col items-center">
                                    <div className="text-6xl font-black font-mono tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 mb-2">
                                        {liveMatches[0].score1} - {liveMatches[0].score2}
                                    </div>
                                </div>

                                <div className="flex flex-col items-center">
                                    <div className="w-24 h-24 rounded-full bg-background border-2 border-secondary flex items-center justify-center text-3xl font-bold font-mono shadow-[0_0_20px_rgba(189,0,255,0.5)] mb-4">
                                        {liveMatches[0].team2}
                                    </div>
                                    <h3 className="text-2xl font-bold">Brazil</h3>
                                </div>
                            </div>
                        </div>
                    </GlowCard>

                    <h3 className="text-2xl font-bold mt-4">Other Live Events</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {liveMatches.map((match) => (
                            <div key={match.id} className="p-4 glass-card border-card-border hover:border-primary/50 transition-colors flex justify-between items-center rounded-xl cursor-pointer">
                                <div>
                                    <p className="text-xs text-primary mb-2 font-mono">{match.timer} • {match.sport}</p>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex justify-between w-32 font-bold font-mono">
                                            <span>{match.team1}</span>
                                            <span>{match.score1}</span>
                                        </div>
                                        <div className="flex justify-between w-32 font-bold font-mono">
                                            <span>{match.team2}</span>
                                            <span>{match.score2}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className="text-[10px] uppercase text-red-400 font-bold bg-red-400/10 px-2 py-1 rounded">Live</span>
                                    <Button variant="ghost" size="sm" className="h-8">Details</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar / Bracket Preview */}
                <div className="flex flex-col gap-6">
                    <GlowCard glowColor="purple" className="p-6">
                        <h3 className="text-xl font-bold mb-6 border-b border-card-border pb-4">Tournament Bracket</h3>
                        <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-4 before:w-px before:bg-card-border pl-8">
                            <div className="relative">
                                <span className="absolute top-1/2 -left-8 w-4 h-px bg-card-border"></span>
                                <div className="p-3 bg-background border border-card-border rounded-md text-sm font-mono flex justify-between">
                                    <span>USA</span> <span className="text-primary font-bold">3</span>
                                </div>
                                <div className="p-3 bg-background border border-card-border rounded-md text-sm font-mono flex justify-between mt-1">
                                    <span>FRA</span> <span>1</span>
                                </div>
                            </div>
                            <div className="relative mt-6">
                                <span className="absolute top-1/2 -left-8 w-4 h-px bg-card-border"></span>
                                <div className="p-3 bg-background border border-card-border rounded-md text-sm font-mono flex justify-between">
                                    <span>ESP</span> <span className="text-primary font-bold">2</span>
                                </div>
                                <div className="p-3 bg-background border border-card-border rounded-md text-sm font-mono flex justify-between mt-1">
                                    <span>ITA</span> <span>0</span>
                                </div>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full mt-8">Full Brackets</Button>
                    </GlowCard>
                </div>
            </div>
        </div>
    );
}
