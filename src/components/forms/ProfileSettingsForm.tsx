"use client";

import { useActionState } from "react";
import { updateProfileAction } from "@/app/actions/profile";
import { Button } from "@/components/ui/Button";

const initialState = { ok: false, message: "" };

type ProfileDefaults = {
  full_name: string | null;
  school: string | null;
  year_of_study: string | null;
  username: string | null;
  phone: string | null;
  bio: string | null;
  timezone: string | null;
};

export function ProfileSettingsForm({ profile }: { profile: ProfileDefaults }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-card-border bg-card-bg/30 p-6">
      <h2 className="text-2xl font-semibold">Profile Settings</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          name="full_name"
          required
          defaultValue={profile.full_name ?? ""}
          placeholder="Full name"
          className="h-11 px-3 rounded bg-background/60 border border-card-border"
        />
        <input
          name="username"
          defaultValue={profile.username ?? ""}
          placeholder="Username"
          className="h-11 px-3 rounded bg-background/60 border border-card-border"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <select
          name="school"
          required
          defaultValue={profile.school ?? ""}
          className="h-11 px-3 rounded bg-background/60 border border-card-border"
        >
          <option value="">Select school</option>
          <option value="ENSIA">ENSIA</option>
          <option value="NHSM">NHSM</option>
          <option value="NHCS">NHCS</option>
          <option value="Others">Others</option>
        </select>
        <select
          name="year_of_study"
          required
          defaultValue={profile.year_of_study ?? ""}
          className="h-11 px-3 rounded bg-background/60 border border-card-border"
        >
          <option value="">Year of study</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="other">other</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          name="phone"
          defaultValue={profile.phone ?? ""}
          placeholder="Phone"
          className="h-11 px-3 rounded bg-background/60 border border-card-border"
        />
        <input
          name="timezone"
          defaultValue={profile.timezone ?? "Africa/Algiers"}
          placeholder="Timezone"
          className="h-11 px-3 rounded bg-background/60 border border-card-border"
        />
      </div>

      <textarea
        name="bio"
        defaultValue={profile.bio ?? ""}
        placeholder="Short bio"
        className="w-full min-h-24 px-3 py-2 rounded bg-background/60 border border-card-border"
      />

      <Button type="submit" variant="neonPill" size="pill" disabled={pending}>
        {pending ? "Saving..." : "Save Profile"}
      </Button>
      {state.message ? (
        <p className={state.ok ? "text-green-400 text-sm" : "text-red-400 text-sm"}>{state.message}</p>
      ) : null}
    </form>
  );
}
