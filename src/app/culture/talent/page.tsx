import { Button } from "@/components/ui/Button";

const contestants = [
    { name: "Unit-7", act: "Drone Synchronization Dance", score: 9.8, status: "Finalist" },
    { name: "Aria Glow", act: "Acoustic Synthesia", score: 9.5, status: "Finalist" },
    { name: "The Grid", act: "Holographic Breakdance", score: 9.2, status: "Semi-Finalist" },
];

export default function TalentShowPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-7xl flex flex-col gap-12 flex-1 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/10 rounded-full blur-[150px] mix-blend-screen pointer-events-none -z-10" />

            <div className="text-center relative z-10">
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-primary glow-text-cyan">
                    Cyber-Talent Show
                </h1>
                <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
                    The main stage is live. Watch the world&apos;s most spectacular performances merging human skill with next-gen technology.
                </p>
            </div>

            <div className="mt-8 rounded-2xl overflow-hidden glass-card border-primary/50 flex flex-col items-center justify-center min-h-[500px] relative">
                <div className="absolute inset-0 bg-black/60 z-10 flex flex-col items-center justify-center">
                    <span className="text-primary font-bold tracking-widest uppercase mb-4 animate-pulse">Live Broadcast</span>
                    <Button variant="glow" size="lg" className="px-12 h-16 text-xl rounded-full">Enter Virtual Arena</Button>
                </div>
                <div className="w-full h-full bg-gradient-to-br from-blue-900 to-black relative">
                    <div className="absolute top-0 left-[20%] w-32 h-[150%] bg-primary/20 blur-3xl transform -rotate-45 origin-top"></div>
                    <div className="absolute top-0 right-[20%] w-32 h-[150%] bg-secondary/20 blur-3xl transform rotate-45 origin-top"></div>
                </div>
            </div>

            <div>
                <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                    <span className="w-2 h-8 rounded-full bg-primary glow-border-cyan"></span>
                    Top Performers
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {contestants.map((c, i) => (
                        <div key={i} className="glass-card rounded-xl p-6 border-b-4 border-primary">
                            <div className="flex justify-between items-start mb-6">
                                <span className="px-3 py-1 bg-primary/10 text-primary font-bold text-xs uppercase rounded-full">{c.status}</span>
                                <span className="text-2xl font-mono font-bold text-white glow-text-cyan">{c.score}</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-2">{c.name}</h3>
                            <p className="text-foreground/60 mb-6">{c.act}</p>
                            <Button variant="outline" className="w-full border-primary/30 hover:border-primary">Vote via Portal</Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
