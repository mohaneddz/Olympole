import { getPublicEvents } from "@/lib/queries";

export default async function SchedulePage() {
  const events = await getPublicEvents();

  return (
    <div className="container mx-auto px-4 py-16 max-w-7xl flex flex-col gap-8 flex-1">
      <div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 glow-text-cyan">Official Schedule</h1>
        <p className="text-lg text-foreground/70 max-w-2xl">Live schedule sourced from the event operations database.</p>
      </div>

      {events.length === 0 ? (
        <div className="glass-card rounded-xl p-8 border border-card-border text-foreground/70">No scheduled events yet.</div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {events.map((event) => {
            const sport = event.sports as { name?: string } | Array<{ name?: string }> | null;
            const sportName = Array.isArray(sport) ? sport[0]?.name : sport?.name;

            return (
              <div key={event.id} className="glass-card rounded-xl border border-card-border p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold">{event.title}</h3>
                    <p className="text-foreground/60">
                      {event.category} • {sportName ?? "General"} • {event.venue}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs uppercase border border-primary/40 text-primary bg-primary/10">
                    {event.status}
                  </span>
                </div>
                <p className="mt-4 text-sm text-foreground/70">
                  {new Date(event.starts_at).toLocaleString()} to {new Date(event.ends_at).toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
