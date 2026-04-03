"use client";

import {
  createSportAction,
  createTeamAction,
  deleteSportAction,
  deleteTeamAction,
} from "@/app/actions/events";
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

export function AdminSportsCatalogDashboard({
  sports,
  teams,
}: {
  sports: SportRow[];
  teams: TeamRow[];
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
    </div>
  );
}
