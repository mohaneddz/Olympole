"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import {
  assignRegistrationTeamWithFeedbackAction,
  deleteRegistrationAdminAction,
  updateRegistrationStatusWithFeedbackAction,
} from "@/server/registrations";
import {
  AdminDataTable,
  type DataTableColumn,
} from "@/components/admin/AdminDataTable";
import { MoreHorizontal, X } from "lucide-react";
import type { ActionResponse } from "@/lib/actions";

type RegistrationRow = {
  id: string;
  registration_table: string;
  activity_slug: string;
  activity_title: string;
  category_type: "collective_sport" | "individual_sport" | "culture";
  user_id: string | null;
  profile_id: string | null;
  event_id: string | null;
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

function RegistrationActionsDialog({
  row,
  teams,
  onToast,
}: {
  row: RegistrationRow;
  teams: TeamOption[];
  onToast: (state: ActionResponse) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const initialActionState: ActionResponse = { ok: false, message: "" };
  const [statusState, statusFormAction] = useActionState(
    updateRegistrationStatusWithFeedbackAction,
    initialActionState,
  );
  const [teamState, teamFormAction] = useActionState(
    assignRegistrationTeamWithFeedbackAction,
    initialActionState,
  );
  const supportsTeamAssignment = [
    "football",
    "basketball",
    "handball",
    "volleyball",
    "knowledge-cup",
  ].includes(row.activity_slug);

  useEffect(() => {
    if (statusState.message) {
      onToast(statusState);
    }
  }, [statusState, onToast]);

  useEffect(() => {
    if (teamState.message) {
      onToast(teamState);
    }
  }, [teamState, onToast]);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-300/40 text-cyan-100 transition hover:bg-cyan-400/15"
        title="Registration actions"
        aria-label="Registration actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      <dialog
        ref={dialogRef}
        className="fixed left-1/2 top-1/2 w-[min(92vw,34rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-cyan-300/30 bg-[linear-gradient(160deg,rgba(10,22,54,0.97),rgba(6,13,34,0.98))] p-0 text-cyan-50 shadow-2xl backdrop:bg-black/60"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            dialogRef.current?.close();
          }
        }}
      >
        <div className="space-y-4 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-cyan-200/70">Registration Actions</p>
              <p className="font-semibold">{row.full_name}</p>
            </div>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-300/40 text-cyan-100 hover:bg-cyan-400/15"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form action={statusFormAction} className="flex items-center gap-2">
            <input type="hidden" name="id" value={row.id} />
            <input
              type="hidden"
              name="registration_table"
              value={row.registration_table}
            />
            <select
              name="status"
              defaultValue={row.status}
              className="h-9 flex-1 rounded-lg border border-card-border bg-background px-2 text-sm"
            >
              <option value="pending">pending</option>
              <option value="approved">approved</option>
              <option value="rejected">rejected</option>
            </select>
            <button className="rounded-lg border border-card-border px-3 py-2 text-sm">
              Apply
            </button>
          </form>

          {supportsTeamAssignment ? (
            <form action={teamFormAction} className="flex items-center gap-2">
              <input type="hidden" name="registration_id" value={row.id} />
              <input
                type="hidden"
                name="registration_table"
                value={row.registration_table}
              />
              <input type="hidden" name="membership_role" value="player" />
              <select
                name="team_id"
                defaultValue={row.team_id ?? ""}
                className="h-9 flex-1 rounded-lg border border-card-border bg-background px-2 text-sm"
              >
                <option value="">No team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name} ({team.sport_name})
                  </option>
                ))}
              </select>
              <button className="rounded-lg border border-card-border px-3 py-2 text-sm">
                Assign
              </button>
            </form>
          ) : null}

          <div className="rounded-xl border border-card-border/70 p-3 text-sm text-foreground/80">
            <p>
              <span className="font-semibold">Phone:</span> {row.phone || "-"}
            </p>
            <p>
              <span className="font-semibold">School:</span>{" "}
              {row.department_or_school || "-"}
            </p>
            <p>
              <span className="font-semibold">Experience:</span>{" "}
              {row.previous_experience || "-"}
            </p>
            <p>
              <span className="font-semibold">Motivation:</span>{" "}
              {row.motivation || "-"}
            </p>
          </div>

          <form action={deleteRegistrationAdminAction} className="pt-1">
            <input type="hidden" name="registration_id" value={row.id} />
            <input
              type="hidden"
              name="registration_table"
              value={`activity_registrations_${row.activity_slug?.replace(/-/g, "_")}`}
            />
            <input
              type="hidden"
              name="registration_table"
              value={row.registration_table}
            />
            <button className="rounded-lg border border-red-500/60 px-3 py-2 text-sm text-red-300 hover:bg-red-500/10">
              Delete
            </button>
          </form>
        </div>
      </dialog>
    </>
  );
}

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
    { key: "status", label: "Status", sortable: true },
    {
      key: "previous_experience",
      label: "Experience",
      sortable: true,
      render: (row) => (
        <p className="max-w-xs truncate" title={row.previous_experience ?? "-"}>
          {row.previous_experience ?? "-"}
        </p>
      ),
    },
    {
      key: "motivation",
      label: "Motivation",
      sortable: true,
      render: (row) => (
        <p className="max-w-xs truncate" title={row.motivation ?? "-"}>
          {row.motivation ?? "-"}
        </p>
      ),
    },
  ];

  if (["football", "basketball", "handball", "volleyball"].includes(slug)) {
    return [
      ...base,
      {
        key: "detail_gender",
        label: "Category",
        sortable: true,
        render: (row) => row.detail_gender ?? "-",
      },
      {
        key: "preferred_role",
        label: "Role",
        sortable: true,
        render: (row) => row.preferred_role ?? "-",
      },
      {
        key: "team_name",
        label: "Team",
        sortable: true,
        render: (row) => row.team_name ?? "-",
      },
      {
        key: "created_at",
        label: "Created",
        sortable: true,
        render: (row) => formatDate(row.created_at),
      },
    ];
  }

  if (slug === "chess") {
    return [
      ...base,
      {
        key: "detail_competition_level",
        label: "Competition Level",
        sortable: true,
        render: (row) => row.detail_competition_level ?? "-",
      },
      {
        key: "detail_elo_rating",
        label: "ELO",
        sortable: true,
        render: (row) => row.detail_elo_rating ?? "-",
      },
      {
        key: "preferred_role",
        label: "Style",
        sortable: true,
        render: (row) => row.preferred_role ?? "-",
      },
      {
        key: "created_at",
        label: "Created",
        sortable: true,
        render: (row) => formatDate(row.created_at),
      },
    ];
  }

  if (slug === "running") {
    return [
      ...base,
      {
        key: "detail_competition_level",
        label: "Competition Level",
        sortable: true,
        render: (row) => row.detail_competition_level ?? "-",
      },
      {
        key: "preferred_role",
        label: "Distance",
        sortable: true,
        render: (row) => row.preferred_role ?? "-",
      },
      {
        key: "created_at",
        label: "Created",
        sortable: true,
        render: (row) => formatDate(row.created_at),
      },
    ];
  }

  if (slug === "talent-show") {
    return [
      ...base,
      {
        key: "detail_talent_type",
        label: "Talent Type",
        sortable: true,
        render: (row) => row.detail_talent_type ?? "-",
      },
      {
        key: "detail_performance_description",
        label: "Performance",
        sortable: true,
        render: (row) => row.detail_performance_description ?? "-",
      },
      {
        key: "created_at",
        label: "Created",
        sortable: true,
        render: (row) => formatDate(row.created_at),
      },
    ];
  }

  if (slug === "art-exhibition") {
    return [
      ...base,
      {
        key: "detail_art_category",
        label: "Art Category",
        sortable: true,
        render: (row) => row.detail_art_category ?? "-",
      },
      {
        key: "preferred_role",
        label: "Medium / Style",
        sortable: true,
        render: (row) => row.preferred_role ?? "-",
      },
      {
        key: "created_at",
        label: "Created",
        sortable: true,
        render: (row) => formatDate(row.created_at),
      },
    ];
  }

  return [
    ...base,
    {
      key: "preferred_role",
      label: "Role",
      sortable: true,
      render: (row) => row.preferred_role ?? "-",
    },
    {
      key: "team_name",
      label: "Team",
      sortable: true,
      render: (row) => row.team_name ?? "-",
    },
    {
      key: "created_at",
      label: "Created",
      sortable: true,
      render: (row) => formatDate(row.created_at),
    },
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
  const [toast, setToast] = useState<ActionResponse | null>(null);

  const visibleRows = useMemo(
    () => rows.filter((row) => row.activity_slug === activeSlug),
    [activeSlug, rows],
  );

  const currentColumns = useMemo(
    () => columnsForActivity(activeSlug),
    [activeSlug],
  );

  useEffect(() => {
    if (!toast?.message) {
      return;
    }

    const timeoutId = window.setTimeout(
      () => setToast(null),
      toast.ok ? 2500 : 4000,
    );
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  return (
    <div className="space-y-5">
      {toast?.message ? (
        <div
          className={`fixed right-4 top-24 z-[9999] max-w-sm rounded-xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-sm ${
            toast.ok
              ? "border-green-400/45 bg-green-500/20 text-green-100"
              : "border-red-400/45 bg-red-500/20 text-red-100"
          }`}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      ) : null}

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
        searchPlaceholder="Search by participant, role, team..."
        searchKeys={[
          "full_name",
          "email",
          "preferred_role",
          "team_name",
          "previous_experience",
          "motivation",
        ]}
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
          <RegistrationActionsDialog
            row={row}
            teams={teams}
            onToast={setToast}
          />
        )}
      />
    </div>
  );
}
