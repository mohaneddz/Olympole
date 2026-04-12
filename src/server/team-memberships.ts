"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { teamMembershipSchema } from "@/lib/validators";
import { logAdminAction, revalidateMany } from "@/server/_shared";
import { getAllowedActivityRegistrationTables } from "@/lib/activity-registry";

export async function assignProfileToTeamAction(
  formData: FormData,
): Promise<void> {
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
    { onConflict: "team_id,profile_id" },
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

  revalidateMany([
    "/admin/registrations/collective-sports",
    "/admin/registrations/individual-sports",
    "/admin/registrations/culture-events",
    "/admin/schedule",
    "/admin/teams",
  ]);
}

export async function removeTeamMembershipAction(
  formData: FormData,
): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("membership_id") ?? "");
  if (!id) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("team_memberships")
    .delete()
    .eq("id", id);
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

  // Only handle real profile IDs here — guest (reg:xxx) IDs are handled by assignGuestRegistrationToTeamAction
  const requestedProfileIds = formData
    .getAll("member_profile_id")
    .map((entry) => String(entry).trim())
    .filter((entry) => entry.length > 0 && !entry.startsWith("reg:"));

  const uniqueProfileIds = Array.from(new Set(requestedProfileIds));

  const supabase = await createSupabaseServerClient();

  // Only fetch profile-based memberships — never touch guest rows (profile_id IS NULL)
  const { data: existingMemberships, error: existingMembershipsError } =
    await supabase
      .from("team_memberships")
      .select("id, profile_id")
      .eq("team_id", teamId)
      .not("profile_id", "is", null); // ← only profile rows, never guests

  if (existingMembershipsError) {
    return;
  }

  const existingProfileIds = new Set(
    (existingMemberships ?? []).map((m) => m.profile_id),
  );
  const requestedProfileIdSet = new Set(uniqueProfileIds);

  const profileIdsToInsert = uniqueProfileIds.filter(
    (id) => !existingProfileIds.has(id),
  );
  const membershipIdsToDelete = (existingMemberships ?? [])
    .filter((m) => !requestedProfileIdSet.has(m.profile_id))
    .map((m) => m.id);

  if (profileIdsToInsert.length > 0) {
    const { error: insertError } = await supabase
      .from("team_memberships")
      .insert(
        profileIdsToInsert.map((profileId) => ({
          team_id: teamId,
          profile_id: profileId,
          role: "player",
        })),
      );
    if (insertError) {
      return;
    }
  }

  if (membershipIdsToDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from("team_memberships")
      .delete()
      .in("id", membershipIdsToDelete);
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

export async function assignGuestRegistrationToTeamAction(
  formData: FormData,
): Promise<void> {
  await requireAdmin();

  const teamId = String(formData.get("team_id") ?? "");
  const registrationId = String(formData.get("registration_id") ?? "");
  const registrationTable = String(formData.get("registration_table") ?? "");
  const guestName = String(formData.get("guest_name") ?? "").trim();
  const guestEmail = String(formData.get("guest_email") ?? "").trim();
  const role = String(formData.get("role") ?? "player").trim();

  if (!teamId || !registrationId || !registrationTable) {
    return;
  }

  const allowedTables = new Set(getAllowedActivityRegistrationTables());
  if (!allowedTables.has(registrationTable)) {
    return;
  }

  const supabase = await createSupabaseServerClient();

  // Check if already assigned
  const { data: existing } = await supabase
    .from("team_memberships")
    .select("id")
    .eq("team_id", teamId)
    .eq("registration_id", registrationId)
    .maybeSingle();

  if (existing) {
    // Already assigned — just stamp team_id on the registration row
    await supabase
      .from(registrationTable)
      .update({ team_id: teamId })
      .eq("id", registrationId);
    revalidateMany(["/admin/teams", "/admin/registrations/collective-sports"]);
    return;
  }

  const { error } = await supabase.from("team_memberships").insert({
    team_id: teamId,
    registration_id: registrationId,
    profile_id: null,
    guest_name: guestName || null,
    guest_email: guestEmail || null,
    role: role || "player",
  });

  if (error) {
    throw new Error(error.message);
  }

  // Stamp team_id on the activity registration row
  await supabase
    .from(registrationTable)
    .update({ team_id: teamId })
    .eq("id", registrationId);

  await logAdminAction(
    "guest_team_membership_assign",
    "team_membership",
    null,
    {
      team_id: teamId,
      registration_id: registrationId,
    },
  );

  revalidateMany([
    "/admin/teams",
    "/admin/registrations/collective-sports",
    "/admin/registrations/individual-sports",
  ]);
}
