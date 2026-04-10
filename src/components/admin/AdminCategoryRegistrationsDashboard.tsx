"use client";

import { useMemo, useState } from "react";
import { assignRegistrationTeamAction, deleteRegistrationAdminAction } from "@/app/actions/admin-management";
import { updateRegistrationStatusAction } from "@/app/actions/registrations";
import { AdminDataTable, type DataTableColumn } from "@/components/admin/AdminDataTable";

type RegistrationRow = {
  id: string;
  registration_table: string;
  activity_slug: string;
  activity_title: string;
  category_type: "collective_sport" | "individual_sport" | "culture";
  user_id: string | null;
  profile_id: string | null;
  event_id: string;
  event_title: string | null;
  event_starts_at: string | null;
  full_name: string;
  email: string;
  phone: string;
  department_or_school: string;
  team_id: string | null;
  team_name: string | null;
  additional_notes: string | null;
  emergency_contact: string | null;
  preferred_role: string | null;
  previous_experience: string | null;
  motivation: string | null;
  detail_gender: string | null;
  detail_competition_level: string | null;
  detail_elo_rating: string | null;
  detail_talent_type: string | null;
  detail_performance_description: string | null;
  detail_art_category: string | null;
  status: "pending" | "approved" | "rejected";
  attendance_status: string;
  created_at: string;
};

type TeamOption = {
  id: string;
  name: string;
  sport_name: string;
};

