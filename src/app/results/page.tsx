import { getPublicResults } from "@/lib/queries";

export default async function ResultsPage() {
  const results = await getPublicResults();

  return (
    <div className="container mx-auto px-4 py-16 max-w-7xl flex flex-col gap-8 flex-1">
      <div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-400 glow-text-cyan">
          Official Results
        </h1>
        <p className="text-lg text-foreground/70 max-w-2xl">Published results are synced from admin operations.</p>
      </div>

      {results.length === 0 ? (
        <div className="glass-card rounded-xl p-8 border border-card-border text-foreground/70">No published results yet.</div>
      ) : (
        <div className="overflow-x-auto glass-card rounded-xl border border-card-border">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-card-border text-foreground/60">
                <th className="p-4">Event</th>
                <th className="p-4">Participant/Team</th>
                <th className="p-4">Placement</th>
                <th className="p-4">Medal</th>
                <th className="p-4">Summary</th>
              </tr>
            </thead>
            <tbody>
              {results.map((row) => (
                <tr key={row.id} className="border-b border-card-border/50">
                  <td className="p-4">
                    {(() => {
                      const event = row.events as { title?: string } | Array<{ title?: string }> | null;
                      return (Array.isArray(event) ? event[0]?.title : event?.title) ?? "-";
                    })()}
                  </td>
                  <td className="p-4">{row.participant_or_team_name}</td>
                  <td className="p-4">#{row.placement}</td>
                  <td className="p-4">{row.medal ?? "-"}</td>
                  <td className="p-4">{row.score_summary ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
