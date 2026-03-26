import { GlowCard } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const standings = [
  { rank: 1, team: "USA", gold: 12, silver: 8, bronze: 5, total: 25 },
  { rank: 2, team: "Japan", gold: 9, silver: 10, bronze: 4, total: 23 },
  { rank: 3, team: "France", gold: 7, silver: 5, bronze: 8, total: 20 },
  { rank: 4, team: "Germany", gold: 5, silver: 6, bronze: 6, total: 17 },
  { rank: 5, team: "Brazil", gold: 4, silver: 3, bronze: 7, total: 14 },
];

export default function ResultsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-7xl flex flex-col gap-12 flex-1">
      <div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-400 glow-text-cyan">
          Official Results
        </h1>
        <p className="text-lg text-foreground/70 max-w-2xl">
          Complete medal tallies, tournament brackets, and final standings.
        </p>
      </div>

      <div className="flex gap-4 border-b border-card-border pb-px overflow-x-auto">
        <button className="px-6 py-3 font-bold text-primary border-b-2 border-primary bg-primary/5 uppercase tracking-wider text-sm whitespace-nowrap">Medal Tally</button>
        <button className="px-6 py-3 font-bold text-foreground/60 hover:text-foreground hover:bg-white/5 uppercase tracking-wider text-sm whitespace-nowrap">Sports Brackets</button>
        <button className="px-6 py-3 font-bold text-foreground/60 hover:text-foreground hover:bg-white/5 uppercase tracking-wider text-sm whitespace-nowrap">Culture Awards</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
           <GlowCard glowColor="cyan" className="p-0 overflow-hidden">
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-card-bg border-b border-card-border">
                      <th className="p-4 font-bold text-foreground/60">Rank</th>
                      <th className="p-4 font-bold text-foreground/60">Delegation</th>
                      <th className="p-4 font-bold text-center text-yellow-500">Gold</th>
                      <th className="p-4 font-bold text-center text-gray-400">Silver</th>
                      <th className="p-4 font-bold text-center text-amber-700">Bronze</th>
                      <th className="p-4 font-bold text-center text-primary">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-border bg-background/50">
                    {standings.map((team) => (
                      <tr key={team.rank} className="hover:bg-primary/5 transition-colors">
                        <td className="p-4 font-mono font-bold">{team.rank}</td>
                        <td className="p-4 font-bold flex items-center gap-3">
                          <span className="w-6 h-4 bg-gray-700 flex-shrink-0"></span> {team.team}
                        </td>
                        <td className="p-4 text-center font-mono font-bold">{team.gold}</td>
                        <td className="p-4 text-center font-mono font-bold">{team.silver}</td>
                        <td className="p-4 text-center font-mono font-bold">{team.bronze}</td>
                        <td className="p-4 text-center font-mono font-bold text-primary">{team.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
           </GlowCard>
        </div>

        <div className="flex flex-col gap-6">
           <div className="p-6 glass-card rounded-xl border border-primary/20">
             <h3 className="text-xl font-bold mb-4">Latest Medals</h3>
             <ul className="space-y-4">
               <li className="flex gap-4 items-center">
                 <div className="w-10 h-10 rounded-full bg-yellow-500/20 border border-yellow-500 flex items-center justify-center font-bold text-yellow-500 flex-shrink-0">1</div>
                 <div>
                   <p className="font-bold text-sm">Elena Rostova</p>
                   <p className="text-xs text-foreground/60">Cyber-Athletics 100m</p>
                 </div>
               </li>
               <li className="flex gap-4 items-center">
                 <div className="w-10 h-10 rounded-full bg-gray-400/20 border border-gray-400 flex items-center justify-center font-bold text-gray-300 flex-shrink-0">2</div>
                 <div>
                   <p className="font-bold text-sm">Marcus Chen</p>
                   <p className="text-xs text-foreground/60">Cyber-Athletics 100m</p>
                 </div>
               </li>
             </ul>
           </div>
        </div>
      </div>
    </div>
  );
}