function formatDate(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function columnsForActivity(slug: string): DataTableColumn<RegistrationRow>[] {
  const base: DataTableColumn<RegistrationRow>[] = [
    {
      key: "full_name",
      label: "Participant",
      sortable: true,
      render: (row) => (
        <div className="space-y-1">
          <p className="font-semibold">{row.full_name}</p>
          <p className="text-xs text-foreground/60">{row.email}</p>
        </div>
      ),
    },
    {
      key: "event_title",
      label: "Event",
      sortable: true,
      render: (row) => (
        <div>
          <p>{row.event_title ?? "-"}</p>
          <p className="text-xs text-foreground/60">{formatDate(row.event_starts_at)}</p>
        </div>
      ),
    },
    { key: "status", label: "Status", sortable: true },
  ];

  if (["football", "basketball", "handball", "volleyball"].includes(slug)) {
    return [
      ...base,
      { key: "detail_gender", label: "Category", sortable: true, render: (row) => row.detail_gender ?? "-" },
      { key: "preferred_role", label: "Role", sortable: true, render: (row) => row.preferred_role ?? "-" },
      { key: "team_name", label: "Team", sortable: true, render: (row) => row.team_name ?? "-" },
      { key: "created_at", label: "Created", sortable: true, render: (row) => formatDate(row.created_at) },
    ];
  }

  if (slug === "chess") {
    return [
      ...base,
      { key: "detail_competition_level", label: "Competition Level", sortable: true, render: (row) => row.detail_competition_level ?? "-" },
      { key: "detail_elo_rating", label: "ELO", sortable: true, render: (row) => row.detail_elo_rating ?? "-" },
      { key: "preferred_role", label: "Style", sortable: true, render: (row) => row.preferred_role ?? "-" },
      { key: "created_at", label: "Created", sortable: true, render: (row) => formatDate(row.created_at) },
    ];
  }

  if (slug === "running") {
    return [
      ...base,
      { key: "detail_competition_level", label: "Competition Level", sortable: true, render: (row) => row.detail_competition_level ?? "-" },
      { key: "preferred_role", label: "Distance", sortable: true, render: (row) => row.preferred_role ?? "-" },
      { key: "created_at", label: "Created", sortable: true, render: (row) => formatDate(row.created_at) },
    ];
  }

  if (slug === "talent-show") {
    return [
      ...base,
      { key: "detail_talent_type", label: "Talent Type", sortable: true, render: (row) => row.detail_talent_type ?? "-" },
      {
        key: "detail_performance_description",
        label: "Performance",
        sortable: true,
        render: (row) => row.detail_performance_description ?? "-",
      },
      { key: "created_at", label: "Created", sortable: true, render: (row) => formatDate(row.created_at) },
    ];
  }

  if (slug === "art-exhibition") {
    return [
      ...base,
      { key: "detail_art_category", label: "Art Category", sortable: true, render: (row) => row.detail_art_category ?? "-" },
      { key: "preferred_role", label: "Medium / Style", sortable: true, render: (row) => row.preferred_role ?? "-" },
      { key: "created_at", label: "Created", sortable: true, render: (row) => formatDate(row.created_at) },
    ];
  }

  return [
    ...base,
    { key: "preferred_role", label: "Role", sortable: true, render: (row) => row.preferred_role ?? "-" },
    { key: "team_name", label: "Team", sortable: true, render: (row) => row.team_name ?? "-" },
    { key: "created_at", label: "Created", sortable: true, render: (row) => formatDate(row.created_at) },
  ];
}

export function AdminCategoryRegistrationsDashboard({
  title,
  rows,
  activityTabs,
  teams,
}: {
  title: string;
  rows: RegistrationRow[];
  activityTabs: Array<{ slug: string; title: string }>;
  teams: TeamOption[];
}) {
  const [activeSlug, setActiveSlug] = useState(activityTabs[0]?.slug ?? "");

  const visibleRows = useMemo(
    () => rows.filter((row) => row.activity_slug === activeSlug),
    [activeSlug, rows]
  );

  const currentColumns = useMemo(
    () => columnsForActivity(activeSlug),
    [activeSlug]
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {activityTabs.map((tab) => {
          const isActive = tab.slug === activeSlug;
          return (
            <button
              key={tab.slug}
              type="button"
              onClick={() => setActiveSlug(tab.slug)}
              className={`rounded-xl border px-4 py-2 text-sm transition ${
                isActive
                  ? "border-cyan-200/60 bg-cyan-400/20 text-cyan-50"
                  : "border-cyan-300/20 bg-cyan-400/5 text-cyan-100/85 hover:bg-cyan-400/12"
              }`}
            >
              {tab.title}
            </button>
          );
        })}
      </div>

      <AdminDataTable
        title={`${title} - ${activityTabs.find((tab) => tab.slug === activeSlug)?.title ?? ""}`}
        rows={visibleRows}
        searchPlaceholder="Search by participant, event, role..."
        searchKeys={["full_name", "email", "event_title", "preferred_role", "team_name"]}
        filters={[
          {
            key: "status",
            label: "Status",
            options: [
              { label: "Pending", value: "pending" },
              { label: "Approved", value: "approved" },
              { label: "Rejected", value: "rejected" },
            ],
          },
        ]}
        columns={currentColumns}
        renderActions={(row) => (
          <div className="space-y-2">
            <form action={updateRegistrationStatusAction} className="flex items-center gap-2">
              <input type="hidden" name="id" value={row.id} />
              <input type="hidden" name="registration_table" value={row.registration_table} />
              <select
                name="status"
                defaultValue={row.status}
                className="h-9 rounded-lg border border-card-border bg-background px-2 text-xs"
              >
                <option value="pending">pending</option>
                <option value="approved">approved</option>
                <option value="rejected">rejected</option>
              </select>
              <button className="rounded-lg border border-card-border px-2 py-1 text-xs">Apply</button>
            </form>

            {["football", "basketball", "handball", "volleyball", "knowledge-cup"].includes(row.activity_slug) ? (
              <form action={assignRegistrationTeamAction} className="flex items-center gap-2">
                <input type="hidden" name="registration_id" value={row.id} />
                <input type="hidden" name="registration_table" value={row.registration_table} />
                <input type="hidden" name="membership_role" value="player" />
                <select
                  name="team_id"
                  defaultValue={row.team_id ?? ""}
                  className="h-9 max-w-44 rounded-lg border border-card-border bg-background px-2 text-xs"
                >
                  <option value="">No team</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name} ({team.sport_name})
                    </option>
                  ))}
                </select>
                <button className="rounded-lg border border-card-border px-2 py-1 text-xs">Assign</button>
              </form>
            ) : null}

            <details className="rounded-lg border border-card-border/70 p-2 text-xs">
              <summary className="cursor-pointer text-foreground/85">View details</summary>
              <div className="mt-2 space-y-1 text-foreground/70">
                <p><span className="font-semibold">Phone:</span> {row.phone || "-"}</p>
                <p><span className="font-semibold">School:</span> {row.department_or_school || "-"}</p>
                <p><span className="font-semibold">Experience:</span> {row.previous_experience || "-"}</p>
                <p><span className="font-semibold">Motivation:</span> {row.motivation || "-"}</p>
              </div>
            </details>

            <form action={deleteRegistrationAdminAction}>
              <input type="hidden" name="registration_id" value={row.id} />
              <input type="hidden" name="registration_table" value={row.registration_table} />
              <button className="rounded-lg border border-red-500/60 px-2 py-1 text-xs text-red-300">
                Delete
              </button>
            </form>
          </div>
        )}
      />
    </div>
  );
}
