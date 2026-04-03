"use client";

import { deleteTeamAction } from "@/app/actions/events";
import { AdminDataTable } from "@/components/admin/AdminDataTable";

type SportOption = {
  id: string;
  name: string;
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

export function AdminTeamsDashboard({
  teams,
}: {
  sports: SportOption[];
  teams: TeamRow[];
}) {
  return (
    <div className="space-y-8">
      <AdminDataTable
        title="Teams Registry"
        rows={teams}
        searchPlaceholder="Search teams..."
        searchKeys={["name", "sport_name", "short_code", "city", "coach_name"]}
        filters={[
          {
            key: "sport_name",
            label: "Sport",
            options: Array.from(new Set(teams.map((team) => team.sport_name))).map((value) => ({ label: value, value })),
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
    </div>
  );
}
