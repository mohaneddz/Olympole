"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { teamMembershipSchema } from "@/lib/validators";
import { logAdminAction, revalidateMany } from "@/server/_shared";

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
    const { data: team } = await supabase.from("teams").select("name").eq("id", parsed.data.team_id).single();
    await supabase
      .from("registrations")
      .update({ team_id: parsed.data.team_id, team_name: team?.name ?? null })
      .eq("id", parsed.data.registration_id);
  }

  await logAdminAction("team_membership_assign", "team_membership", null, {
    team_id: parsed.data.team_id,
    profile_id: parsed.data.profile_id,
  });

  revalidateMany([
    "/admin/registrations/collective-sports",
    "/admin/registrations/individual-sports",
    "/admin/registrations/culture-events",
    "/admin/schedule",
    "/admin/teams",
  ]);
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
  revalidateMany([
    "/admin/schedule",
    "/admin/registrations/collective-sports",
    "/admin/registrations/individual-sports",
    "/admin/registrations/culture-events",
    "/admin/teams",
  ]);
}

export async function syncTeamMembersAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const teamId = String(formData.get("team_id") ?? "");
  if (!teamId) {
    return;
  }

  const requestedProfileIds = formData
    .getAll("member_profile_id")
    .map((entry) => String(entry).trim())
    .filter((entry) => entry.length > 0);

  const uniqueProfileIds = Array.from(new Set(requestedProfileIds));

  const supabase = await createSupabaseServerClient();
  const { data: existingMemberships, error: existingMembershipsError } = await supabase
    .from("team_memberships")
    .select("id, profile_id")
    .eq("team_id", teamId);

  if (existingMembershipsError) {
    return;
  }

  const existingProfileIds = new Set((existingMemberships ?? []).map((membership) => membership.profile_id));
  const requestedProfileIdSet = new Set(uniqueProfileIds);

  const profileIdsToInsert = uniqueProfileIds.filter((profileId) => !existingProfileIds.has(profileId));
  const membershipIdsToDelete = (existingMemberships ?? [])
    .filter((membership) => !requestedProfileIdSet.has(membership.profile_id))
    .map((membership) => membership.id);

  if (profileIdsToInsert.length > 0) {
    const insertRows = profileIdsToInsert.map((profileId) => ({
      team_id: teamId,
      profile_id: profileId,
      role: "player",
    }));
    const { error: insertError } = await supabase.from("team_memberships").insert(insertRows);
    if (insertError) {
      return;
    }
  }

  if (membershipIdsToDelete.length > 0) {
    const { error: deleteError } = await supabase.from("team_memberships").delete().in("id", membershipIdsToDelete);
    if (deleteError) {
      return;
    }
  }

  await logAdminAction("team_members_sync", "team", teamId, {
    members_count: uniqueProfileIds.length,
  });

  revalidateMany([
    "/admin/schedule",
    "/admin/registrations/collective-sports",
    "/admin/registrations/individual-sports",
    "/admin/registrations/culture-events",
    "/admin/teams",
  ]);
}