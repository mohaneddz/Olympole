"use client";

import {
  assignTeamToTournamentAction,
  clearTournamentDistributionAction,
  createTournamentAction,
  deleteTournamentAction,
  randomDistributeTournamentTeamsAction,
  removeTournamentTeamAction,
} from "@/server/tournaments";
import { createSportAction, deleteSportAction } from "@/server/sports";
import { createTeamAction, deleteTeamAction } from "@/server/teams";
import { assignProfileToTeamAction, removeTeamMembershipAction } from "@/server/team-memberships";
import { AdminDataTable } from "@/components/admin/AdminDataTable";

type SportRow = {
  id: string;
  name: string;
  slug: string;
  sport_type: string;
  is_team_based: boolean;
  gender_division: string;
  is_active: boolean;
  created_at: string;
};

type TeamRow = {
  id: string;
  name: string;
  sport_id: string;
  sport_name: string;
  short_code: string | null;
  city: string | null;
  coach_name: string | null;
  is_active: boolean;
  created_at: string;
};

type ProfileOption = {
  id: string;
  label: string;
};

type MembershipRow = {
  id: string;
  team_id: string;
  team_name: string;
  profile_id: string;
  profile_name: string;
  role: string;
  created_at: string;
};

type EventOption = {
  id: string;
  title: string;
};

type TournamentRow = {
  id: string;
  name: string;
  sport_id: string | null;
  sport_name: string;
  event_id: string | null;
  event_title: string;
  format: string;
  status: string;
  starts_at: string | null;
  notes: string | null;
  assignments_count: number;
};

type TournamentAssignmentRow = {
  id: string;
  tournament_id: string;
  tournament_name: string;
  team_id: string;
  team_name: string;
  seed: number | null;
  group_label: string | null;
};

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleString();
}

