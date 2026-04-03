"use client";

import {
  assignRegistrationTeamAction,
  deleteRegistrationAdminAction,
} from "@/app/actions/admin-management";
import { updateRegistrationStatusAction } from "@/app/actions/registrations";
import { AdminDataTable } from "@/components/admin/AdminDataTable";

type RegistrationRow = {
  id: string;
  profile_id: string | null;
  full_name: string;
  email: string;
  phone: string;
  department_or_school: string;
  category_type: string;
  activity_slug: string | null;
  status: string;
  attendance_status: string;
  team_id: string | null;
  team_name: string | null;
  previous_experience: string | null;
  motivation: string | null;
  availability_date: string | null;
  preferred_role: string | null;
  created_at: string;
  event_title: string;
  event_slug: string;
  event_starts_at: string;
};

type TeamOption = {
  id: string;
  name: string;
  sport_name: string;
};

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

export function AdminRegistrationsDashboard({
  registrations,
  teams,
}: {
  registrations: RegistrationRow[];
  teams: TeamOption[];
}) {
  return (
    <AdminDataTable
      title="Activity Registrations"
      rows={registrations}
      initialPageSize={10}
      maxRowsPerPage={40}
      rowsPerPageOptions={[5, 10, 20, 40]}
      searchPlaceholder="Search by name, email, event, activity..."
      searchKeys={["full_name", "email", "event_title", "activity_slug", "team_name"]}
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
        {
          key: "category_type",
          label: "Category",
          options: [
            { label: "Collective", value: "collective_sport" },
            { label: "Individual", value: "individual_sport" },
            { label: "Culture", value: "culture" },
          ],
        },
      ]}
      columns={[
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
          key: "activity_slug",
          label: "Activity",
          sortable: true,
          render: (row) => (
            <div className="space-y-1">
              <p className="text-sm font-medium">{row.activity_slug ?? row.event_slug}</p>
              <p className="text-xs text-foreground/60">{row.category_type}</p>
            </div>
          ),
        },
        {
          key: "event_title",
          label: "Event",
          sortable: true,
          render: (row) => (
            <div className="space-y-1">
              <p>{row.event_title}</p>
              <p className="text-xs text-foreground/60">{formatDate(row.event_starts_at)}</p>
            </div>
          ),
        },
        {
          key: "status",
          label: "Status",
          sortable: true,
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
      ]}
      renderActions={(row) => (
        <div className="space-y-2">
          <form action={updateRegistrationStatusAction} className="flex items-center gap-2">
            <input type="hidden" name="id" value={row.id} />
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

          <form action={assignRegistrationTeamAction} className="flex items-center gap-2">
            <input type="hidden" name="registration_id" value={row.id} />
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
            <input type="hidden" name="membership_role" value="player" />
            <button className="rounded-lg border border-card-border px-2 py-1 text-xs">Assign</button>
          </form>

          <details className="rounded-lg border border-card-border/70 p-2 text-xs">
            <summary className="cursor-pointer text-foreground/80">View details</summary>
            <div className="mt-2 space-y-1 text-foreground/70">
              <p><span className="font-semibold">Phone:</span> {row.phone || "-"}</p>
              <p><span className="font-semibold">School:</span> {row.department_or_school || "-"}</p>
              <p><span className="font-semibold">Experience:</span> {row.previous_experience || "-"}</p>
              <p><span className="font-semibold">Motivation:</span> {row.motivation || "-"}</p>
              <p><span className="font-semibold">Availability:</span> {row.availability_date || "-"}</p>
            </div>
          </details>

          <form action={deleteRegistrationAdminAction}>
            <input type="hidden" name="registration_id" value={row.id} />
            <button className="rounded-lg border border-red-500/60 px-2 py-1 text-xs text-red-300">Delete</button>
          </form>
        </div>
      )}
    />
  );
}
