"use client";

import { useState } from "react";
import {
  deleteUserAdminAction,
  updateUserProfileAdminAction,
} from "@/app/actions/admin-management";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Pencil, Trash2, X } from "lucide-react";

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string;
  school: string | null;
  year_of_study: string | null;
  student_id: string | null;
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
  const [editingRow, setEditingRow] = useState<ProfileRow | null>(null);

  return (
    <>
      <AdminDataTable
        title="User Management"
        rows={profiles}
        initialPageSize={10}
        maxRowsPerPage={40}
        rowsPerPageOptions={[5, 10, 20, 40]}
        searchPlaceholder="Search users by name/email/school..."
        searchKeys={["full_name", "email", "school", "username", "phone", "student_id"]}
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
            key: "student_id",
            label: "Student ID",
            sortable: true,
            render: (row) => row.student_id ?? "-",
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
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEditingRow(row)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-300/40 text-cyan-100 hover:bg-cyan-400/15"
              title="Edit user"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <form action={deleteUserAdminAction}>
              <input type="hidden" name="profile_id" value={row.id} />
              <button
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/60 text-red-300 hover:bg-red-500/15"
                title="Delete user"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        )}
      />

      {editingRow ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-cyan-300/25 bg-[linear-gradient(160deg,rgba(10,22,54,0.95),rgba(6,13,34,0.98))] p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-xl font-bold text-white">Edit User</h3>
              <button
                type="button"
                onClick={() => setEditingRow(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-400/10 text-cyan-100 transition hover:bg-cyan-400/20"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form action={updateUserProfileAdminAction} className="space-y-3">
              <input type="hidden" name="profile_id" value={editingRow.id} />
              <input
                name="full_name"
                defaultValue={editingRow.full_name ?? ""}
                required
                className="h-10 w-full rounded border border-card-border bg-background px-3"
              />
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <input name="school" defaultValue={editingRow.school ?? ""} className="h-10 rounded border border-card-border bg-background px-3" />
                <input name="year_of_study" defaultValue={editingRow.year_of_study ?? ""} className="h-10 rounded border border-card-border bg-background px-3" />
                <input name="student_id" defaultValue={editingRow.student_id ?? ""} className="h-10 rounded border border-card-border bg-background px-3" />
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <input name="username" defaultValue={editingRow.username ?? ""} className="h-10 rounded border border-card-border bg-background px-3" />
                <input name="phone" defaultValue={editingRow.phone ?? ""} className="h-10 rounded border border-card-border bg-background px-3" />
              </div>
              <input
                name="avatar_url"
                defaultValue={editingRow.avatar_url ?? ""}
                placeholder="Avatar URL"
                className="h-10 w-full rounded border border-card-border bg-background px-3"
              />
              <select name="role" defaultValue={editingRow.role} className="h-10 w-full rounded border border-card-border bg-background px-3">
                <option value="participant">participant</option>
                <option value="admin">admin</option>
                <option value="viewer">viewer</option>
              </select>

              <div className="flex items-center gap-2">
                <button className="rounded-lg border border-cyan-300/45 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100">
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingRow(null)}
                  className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm text-white/80"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
