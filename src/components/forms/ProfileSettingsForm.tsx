"use client";

import Link from "next/link";
import { useActionState } from "react";
import { updateProfileAction } from "@/app/actions/profile";
import { Button } from "@/components/ui/Button";
import { ChevronDown, LogOut, UserRound } from "lucide-react";

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
    <form
      action={formAction}
      className="flex h-full flex-col rounded-3xl border border-cyan-300/20 bg-[linear-gradient(130deg,rgba(4,17,50,0.82),rgba(3,10,32,0.92))] p-6 shadow-[0_0_0_1px_rgba(34,211,238,0.12)] md:p-8"
    >
      <div>
        <h2 className="flex items-center gap-2 text-3xl font-black text-white">
          <UserRound className="h-6 w-6 text-violet-300" />
          Profile Information
        </h2>
        <p className="mt-1 text-cyan-100/70">Keep your details up to date.</p>
      </div>

      <div className="mt-7 grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-sm text-cyan-100/85">Full Name</span>
          <input
            name="full_name"
            required
            defaultValue={profile.full_name ?? ""}
            placeholder="Full name"
            className="h-12 w-full rounded-xl border border-cyan-300/20 bg-background/50 px-3"
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-sm text-cyan-100/85">Username</span>
          <input
            name="username"
            defaultValue={profile.username ?? ""}
            placeholder="Username"
            className="h-12 w-full rounded-xl border border-cyan-300/20 bg-background/50 px-3"
          />
        </label>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-sm text-cyan-100/85">School</span>
          <div className="relative">
            <select
              name="school"
              required
              defaultValue={profile.school ?? ""}
              className="profile-select h-12 w-full appearance-none rounded-xl border border-cyan-300/20 bg-background/50 px-3 pr-10"
            >
              <option value="">Select school</option>
              <option value="ENSIA">ENSIA</option>
              <option value="NHSM">NHSM</option>
              <option value="NHCS">NHCS</option>
              <option value="Others">Others</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-100/75" />
          </div>
        </label>
        <label className="space-y-1.5">
          <span className="text-sm text-cyan-100/85">Year</span>
          <div className="relative">
            <select
              name="year_of_study"
              required
              defaultValue={profile.year_of_study ?? ""}
              className="profile-select h-12 w-full appearance-none rounded-xl border border-cyan-300/20 bg-background/50 px-3 pr-10"
            >
              <option value="">Year</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="other">other</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-100/75" />
          </div>
        </label>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-sm text-cyan-100/85">Phone</span>
          <input
            name="phone"
            defaultValue={profile.phone ?? ""}
            placeholder="+213 ..."
            className="h-12 w-full rounded-xl border border-cyan-300/20 bg-background/50 px-3"
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-sm text-cyan-100/85">Region</span>
          <input
            name="timezone"
            defaultValue={profile.timezone ?? "Africa/Algiers"}
            placeholder="Africa/Algiers"
            className="h-12 w-full rounded-xl border border-cyan-300/20 bg-background/50 px-3"
          />
        </label>
      </div>

      <label className="mt-4 block space-y-1.5">
        <span className="text-sm text-cyan-100/85">Short Bio</span>
        <textarea
          name="bio"
          defaultValue={profile.bio ?? ""}
          placeholder="Short bio"
          className="min-h-24 w-full rounded-xl border border-cyan-300/20 bg-background/50 px-3 py-2"
        />
      </label>

      <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <Button type="submit" variant="neonPill" className="h-11 px-6 text-base" disabled={pending}>
          {pending ? "Saving..." : "Save Changes"}
        </Button>
        <Button type="button" variant="neonPill" asChild className="h-11 px-6 text-base">
          <Link href="/logout">
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Link>
        </Button>
        {state.message ? (
          <p className={state.ok ? "text-sm text-green-300" : "text-sm text-red-300"}>{state.message}</p>
        ) : null}
      </div>
    </form>
  );
}
