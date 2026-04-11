"use client";

import { deleteSportAction } from "@/server/sports";
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

export function AdminSportsOnlyDashboard({ sports }: { sports: SportRow[] }) {
  return (
    <div className="space-y-8">
      <AdminDataTable
        title="Sports Registry"
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
          { key: "is_team_based", label: "Team Based", sortable: true, render: (row) => (row.is_team_based ? "yes" : "no") },
          { key: "gender_division", label: "Division", sortable: true },
          { key: "is_active", label: "Status", sortable: true, render: (row) => (row.is_active ? "active" : "inactive") },
        ]}
        renderActions={(row) => (
          <form action={deleteSportAction}>
            <input type="hidden" name="id" value={row.id} />
            <button className="rounded-lg border border-red-500/60 px-2 py-1 text-xs text-red-300">Delete</button>
          </form>
        )}
      />
    </div>
  );
}
