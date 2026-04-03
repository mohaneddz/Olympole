"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser, requireAdmin } from "@/lib/auth";
import {
  profileAdminUpdateSchema,
  teamMembershipSchema,
  tournamentAssignmentSchema,
  tournamentSchema,
} from "@/lib/validators";

function toOptionalIso(value: FormDataEntryValue | null) {
  const raw = String(value ?? "");
  if (!raw) {
    return null;
  }
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function toOptionalNumber(value: FormDataEntryValue | null) {
  const raw = String(value ?? "");
  if (!raw) {
    return null;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

async function logAdminAction(
  action: string,
  entityType: string,
  entityId: string | null,
  payload?: Record<string, unknown>
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  await supabase.from("admin_activity_logs").insert({
    admin_user_id: currentUser.id,
    action,
    entity_type: entityType,
    entity_id: entityId,
    payload: payload ?? null,
  });
}

function shuffle<T>(items: T[]) {
  const array = [...items];
  for (let index = array.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const temp = array[index];
    array[index] = array[swapIndex];
    array[swapIndex] = temp;
  }
  return array;
}

function buildGroupLabel(seed: number, teamCount: number) {
  const groupCount = Math.max(1, Math.ceil(teamCount / 4));
  const groupIndex = seed % groupCount;
  return String.fromCharCode("A".charCodeAt(0) + groupIndex);
}

export async function updateUserProfileAdminAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const parsed = profileAdminUpdateSchema.safeParse({
    profile_id: formData.get("profile_id"),
    full_name: formData.get("full_name"),
    school: formData.get("school"),
    year_of_study: formData.get("year_of_study"),
    phone: formData.get("phone"),
    username: formData.get("username"),
    avatar_url: formData.get("avatar_url"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.full_name,
      school: parsed.data.school || null,
      year_of_study: parsed.data.year_of_study || null,
      phone: parsed.data.phone || null,
      username: parsed.data.username || null,
      avatar_url: parsed.data.avatar_url || null,
      role: parsed.data.role,
    })
    .eq("id", parsed.data.profile_id);

  if (error) {
    return;
  }

  if (parsed.data.role === "admin") {
    await supabase.from("profile_roles").upsert(
      {
        profile_id: parsed.data.profile_id,
        role_name: "admin",
      },
      { onConflict: "profile_id,role_name" }
    );
  } else {
    await supabase
      .from("profile_roles")
      .delete()
      .eq("profile_id", parsed.data.profile_id)
      .eq("role_name", "admin");
  }

  await logAdminAction("profile_admin_update", "profile", parsed.data.profile_id);
  revalidatePath("/admin/users");
  revalidatePath("/profile");
}

export async function deleteUserAdminAction(formData: FormData): Promise<void> {
  const currentAdmin = await requireAdmin();
  const targetProfileId = String(formData.get("profile_id") ?? "");
  if (!targetProfileId || targetProfileId === currentAdmin.id) {
    return;
  }

  try {
    const adminSupabase = createSupabaseAdminClient();
    await adminSupabase.auth.admin.deleteUser(targetProfileId);
  } catch {
    return;
  }

  await logAdminAction("profile_admin_delete", "profile", targetProfileId);
  revalidatePath("/admin/users");
}

export async function deleteRegistrationAdminAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("registration_id") ?? "");
  if (!id) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("registrations").delete().eq("id", id);
  if (error) {
    return;
  }

  await logAdminAction("registration_delete", "registration", id);
  revalidatePath("/admin/registrations");
  revalidatePath("/profile");
}

export async function assignRegistrationTeamAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const registrationId = String(formData.get("registration_id") ?? "");
  const teamId = String(formData.get("team_id") ?? "");
  const membershipRole = String(formData.get("membership_role") ?? "player");
  if (!registrationId) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  let teamName: string | null = null;
  if (teamId) {
    const { data: team } = await supabase.from("teams").select("id,name").eq("id", teamId).single();
    teamName = team?.name ?? null;
  }

  const { data: registration, error } = await supabase
    .from("registrations")
    .update({
      team_id: teamId || null,
      team_name: teamName,
    })
    .eq("id", registrationId)
    .select("id, profile_id")
    .single();

  if (error || !registration) {
    return;
  }

  if (teamId && registration.profile_id) {
    await supabase.from("team_memberships").upsert(
      {
        team_id: teamId,
        profile_id: registration.profile_id,
        role: membershipRole || "player",
      },
      { onConflict: "team_id,profile_id" }
    );
  }

  await logAdminAction("registration_assign_team", "registration", registrationId, {
    team_id: teamId || null,
  });

  revalidatePath("/admin/registrations");
  revalidatePath("/admin/sports");
  revalidatePath("/profile");
}

