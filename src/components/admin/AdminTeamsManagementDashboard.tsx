"use client";

import { useState } from "react";
import { syncTeamMembersAction } from "@/server/team-memberships";
import { assignGuestRegistrationToTeamAction } from "@/server/team-memberships";
import {
  createTeamAction,
  deleteTeamAction,
  updateTeamAction,
} from "@/server/teams";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Pencil, Plus, Trash2, Users, X } from "lucide-react";

export type SportOption = {
  id: string;
  name: string;
};

type TeamRow = {
  id: string;
  name: string;
  category: "collective" | "individual" | "culture";
  sport_id: string;
  sport_name: string;
  members_count: number;
};

type ProfileOption = {
  id: string;
  isGuest?: boolean;
  registrationId?: string;
  activitySlug?: string;
  label: string;
};

type MembershipRow = {
  id: string;
  team_id: string;
  team_name: string;
  profile_id: string | null;
  registration_id: string | null;
  guest_name: string | null;
  guest_email: string | null;
  profile_name: string;
  role: string;
  created_at: string;
};

const categoryOptions = [
  { label: "Collective", value: "collective" },
  { label: "Individual", value: "individual" },
  { label: "Culture", value: "culture" },
] as const;

function TeamFormDialog({
  title,
  onClose,
  action,
  sports,
  initial,
}: {
  title: string;
  onClose: () => void;
  action: (formData: FormData) => Promise<void>;
  sports: SportOption[];
  initial?: {
    id: string;
    name: string;
    category: "collective" | "individual" | "culture";
    sport_id: string;
  };
}) {
  const handleSubmit = async (formData: FormData) => {
    await action(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-cyan-300/25 bg-[linear-gradient(160deg,rgba(10,22,54,0.95),rgba(6,13,34,0.98))] p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-400/10 text-cyan-100 transition hover:bg-cyan-400/20"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form action={handleSubmit} className="space-y-3">
          {initial ? (
            <input type="hidden" name="id" value={initial.id} />
          ) : null}

          <input
            name="name"
            required
            defaultValue={initial?.name ?? ""}
            placeholder="Team name"
            className="h-10 w-full rounded border border-card-border bg-background px-3"
          />

          <select
            name="sport_id"
            required
            defaultValue={initial?.sport_id ?? ""}
            className="h-10 w-full rounded border border-card-border bg-background px-3"
          >
            <option value="">Select sport</option>
            {sports.map((sport) => (
              <option key={sport.id} value={sport.id}>
                {sport.name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 pt-1">
            <button className="rounded-lg border border-cyan-300/45 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100">
              Save
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm text-white/80"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
function TeamMembersDialog({
  team,
  profiles,
  memberships,
  onClose,
}: {
  team: TeamRow;
  profiles: ProfileOption[];
  memberships: MembershipRow[];
  onClose: () => void;
}) {
  const currentMembers = memberships.filter((m) => m.team_id === team.id);

  const [memberProfileIds, setMemberProfileIds] = useState<string[]>(() => {
    const ids = currentMembers
      .map((m) => {
        if (!m.profile_id && m.registration_id)
          return `reg:${m.registration_id}`;
        return m.profile_id ?? "";
      })
      .filter(Boolean);
    return ids.length > 0 ? ids : [""];
  });

  const handleSubmit = async () => {
    const profileIds = memberProfileIds.filter(
      (id) => id.length > 0 && !id.startsWith("reg:"),
    );
    const guestEntries = memberProfileIds
      .filter((id) => id.startsWith("reg:"))
      .map((id) => {
        const registrationId = id.replace("reg:", "");
        const option = profiles.find((p) => p.id === id);
        return { registrationId, activitySlug: option?.activitySlug ?? "" };
      });

    const profileFormData = new FormData();
    profileFormData.set("team_id", team.id);
    for (const profileId of profileIds) {
      profileFormData.append("member_profile_id", profileId);
    }
    await syncTeamMembersAction(profileFormData);

    for (const guest of guestEntries) {
      const guestFormData = new FormData();
      guestFormData.set("team_id", team.id);
      guestFormData.set("registration_id", guest.registrationId);
      guestFormData.set(
        "registration_table",
        `activity_registrations_${guest.activitySlug.replace(/-/g, "_")}`,
      );
      const option = profiles.find(
        (p) => p.registrationId === guest.registrationId,
      );
      guestFormData.set(
        "guest_name",
        option?.label.replace(/^\[Guest\] /, "").split(" (")[0] ?? "",
      );
      await assignGuestRegistrationToTeamAction(guestFormData);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-cyan-300/25 bg-[linear-gradient(160deg,rgba(10,22,54,0.95),rgba(6,13,34,0.98))] p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-white">Team Members</h3>
            <p className="text-sm text-cyan-100/70">{team.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-400/10 text-cyan-100 transition hover:bg-cyan-400/20"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Currently assigned members — read-only overview */}
          {currentMembers.length > 0 ? (
            <div className="rounded-xl border border-cyan-300/15 bg-cyan-400/5 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-cyan-300/70">
                Currently assigned ({currentMembers.length})
              </p>
              <ul className="space-y-1">
                {currentMembers.map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center gap-2 text-sm text-cyan-100/80"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400/60" />
                    <span>{m.profile_name}</span>
                    <span className="text-xs text-cyan-300/40">· {m.role}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-cyan-100/40">No members assigned yet.</p>
          )}

          {/* Editable member picker */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-300/70">
              Edit roster
            </p>
            {memberProfileIds.map((profileId, index) => (
              <div
                key={`${index}-${profileId}`}
                className="flex items-center gap-2"
              >
                <select
                  value={profileId}
                  onChange={(event) => {
                    const value = event.target.value;
                    setMemberProfileIds((current) =>
                      current.map((entry, currentIndex) =>
                        currentIndex === index ? value : entry,
                      ),
                    );
                  }}
                  className="h-10 w-full rounded border border-card-border bg-background px-3"
                >
                  <option value="">Select member</option>
                  {profiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.label}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => {
                    setMemberProfileIds((current) => {
                      if (current.length === 1) return [""];
                      return current.filter((_, i) => i !== index);
                    });
                  }}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-red-500/60 text-red-300 hover:bg-red-500/15"
                  title="Remove member row"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setMemberProfileIds((current) => [...current, ""])}
            className="inline-flex items-center gap-2 rounded-lg border border-card-border px-3 py-2 text-sm"
          >
            <Plus className="h-4 w-4" />
            Add member
          </button>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleSubmit}
              className="rounded-lg border border-cyan-300/45 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100"
            >
              Save Members
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm text-white/80"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export function CreateTeamButton({ sports }: { sports: SportOption[] }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsCreateOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/40 bg-cyan-400/10 px-3 py-2 text-sm font-medium text-cyan-100 transition-colors hover:bg-cyan-400/20"
      >
        <Plus className="h-4 w-4" />
        Create New Team
      </button>

      {isCreateOpen ? (
        <TeamFormDialog
          title="Create Team"
          action={createTeamAction}
          sports={sports}
          onClose={() => setIsCreateOpen(false)}
        />
      ) : null}
    </>
  );
}

export function AdminTeamsManagementDashboard({
  sports,
  teams,
  profiles,
  memberships,
}: {
  sports: SportOption[];
  teams: TeamRow[];
  profiles: ProfileOption[];
  memberships: MembershipRow[];
}) {
  const [editingTeam, setEditingTeam] = useState<TeamRow | null>(null);
  const [membersTeam, setMembersTeam] = useState<TeamRow | null>(null);

  return (
    <div className="space-y-4">
      <AdminDataTable
        title="Teams"
        rows={teams}
        searchPlaceholder="Search teams..."
        searchKeys={["name", "category", "sport_name"]}
        filters={[
          {
            key: "category",
            label: "Category",
            options: categoryOptions.map((option) => ({
              label: option.label,
              value: option.value,
            })),
          },
          {
            key: "sport_name",
            label: "Sport",
            options: Array.from(
              new Set(teams.map((team) => team.sport_name)),
            ).map((value) => ({
              label: value,
              value,
            })),
          },
        ]}
        columns={[
          { key: "name", label: "Name", sortable: true },
          {
            key: "category",
            label: "Category",
            sortable: true,
            render: (row) =>
              categoryOptions.find((option) => option.value === row.category)
                ?.label ?? row.category,
          },
          { key: "sport_name", label: "Sport", sortable: true },
          { key: "members_count", label: "Members", sortable: true },
        ]}
        renderActions={(row) => (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEditingTeam(row)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-300/40 text-cyan-100 hover:bg-cyan-400/15"
              title="Edit team"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setMembersTeam(row)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-300/40 text-cyan-100 hover:bg-cyan-400/15"
              title="Manage team members"
            >
              <Users className="h-3.5 w-3.5" />
            </button>
            <form action={deleteTeamAction}>
              <input type="hidden" name="id" value={row.id} />
              <button
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/60 text-red-300 hover:bg-red-500/15"
                title="Delete team"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        )}
      />

      {editingTeam ? (
        <TeamFormDialog
          title="Edit Team"
          action={updateTeamAction}
          sports={sports}
          initial={{
            id: editingTeam.id,
            name: editingTeam.name,
            category: editingTeam.category,
            sport_id: editingTeam.sport_id,
          }}
          onClose={() => setEditingTeam(null)}
        />
      ) : null}

      {membersTeam ? (
        <TeamMembersDialog
          key={membersTeam.id}
          team={membersTeam}
          profiles={profiles}
          memberships={memberships}
          onClose={() => setMembersTeam(null)}
        />
      ) : null}
    </div>
  );
}
