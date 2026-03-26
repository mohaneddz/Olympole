import { GlowCard } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const entries = [
  { title: "Ghosts in the Machine Learning", author: "Sylvia Vance", snippet: "When the algorithm dreamed, it didn't dream of electric sheep. It dreamed of us.", votes: 4500 },
  { title: "Neon Rain over Neo-Paris", author: "Jean-Luc Data", snippet: "The drops fell like static on the augmented display, shorting out his visual cortex just long enough to see reality.", votes: 4120 },
  { title: "The Last Analog Clock", author: "Marcus Time", snippet: "Tick. It was a sound no one under twenty had ever heard outside of a museum audio tour.", votes: 3890 },
];

export default function WritingContestPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-7xl flex flex-col gap-12 flex-1">
      <div className="max-w-3xl">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-indigo-400">
          Writing Contest
        </h1>
        <p className="text-xl text-foreground/70 mb-8 font-serif">
          \"Words are the original code.\" Explore the finest literary creations of the cyber-era, submitted by minds across the globe.
        </p>
        <div className="flex gap-4">
          <Button variant="default" className="px-8 bg-indigo-500 text-white hover:bg-indigo-600 border-none glow-border-purple">
            Submit Manuscript
          </Button>
          <Button variant="outline" className="px-8 border-indigo-500/50 hover:border-indigo-500 text-indigo-400">
            Read Rules
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-8">
        <div className="lg:col-span-8 flex flex-col gap-8">
          <h2 className="text-2xl font-bold border-b border-card-border pb-4 w-full">Featured Entries</h2>
          
          {entries.map((entry, i) => (
            <GlowCard key={i} glowColor="purple" className="p-8 font-serif flex flex-col border-indigo-500/20 hover:border-indigo-500/50">
               <h3 className="text-3xl font-bold mb-2 text-foreground">{entry.title}</h3>
               <p className="text-indigo-400 font-sans text-sm uppercase tracking-wider mb-6">By {entry.author}</p>
               <blockquote className="text-xl text-foreground/80 italic border-l-4 border-indigo-500 pl-6 mb-8 py-2">
                 "{entry.snippet}"
               </blockquote>
               <div className="flex justify-between items-center mt-auto">
                 <span className="text-foreground/50 font-sans text-sm"><strong className="text-indigo-300">{entry.votes.toLocaleString()}</strong> Commendations</span>
                 <Button variant="ghost" className="text-indigo-400 font-sans">Read Full Entry</Button>
               </div>
            </GlowCard>
          ))}
        </div>

        <div className="lg:col-span-4">
          <div className="p-6 glass-card border border-indigo-500/30 rounded-xl sticky top-24">
            <h3 className="text-xl font-bold mb-6 text-indigo-400">Themes for 2026</h3>
            <ul className="space-y-4">
              <li className="p-4 bg-background rounded border border-card-border">
                <h4 className="font-bold text-foreground mb-1">1. The Human Algorithm</h4>
                <p className="text-sm text-foreground/60">Exploring organic spontaneity in a perfectly modeled world.</p>
              </li>
              <li className="p-4 bg-background rounded border border-card-border">
                <h4 className="font-bold text-foreground mb-1">2. Digital Archaeology</h4>
                <p className="text-sm text-foreground/60">Uncovering the lost web of the 2000s.</p>
              </li>
              <li className="p-4 bg-background rounded border border-card-border">
                <h4 className="font-bold text-foreground mb-1">3. Neon Fatigue</h4>
                <p className="text-sm text-foreground/60">The emotional toll of constant connection.</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