export async function assignProfileToTeamAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const parsed = teamMembershipSchema.safeParse({
    team_id: formData.get("team_id"),
    profile_id: formData.get("profile_id"),
    role: formData.get("role") || "player",
    registration_id: formData.get("registration_id"),
  });

  if (!parsed.success) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("team_memberships").upsert(
    {
      team_id: parsed.data.team_id,
      profile_id: parsed.data.profile_id,
      role: parsed.data.role || "player",
    },
    { onConflict: "team_id,profile_id" }
  );

  if (error) {
    return;
  }

  if (parsed.data.registration_id) {
    const { data: team } = await supabase
      .from("teams")
      .select("name")
      .eq("id", parsed.data.team_id)
      .single();
    await supabase
      .from("registrations")
      .update({ team_id: parsed.data.team_id, team_name: team?.name ?? null })
      .eq("id", parsed.data.registration_id);
  }

  await logAdminAction("team_membership_assign", "team_membership", null, {
    team_id: parsed.data.team_id,
    profile_id: parsed.data.profile_id,
  });
  revalidatePath("/admin/registrations");
  revalidatePath("/admin/sports");
}

export async function removeTeamMembershipAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("membership_id") ?? "");
  if (!id) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("team_memberships").delete().eq("id", id);
  if (error) {
    return;
  }

  await logAdminAction("team_membership_remove", "team_membership", id);
  revalidatePath("/admin/sports");
  revalidatePath("/admin/registrations");
}

export async function createTournamentAction(formData: FormData): Promise<void> {
  const adminUser = await requireAdmin();
  const parsed = tournamentSchema.safeParse({
    name: formData.get("name"),
    sport_id: formData.get("sport_id"),
    event_id: formData.get("event_id"),
    format: formData.get("format"),
    status: formData.get("status"),
    starts_at: formData.get("starts_at"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tournaments")
    .insert({
      name: parsed.data.name,
      sport_id: parsed.data.sport_id || null,
      event_id: parsed.data.event_id || null,
      format: parsed.data.format,
      status: parsed.data.status,
      starts_at: parsed.data.starts_at ? toOptionalIso(parsed.data.starts_at) : null,
      notes: parsed.data.notes || null,
      created_by: adminUser.id,
    })
    .select("id")
    .single();

  if (error) {
    return;
  }

  await logAdminAction("tournament_create", "tournament", data?.id ?? null);
  revalidatePath("/admin/sports");
}

export async function deleteTournamentAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("tournament_id") ?? "");
  if (!id) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("tournaments").delete().eq("id", id);
  if (error) {
    return;
  }

  await logAdminAction("tournament_delete", "tournament", id);
  revalidatePath("/admin/sports");
}

export async function assignTeamToTournamentAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const parsed = tournamentAssignmentSchema.safeParse({
    tournament_id: formData.get("tournament_id"),
    team_id: formData.get("team_id"),
  });

  if (!parsed.success || !parsed.data.team_id) {
    return;
  }

  const seed = toOptionalNumber(formData.get("seed"));
  const groupLabel = String(formData.get("group_label") ?? "").trim() || null;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("tournament_teams").upsert(
    {
      tournament_id: parsed.data.tournament_id,
      team_id: parsed.data.team_id,
      seed,
      group_label: groupLabel,
    },
    { onConflict: "tournament_id,team_id" }
  );

  if (error) {
    return;
  }

  await logAdminAction("tournament_assign_team", "tournament", parsed.data.tournament_id, {
    team_id: parsed.data.team_id,
    seed,
    group_label: groupLabel,
  });
  revalidatePath("/admin/sports");
}

export async function removeTournamentTeamAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const assignmentId = String(formData.get("assignment_id") ?? "");
  if (!assignmentId) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("tournament_teams").delete().eq("id", assignmentId);
  if (error) {
    return;
  }

  await logAdminAction("tournament_assignment_remove", "tournament_team", assignmentId);
  revalidatePath("/admin/sports");
}

export async function clearTournamentDistributionAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const tournamentId = String(formData.get("tournament_id") ?? "");
  if (!tournamentId) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  await supabase.from("tournament_teams").delete().eq("tournament_id", tournamentId);
  await logAdminAction("tournament_clear_distribution", "tournament", tournamentId);
  revalidatePath("/admin/sports");
}

export async function randomDistributeTournamentTeamsAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const tournamentId = String(formData.get("tournament_id") ?? "");
  if (!tournamentId) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { data: tournament } = await supabase
    .from("tournaments")
    .select("id, sport_id, format")
    .eq("id", tournamentId)
    .single();

  if (!tournament?.sport_id) {
    return;
  }

  const { data: teams } = await supabase
    .from("teams")
    .select("id")
    .eq("sport_id", tournament.sport_id)
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (!teams?.length) {
    return;
  }

  const randomized = shuffle(teams);
  await supabase.from("tournament_teams").delete().eq("tournament_id", tournamentId);

  const rows = randomized.map((team, index) => ({
    tournament_id: tournamentId,
    team_id: team.id,
    seed: index + 1,
    group_label: tournament.format === "group" ? buildGroupLabel(index, randomized.length) : null,
  }));

  await supabase.from("tournament_teams").insert(rows);
  await logAdminAction("tournament_random_distribution", "tournament", tournamentId, {
    assigned_teams: rows.length,
  });
  revalidatePath("/admin/sports");
}
