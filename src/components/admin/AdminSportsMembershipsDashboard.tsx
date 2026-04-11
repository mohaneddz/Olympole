"use client";

import {
  assignProfileToTeamAction,
  removeTeamMembershipAction,
} from "@/server/team-memberships";
import { AdminDataTable } from "@/components/admin/AdminDataTable";

type TeamRow = {
  id: string;
  name: string;
  sport_name: string;
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

export function AdminSportsMembershipsDashboard({
  teams,
  profiles,
  memberships,
}: {
  teams: TeamRow[];
  profiles: ProfileOption[];
  memberships: MembershipRow[];
}) {
  return (
    <div className="space-y-8">
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
    </div>
  );
}