export function AdminSportsDashboard({
  sports,
  teams,
  profiles,
  memberships,
  tournaments,
  assignments,
  events,
}: {
  sports: SportRow[];
  teams: TeamRow[];
  profiles: ProfileOption[];
  memberships: MembershipRow[];
  tournaments: TournamentRow[];
  assignments: TournamentAssignmentRow[];
  events: EventOption[];
}) {
  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <form action={createSportAction} className="space-y-3 rounded-2xl border border-card-border bg-card-bg/20 p-4">
          <h2 className="text-lg font-bold">Create / Update Sport</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <input name="name" required placeholder="Sport name" className="h-10 rounded border border-card-border bg-background px-3" />
            <input name="slug" required placeholder="sport-slug" className="h-10 rounded border border-card-border bg-background px-3" />
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <select name="sport_type" className="h-10 rounded border border-card-border bg-background px-3">
              <option value="collective">collective</option>
              <option value="individual">individual</option>
              <option value="culture">culture</option>
            </select>
            <select name="is_team_based" defaultValue="false" className="h-10 rounded border border-card-border bg-background px-3">
              <option value="false">solo</option>
              <option value="true">team based</option>
            </select>
            <input name="gender_division" placeholder="mixed / men_women" className="h-10 rounded border border-card-border bg-background px-3" />
          </div>
          <textarea name="description" placeholder="Description" className="min-h-20 w-full rounded border border-card-border bg-background px-3 py-2" />
          <button className="rounded-lg border border-primary/60 px-3 py-2 text-sm">Save Sport</button>
        </form>

        <form action={createTeamAction} className="space-y-3 rounded-2xl border border-card-border bg-card-bg/20 p-4">
          <h2 className="text-lg font-bold">Create / Update Team</h2>
          <select name="sport_id" required className="h-10 w-full rounded border border-card-border bg-background px-3">
            <option value="">Select sport</option>
            {sports.map((sport) => (
              <option key={sport.id} value={sport.id}>
                {sport.name}
              </option>
            ))}
          </select>
          <input name="name" required placeholder="Team name" className="h-10 w-full rounded border border-card-border bg-background px-3" />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <input name="short_code" placeholder="Code" className="h-10 rounded border border-card-border bg-background px-3" />
            <input name="city" placeholder="City" className="h-10 rounded border border-card-border bg-background px-3" />
            <input name="coach_name" placeholder="Coach name" className="h-10 rounded border border-card-border bg-background px-3" />
          </div>
          <button className="rounded-lg border border-primary/60 px-3 py-2 text-sm">Save Team</button>
        </form>
      </section>

      <AdminDataTable
        title="Sports Catalog"
        rows={sports}
        searchPlaceholder="Search sports..."
        searchKeys={["name", "slug", "sport_type"]}
        filters={[
          {
            key: "sport_type",
            label: "Type",
            options: [
              { label: "Collective", value: "collective" },
              { label: "Individual", value: "individual" },
              { label: "Culture", value: "culture" },
            ],
          },
        ]}
        columns={[
          { key: "name", label: "Name", sortable: true },
          { key: "slug", label: "Slug", sortable: true },
          { key: "sport_type", label: "Type", sortable: true },
          {
            key: "is_team_based",
            label: "Team Based",
            sortable: true,
            render: (row) => (row.is_team_based ? "yes" : "no"),
          },
          { key: "gender_division", label: "Division", sortable: true },
          {
            key: "is_active",
            label: "Status",
            sortable: true,
            render: (row) => (row.is_active ? "active" : "inactive"),
          },
        ]}
        renderActions={(row) => (
          <form action={deleteSportAction}>
            <input type="hidden" name="id" value={row.id} />
            <button className="rounded-lg border border-red-500/60 px-2 py-1 text-xs text-red-300">Delete</button>
          </form>
        )}
      />

      <AdminDataTable
        title="Teams"
        rows={teams}
        searchPlaceholder="Search teams..."
        searchKeys={["name", "sport_name", "short_code", "city", "coach_name"]}
        filters={[
          {
            key: "sport_name",
            label: "Sport",
            options: Array.from(new Set(teams.map((team) => team.sport_name))).map((value) => ({
              label: value,
              value,
            })),
          },
        ]}
        columns={[
          { key: "name", label: "Team", sortable: true },
          { key: "sport_name", label: "Sport", sortable: true },
          { key: "short_code", label: "Code", sortable: true, render: (row) => row.short_code ?? "-" },
          { key: "city", label: "City", sortable: true, render: (row) => row.city ?? "-" },
          { key: "coach_name", label: "Coach", sortable: true, render: (row) => row.coach_name ?? "-" },
        ]}
        renderActions={(row) => (
          <form action={deleteTeamAction}>
            <input type="hidden" name="id" value={row.id} />
            <button className="rounded-lg border border-red-500/60 px-2 py-1 text-xs text-red-300">Delete</button>
          </form>
        )}
      />

      <section className="rounded-2xl border border-card-border bg-card-bg/20 p-4">
        <h2 className="mb-3 text-lg font-bold">Assign People To Teams</h2>
        <form action={assignProfileToTeamAction} className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <select name="profile_id" required className="h-10 rounded border border-card-border bg-background px-3">
            <option value="">Select person</option>
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.label}
              </option>
            ))}
          </select>
          <select name="team_id" required className="h-10 rounded border border-card-border bg-background px-3">
            <option value="">Select team</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name} ({team.sport_name})
              </option>
            ))}
          </select>
          <input name="role" defaultValue="player" className="h-10 rounded border border-card-border bg-background px-3" />
          <button className="rounded-lg border border-primary/60 px-3 py-2 text-sm">Assign</button>
        </form>
      </section>

      <AdminDataTable
        title="Team Memberships"
        rows={memberships}
        searchPlaceholder="Search memberships..."
        searchKeys={["profile_name", "team_name", "role"]}
        filters={[
          {
            key: "team_name",
            label: "Team",
            options: Array.from(new Set(memberships.map((membership) => membership.team_name))).map((value) => ({
              label: value,
              value,
            })),
          },
        ]}
        columns={[
          { key: "profile_name", label: "Person", sortable: true },
          { key: "team_name", label: "Team", sortable: true },
          { key: "role", label: "Role", sortable: true },
          { key: "created_at", label: "Assigned", sortable: true, render: (row) => formatDate(row.created_at) },
        ]}
        renderActions={(row) => (
          <form action={removeTeamMembershipAction}>
            <input type="hidden" name="membership_id" value={row.id} />
            <button className="rounded-lg border border-red-500/60 px-2 py-1 text-xs text-red-300">Remove</button>
          </form>
        )}
      />

      <section className="rounded-2xl border border-card-border bg-card-bg/20 p-4">
        <h2 className="mb-3 text-lg font-bold">Create Tournament</h2>
        <form action={createTournamentAction} className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <input name="name" required placeholder="Tournament name" className="h-10 rounded border border-card-border bg-background px-3" />
          <select name="sport_id" className="h-10 rounded border border-card-border bg-background px-3">
            <option value="">No linked sport</option>
            {sports.map((sport) => (
              <option key={sport.id} value={sport.id}>
                {sport.name}
              </option>
            ))}
          </select>
          <select name="event_id" className="h-10 rounded border border-card-border bg-background px-3">
            <option value="">No linked event</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
          <select name="format" defaultValue="knockout" className="h-10 rounded border border-card-border bg-background px-3">
            <option value="knockout">knockout</option>
            <option value="group">group</option>
            <option value="league">league</option>
            <option value="hybrid">hybrid</option>
          </select>
          <select name="status" defaultValue="draft" className="h-10 rounded border border-card-border bg-background px-3">
            <option value="draft">draft</option>
            <option value="scheduled">scheduled</option>
            <option value="live">live</option>
            <option value="completed">completed</option>
            <option value="cancelled">cancelled</option>
          </select>
          <input name="starts_at" type="datetime-local" className="h-10 rounded border border-card-border bg-background px-3" />
          <textarea name="notes" placeholder="Notes" className="md:col-span-3 min-h-20 rounded border border-card-border bg-background px-3 py-2" />
          <button className="md:col-span-3 rounded-lg border border-primary/60 px-3 py-2 text-sm">Create Tournament</button>
        </form>
      </section>

      <AdminDataTable
        title="Tournaments"
        rows={tournaments}
        searchPlaceholder="Search tournaments..."
        searchKeys={["name", "sport_name", "event_title", "format", "status"]}
        filters={[
          {
            key: "status",
            label: "Status",
            options: [
              { label: "draft", value: "draft" },
              { label: "scheduled", value: "scheduled" },
              { label: "live", value: "live" },
              { label: "completed", value: "completed" },
              { label: "cancelled", value: "cancelled" },
            ],
          },
        ]}
        columns={[
          { key: "name", label: "Name", sortable: true },
          { key: "sport_name", label: "Sport", sortable: true },
          { key: "event_title", label: "Event", sortable: true },
          { key: "format", label: "Format", sortable: true },
          { key: "status", label: "Status", sortable: true },
          { key: "assignments_count", label: "Assigned Teams", sortable: true },
          { key: "starts_at", label: "Starts", sortable: true, render: (row) => formatDate(row.starts_at) },
        ]}
        renderActions={(row) => (
          <div className="space-y-2">
            <form action={assignTeamToTournamentAction} className="flex items-center gap-2">
              <input type="hidden" name="tournament_id" value={row.id} />
              <select name="team_id" className="h-8 max-w-48 rounded border border-card-border bg-background px-2 text-xs">
                <option value="">Assign team</option>
                {teams
                  .filter((team) => !row.sport_id || team.sport_id === row.sport_id)
                  .map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
              </select>
              <input name="seed" type="number" min="1" placeholder="Seed" className="h-8 w-16 rounded border border-card-border bg-background px-2 text-xs" />
              <button className="rounded border border-card-border px-2 py-1 text-xs">Add</button>
            </form>

            <div className="flex flex-wrap gap-2">
              <form action={randomDistributeTournamentTeamsAction}>
                <input type="hidden" name="tournament_id" value={row.id} />
                <button className="rounded border border-secondary/60 px-2 py-1 text-xs">Random distribute</button>
              </form>
              <form action={clearTournamentDistributionAction}>
                <input type="hidden" name="tournament_id" value={row.id} />
                <button className="rounded border border-card-border px-2 py-1 text-xs">Clear teams</button>
              </form>
              <form action={deleteTournamentAction}>
                <input type="hidden" name="tournament_id" value={row.id} />
                <button className="rounded border border-red-500/60 px-2 py-1 text-xs text-red-300">Delete</button>
              </form>
            </div>
          </div>
        )}
      />

      <AdminDataTable
        title="Tournament Team Assignments"
        rows={assignments}
        searchPlaceholder="Search tournament assignments..."
        searchKeys={["tournament_name", "team_name", "group_label"]}
        columns={[
          { key: "tournament_name", label: "Tournament", sortable: true },
          { key: "team_name", label: "Team", sortable: true },
          { key: "seed", label: "Seed", sortable: true, render: (row) => row.seed ?? "-" },
          { key: "group_label", label: "Group", sortable: true, render: (row) => row.group_label ?? "-" },
        ]}
        renderActions={(row) => (
          <form action={removeTournamentTeamAction}>
            <input type="hidden" name="assignment_id" value={row.id} />
            <button className="rounded-lg border border-red-500/60 px-2 py-1 text-xs text-red-300">Remove</button>
          </form>
        )}
      />
    </div>
  );
}
