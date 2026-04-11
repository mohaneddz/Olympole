"use client";

import {
  assignTeamToTournamentAction,
  clearTournamentDistributionAction,
  deleteTournamentAction,
  randomDistributeTournamentTeamsAction,
  removeTournamentTeamAction,
} from "@/server/tournaments";
import { AdminDataTable } from "@/components/admin/AdminDataTable";

type SportRow = {
  id: string;
  name: string;
};

type TeamRow = {
  id: string;
  name: string;
  sport_id: string;
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

export function AdminSportsTournamentsDashboard({
  teams,
  tournaments,
  assignments,
}: {
  sports: SportRow[];
  teams: TeamRow[];
  tournaments: TournamentRow[];
  assignments: TournamentAssignmentRow[];
  events: EventOption[];
}) {
  return (
    <div className="space-y-8">
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
