import Link from "next/link";
import { getPublicEvents, getPublicSports } from "@/lib/queries";
import { Button } from "@/components/ui/Button";

export async function ActivitiesSection() {
  const [sports, events] = await Promise.all([getPublicSports(), getPublicEvents()]);

  const grouped = sports.reduce<Record<string, typeof sports>>((acc, sport) => {
    const key = sport.sport_type;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(sport);
    return acc;
  }, {});

  const featuredEvents = events.filter((event) => event.is_featured).slice(0, 6);

  return (
    <section className="py-24 relative z-10 bg-[linear-gradient(to_bottom,rgb(5,5,15),rgb(2,2,8))] border-t border-card-border overflow-hidden">
      <div className="container relative z-20 mx-auto px-4 max-w-7xl space-y-12">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-cyan-100 to-cyan-400 mb-4">
            Activities
          </h2>
          <p className="text-xl md:text-2xl text-foreground/80 font-medium max-w-2xl">
            Explore registered sports and cultural tracks directly from the event database.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {(["collective", "individual", "culture"] as const).map((category) => (
            <div key={category} className="rounded-xl border border-card-border bg-background/40 p-5 space-y-4">
              <h3 className="text-2xl font-bold capitalize">{category} activities</h3>
              <div className="space-y-2">
                {(grouped[category] ?? []).slice(0, 6).map((sport) => (
                  <div key={sport.id} className="rounded-lg border border-card-border p-3 flex items-center justify-between gap-2">
                    <span>{sport.name}</span>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/register">Enroll</Link>
                    </Button>
                  </div>
                ))}
                {(grouped[category] ?? []).length === 0 ? (
                  <p className="text-sm text-foreground/60">No activities configured yet.</p>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold">Featured Events</h3>
          {featuredEvents.length === 0 ? (
            <p className="text-foreground/70">No featured events right now.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {featuredEvents.map((event) => (
                <article key={event.id} className="rounded-xl border border-card-border p-4 bg-card-bg/20">
                  <p className="font-semibold">{event.title}</p>
                  <p className="text-sm text-foreground/70">{event.venue}</p>
                  <p className="text-sm text-foreground/60">{new Date(event.starts_at).toLocaleString()}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
