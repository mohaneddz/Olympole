"use client";

import {
  deleteUserAdminAction,
  updateUserProfileAdminAction,
} from "@/app/actions/admin-management";
import { AdminDataTable } from "@/components/admin/AdminDataTable";

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string;
  school: string | null;
  year_of_study: string | null;
  username: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: "admin" | "participant" | "viewer";
  created_at: string;
  last_seen_at: string | null;
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

export function AdminUsersDashboard({ profiles }: { profiles: ProfileRow[] }) {
  return (
    <AdminDataTable
      title="User Management"
      rows={profiles}
      initialPageSize={10}
      maxRowsPerPage={40}
      rowsPerPageOptions={[5, 10, 20, 40]}
      searchPlaceholder="Search users by name/email/school..."
      searchKeys={["full_name", "email", "school", "username", "phone"]}
      filters={[
        {
          key: "role",
          label: "Role",
          options: [
            { label: "Admin", value: "admin" },
            { label: "Participant", value: "participant" },
            { label: "Viewer", value: "viewer" },
          ],
        },
      ]}
      columns={[
        {
          key: "full_name",
          label: "User",
          sortable: true,
          render: (row) => (
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-full border border-card-border">
                {row.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={row.avatar_url} alt={row.full_name ?? row.email} className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center text-xs text-foreground/60">N/A</div>
                )}
              </div>
              <div>
                <p className="font-semibold">{row.full_name ?? "Unknown user"}</p>
                <p className="text-xs text-foreground/60">{row.email}</p>
              </div>
            </div>
          ),
        },
        {
          key: "school",
          label: "School / Year",
          sortable: true,
          render: (row) => `${row.school ?? "-"} / ${row.year_of_study ?? "-"}`,
        },
        {
          key: "username",
          label: "Username",
          sortable: true,
          render: (row) => row.username ?? "-",
        },
        {
          key: "role",
          label: "Role",
          sortable: true,
        },
        {
          key: "last_seen_at",
          label: "Last Seen",
          sortable: true,
          render: (row) => formatDate(row.last_seen_at),
        },
      ]}
      renderActions={(row) => (
        <div className="space-y-2">
          <details className="rounded-lg border border-card-border p-2 text-xs">
            <summary className="cursor-pointer">Edit</summary>
            <form action={updateUserProfileAdminAction} className="mt-2 space-y-2">
              <input type="hidden" name="profile_id" value={row.id} />
              <input
                name="full_name"
                defaultValue={row.full_name ?? ""}
                required
                className="h-8 w-full rounded border border-card-border bg-background px-2"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  name="school"
                  defaultValue={row.school ?? ""}
                  className="h-8 rounded border border-card-border bg-background px-2"
                />
                <input
                  name="year_of_study"
                  defaultValue={row.year_of_study ?? ""}
                  className="h-8 rounded border border-card-border bg-background px-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  name="username"
                  defaultValue={row.username ?? ""}
                  className="h-8 rounded border border-card-border bg-background px-2"
                />
                <input
                  name="phone"
                  defaultValue={row.phone ?? ""}
                  className="h-8 rounded border border-card-border bg-background px-2"
                />
              </div>
              <input
                name="avatar_url"
                defaultValue={row.avatar_url ?? ""}
                placeholder="Avatar URL"
                className="h-8 w-full rounded border border-card-border bg-background px-2"
              />
              <select
                name="role"
                defaultValue={row.role}
                className="h-8 w-full rounded border border-card-border bg-background px-2"
              >
                <option value="participant">participant</option>
                <option value="admin">admin</option>
                <option value="viewer">viewer</option>
              </select>
              <button className="rounded-lg border border-card-border px-2 py-1">Save</button>
            </form>
          </details>

          <form action={deleteUserAdminAction}>
            <input type="hidden" name="profile_id" value={row.id} />
            <button className="rounded-lg border border-red-500/60 px-2 py-1 text-xs text-red-300">
              Delete user
            </button>
          </form>
        </div>
      )}
    />
  );
}
