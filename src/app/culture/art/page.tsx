import { GlowCard } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const artworks = [
    { id: 1, title: "Neural Resonance", artist: "0xViolet", img: "bg-gradient-to-br from-purple-500 to-indigo-500" },
    { id: 2, title: "Neon Canopy", artist: "Kaelen", img: "bg-gradient-to-tr from-cyan-400 to-blue-600" },
    { id: 3, title: "Synthetic Soul", artist: "Ghost Protocol", img: "bg-gradient-to-bl from-pink-500 to-rose-500" },
    { id: 4, title: "Data Stream 9", artist: "Ana_Digi", img: "bg-gradient-to-br from-emerald-400 to-teal-600" },
    { id: 5, title: "Holo-Memories", artist: "RetroByte", img: "bg-gradient-to-t from-orange-500 to-amber-500" },
    { id: 6, title: "Void Architecture", artist: "Sigma", img: "bg-[linear-gradient(45deg,rgb(10,10,20),rgb(40,40,60))]" },
];

export default function ArtExhibitionPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-7xl flex flex-col gap-8 flex-1">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-secondary glow-text-purple">
                    Digital Art Exhibition
                </h1>
                <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
                    A curated gallery of the finest generative and hand-crafted digital masterpieces of 2026.
                </p>
            </div>

            <div className="flex justify-center gap-4 mb-8">
                <Button variant="default" className="bg-secondary hover:bg-secondary/80 text-white rounded-full px-6">All Works</Button>
                <Button variant="ghost" className="rounded-full px-6 border border-card-border hover:border-secondary/50">Generative</Button>
                <Button variant="ghost" className="rounded-full px-6 border border-card-border hover:border-secondary/50">Holographic</Button>
                <Button variant="ghost" className="rounded-full px-6 border border-card-border hover:border-secondary/50">VR Experiences</Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {artworks.map((art) => (
                    <GlowCard key={art.id} glowColor="purple" className="overflow-hidden group cursor-pointer">
                        <div className={`w-full h-64 ${art.img} relative`}>
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                                <Button variant="glow" size="sm">View High-Res</Button>
                            </div>
                        </div>
                        <div className="p-6">
                            <h3 className="text-xl font-bold mb-1">{art.title}</h3>
                            <p className="text-secondary text-sm font-medium">by {art.artist}</p>
                        </div>
                    </GlowCard>
                ))}
            </div>
        </div>
    );
}
