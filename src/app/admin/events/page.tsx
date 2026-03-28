import {
  createEventAction,
  createMatchAction,
  createResultAction,
  deleteEventAction,
  scoreMatchPredictionsAction,
  updateMatchAction,
} from "@/app/actions/events";
import { moderateWritingAction } from "@/app/actions/writing";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminEventsPage() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const [{ data: events }, { data: matches }, { data: writings }, { data: sports }, { data: teams }] =
    await Promise.all([
      supabase.from("events").select("*").order("starts_at", { ascending: true }),
      supabase.from("matches").select("*").order("starts_at", { ascending: true }),
      supabase
        .from("writing_submissions")
        .select("id,title,status,is_featured")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase.from("sports").select("id,name,slug").order("name", { ascending: true }),
      supabase.from("teams").select("id,name,sport_id").order("name", { ascending: true }),
    ]);

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-bold">Event Operations</h1>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form action={createEventAction} className="p-4 rounded-xl border border-card-border space-y-3">
          <h2 className="font-bold">Create Event</h2>
          <input name="title" placeholder="Title" required className="w-full h-10 px-3 rounded bg-background border border-card-border" />
          <input name="slug" placeholder="slug-name" required className="w-full h-10 px-3 rounded bg-background border border-card-border" />
          <select name="type" className="w-full h-10 px-3 rounded bg-background border border-card-border">
            <option value="sport">sport</option>
            <option value="culture">culture</option>
            <option value="ceremony">ceremony</option>
            <option value="mini_game">mini_game</option>
          </select>
          <select name="sport_id" className="w-full h-10 px-3 rounded bg-background border border-card-border">
            <option value="">No linked sport</option>
            {(sports ?? []).map((sport) => (
              <option key={sport.id} value={sport.id}>
                {sport.name}
              </option>
            ))}
          </select>
          <input name="category" placeholder="Category" required className="w-full h-10 px-3 rounded bg-background border border-card-border" />
          <input name="venue" placeholder="Venue" required className="w-full h-10 px-3 rounded bg-background border border-card-border" />
          <input name="starts_at" type="datetime-local" required className="w-full h-10 px-3 rounded bg-background border border-card-border" />
          <input name="ends_at" type="datetime-local" required className="w-full h-10 px-3 rounded bg-background border border-card-border" />
          <input name="registration_deadline" type="datetime-local" className="w-full h-10 px-3 rounded bg-background border border-card-border" />
          <input name="max_participants" type="number" min="1" placeholder="Max participants" className="w-full h-10 px-3 rounded bg-background border border-card-border" />
          <select name="status" className="w-full h-10 px-3 rounded bg-background border border-card-border">
            <option value="draft">draft</option>
            <option value="scheduled">scheduled</option>
            <option value="live">live</option>
            <option value="completed">completed</option>
            <option value="cancelled">cancelled</option>
          </select>
          <select name="visibility" defaultValue="public" className="w-full h-10 px-3 rounded bg-background border border-card-border">
            <option value="public">public</option>
            <option value="private">private</option>
          </select>
          <div className="grid grid-cols-2 gap-3">
            <select name="is_registration_open" defaultValue="true" className="h-10 px-3 rounded bg-background border border-card-border">
              <option value="true">registration open</option>
              <option value="false">registration closed</option>
            </select>
            <select name="is_featured" defaultValue="false" className="h-10 px-3 rounded bg-background border border-card-border">
              <option value="false">not featured</option>
              <option value="true">featured</option>
            </select>
          </div>
          <input name="current_round" placeholder="Current round (optional)" className="w-full h-10 px-3 rounded bg-background border border-card-border" />
          <textarea name="description" placeholder="Description" className="w-full min-h-20 px-3 py-2 rounded bg-background border border-card-border" />
          <button className="px-4 py-2 rounded border border-primary/50">Create Event</button>
        </form>

        <form action={createMatchAction} className="p-4 rounded-xl border border-card-border space-y-3">
          <h2 className="font-bold">Create Match</h2>
          <select name="event_id" className="w-full h-10 px-3 rounded bg-background border border-card-border" required>
            <option value="">Select event</option>
            {(events ?? []).map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
          <input name="sport" placeholder="Sport label" required className="w-full h-10 px-3 rounded bg-background border border-card-border" />
          <input name="team_a" placeholder="Team A" required className="w-full h-10 px-3 rounded bg-background border border-card-border" />
          <select name="team_a_id" className="w-full h-10 px-3 rounded bg-background border border-card-border">
            <option value="">No linked team A</option>
            {(teams ?? []).map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
          <input name="team_b" placeholder="Team B" required className="w-full h-10 px-3 rounded bg-background border border-card-border" />
          <select name="team_b_id" className="w-full h-10 px-3 rounded bg-background border border-card-border">
            <option value="">No linked team B</option>
            {(teams ?? []).map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
          <input name="score_a" type="number" defaultValue="0" className="w-full h-10 px-3 rounded bg-background border border-card-border" />
          <input name="score_b" type="number" defaultValue="0" className="w-full h-10 px-3 rounded bg-background border border-card-border" />
          <select name="status" className="w-full h-10 px-3 rounded bg-background border border-card-border">
            <option value="scheduled">scheduled</option>
            <option value="live">live</option>
            <option value="completed">completed</option>
          </select>
          <input name="round" placeholder="Round" required className="w-full h-10 px-3 rounded bg-background border border-card-border" />
          <input name="event_phase" placeholder="Event phase (group, knockout...)" className="w-full h-10 px-3 rounded bg-background border border-card-border" />
          <input name="venue" placeholder="Venue" required className="w-full h-10 px-3 rounded bg-background border border-card-border" />
          <input name="starts_at" type="datetime-local" required className="w-full h-10 px-3 rounded bg-background border border-card-border" />
          <input name="mvp_player" placeholder="MVP player (optional)" className="w-full h-10 px-3 rounded bg-background border border-card-border" />
          <input name="live_minute" type="number" min="0" placeholder="Live minute (optional)" className="w-full h-10 px-3 rounded bg-background border border-card-border" />
          <select name="is_prediction_locked" defaultValue="false" className="w-full h-10 px-3 rounded bg-background border border-card-border">
            <option value="false">predictions unlocked</option>
            <option value="true">predictions locked</option>
          </select>
          <textarea name="notes" placeholder="Notes" className="w-full min-h-16 px-3 py-2 rounded bg-background border border-card-border" />
          <button className="px-4 py-2 rounded border border-primary/50">Create Match</button>
        </form>

        <form action={createResultAction} className="p-4 rounded-xl border border-card-border space-y-3">
          <h2 className="font-bold">Create Result</h2>
          <select name="event_id" className="w-full h-10 px-3 rounded bg-background border border-card-border" required>
            <option value="">Select event</option>
            {(events ?? []).map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
          <input name="participant_or_team_name" placeholder="Participant or Team" required className="w-full h-10 px-3 rounded bg-background border border-card-border" />
          <input name="placement" type="number" min="1" required className="w-full h-10 px-3 rounded bg-background border border-card-border" />
          <select name="medal" className="w-full h-10 px-3 rounded bg-background border border-card-border">
            <option value="gold">gold</option>
            <option value="silver">silver</option>
            <option value="bronze">bronze</option>
            <option value="none">none</option>
          </select>
          <input name="score_summary" placeholder="Summary" className="w-full h-10 px-3 rounded bg-background border border-card-border" />
          <button className="px-4 py-2 rounded border border-primary/50">Create Result</button>
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Events</h2>
        <div className="space-y-3">
          {(events ?? []).map((event) => (
            <div key={event.id} className="p-4 rounded-xl border border-card-border flex flex-wrap gap-4 items-center justify-between">
              <div>
                <p className="font-semibold">{event.title}</p>
                <p className="text-sm text-foreground/60">
                  {event.status} • {event.venue} • visibility: {event.visibility}
                </p>
              </div>
              <form action={deleteEventAction}>
                <input type="hidden" name="id" value={event.id} />
                <button className="px-3 py-1 rounded border border-red-500/50 text-red-400">Delete</button>
              </form>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Matches</h2>
        <div className="space-y-3">
          {(matches ?? []).map((match) => (
            <form key={match.id} action={updateMatchAction} className="p-4 rounded-xl border border-card-border grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              <input type="hidden" name="id" value={match.id} />
              <input type="hidden" name="match_id" value={match.id} />
              <input type="hidden" name="event_id" value={match.event_id} />
              <input type="hidden" name="sport" value={match.sport} />
              <input type="hidden" name="team_a" value={match.team_a} />
              <input type="hidden" name="team_b" value={match.team_b} />
              <input type="hidden" name="team_a_id" value={match.team_a_id ?? ""} />
              <input type="hidden" name="team_b_id" value={match.team_b_id ?? ""} />
              <input type="hidden" name="round" value={match.round} />
              <input type="hidden" name="venue" value={match.venue} />
              <input type="hidden" name="starts_at" value={new Date(match.starts_at).toISOString()} />
              <input type="hidden" name="event_phase" value={match.event_phase ?? "group"} />
              <input type="hidden" name="notes" value={match.notes ?? ""} />
              <p className="md:col-span-3">{match.team_a} vs {match.team_b}</p>
              <input name="score_a" type="number" defaultValue={match.score_a} className="md:col-span-1 h-10 px-2 rounded bg-background border border-card-border" />
              <input name="score_b" type="number" defaultValue={match.score_b} className="md:col-span-1 h-10 px-2 rounded bg-background border border-card-border" />
              <select name="status" defaultValue={match.status} className="md:col-span-2 h-10 px-2 rounded bg-background border border-card-border">
                <option value="scheduled">scheduled</option>
                <option value="live">live</option>
                <option value="completed">completed</option>
              </select>
              <input name="mvp_player" defaultValue={match.mvp_player ?? ""} placeholder="MVP" className="md:col-span-2 h-10 px-2 rounded bg-background border border-card-border" />
              <select name="is_prediction_locked" defaultValue={String(match.is_prediction_locked)} className="md:col-span-1 h-10 px-2 rounded bg-background border border-card-border">
                <option value="false">open</option>
                <option value="true">locked</option>
              </select>
              <button className="md:col-span-1 px-3 py-2 rounded border border-primary/50">Save</button>
              <button formAction={scoreMatchPredictionsAction} className="md:col-span-2 px-3 py-2 rounded border border-secondary/50">
                Score Picks
              </button>
            </form>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Writing Moderation</h2>
        <div className="space-y-3">
          {(writings ?? []).map((writing) => (
            <form key={writing.id} action={moderateWritingAction} className="p-4 rounded-xl border border-card-border flex flex-wrap gap-3 items-center">
              <input type="hidden" name="id" value={writing.id} />
              <p className="flex-1 min-w-64">{writing.title}</p>
              <select name="status" defaultValue={writing.status} className="h-10 px-2 rounded bg-background border border-card-border">
                <option value="draft">draft</option>
                <option value="published">published</option>
                <option value="rejected">rejected</option>
              </select>
              <select name="is_featured" defaultValue={String(writing.is_featured)} className="h-10 px-2 rounded bg-background border border-card-border">
                <option value="false">Not featured</option>
                <option value="true">Featured</option>
              </select>
              <button className="px-3 py-2 rounded border border-primary/50">Apply</button>
            </form>
          ))}
        </div>
      </section>
    </div>
  );
}
