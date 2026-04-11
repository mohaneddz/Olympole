"use client";

import { useActionState } from "react";
import Link from "next/link";
import { deleteAccountAction } from "@/app/actions/profile";
import { Button } from "@/components/ui/Button";
import { ChevronDown, Lock, LogOut, UserRound } from "lucide-react";

type ProfileDefaults = {
  full_name: string | null;
  school: string | null;
  year_of_study: string | null;
  student_id: string | null;
  username: string | null;
  phone: string | null;
  bio: string | null;
  timezone: string | null;
};

const disabledFieldClass =
  "h-12 w-full rounded-xl border border-cyan-300/20 bg-background/45 px-3 text-cyan-50 placeholder:text-cyan-100/35 disabled:cursor-not-allowed disabled:border-cyan-200/10 disabled:bg-background/20 disabled:text-cyan-100/45 disabled:opacity-100";

export function ProfileSettingsForm({ profile }: { profile: ProfileDefaults }) {
  const [deleteState, deleteFormAction, deleting] = useActionState(deleteAccountAction, { ok: false, message: "" });

  return (
    <section className="flex h-full flex-col rounded-3xl border border-cyan-300/20 bg-[linear-gradient(130deg,rgba(4,17,50,0.82),rgba(3,10,32,0.92))] p-6 shadow-[0_0_0_1px_rgba(34,211,238,0.12)] md:p-8">
      <div>
        <h2 className="flex items-center gap-2 text-3xl font-black text-white">
          <UserRound className="h-6 w-6 text-violet-300" />
          Profile Information
        </h2>
        <p className="mt-1 flex items-center gap-2 text-cyan-100/65">
          <Lock className="h-4 w-4" />
          Editing is disabled for this section.
        </p>
      </div>

      <div className="mt-7 grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-sm text-cyan-100/85">Full Name</span>
          <input
            name="full_name"
            defaultValue={profile.full_name ?? ""}
            placeholder="Full name"
            disabled
            className={disabledFieldClass}
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-sm text-cyan-100/85">Username</span>
          <input
            name="username"
            defaultValue={profile.username ?? ""}
            placeholder="Username"
            disabled
            className={disabledFieldClass}
          />
        </label>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-sm text-cyan-100/85">School</span>
          <div className="relative">
            <select
              name="school"
              defaultValue={profile.school ?? ""}
              disabled
              className={`profile-select appearance-none pr-10 ${disabledFieldClass}`}
            >
              <option value="">Select school</option>
              <option value="ENSIA">ENSIA</option>
              <option value="NHSM">NHSM</option>
              <option value="NSNN">NSNN</option>
              <option value="ENSSA">ENSSA</option>
              <option value="ENSCS">ENSCS</option>
              <option value="ESI">ESI</option>
              <option value="Others">Others</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-100/40" />
          </div>
        </label>
        <label className="space-y-1.5">
          <span className="text-sm text-cyan-100/85">Year</span>
          <div className="relative">
            <select
              name="year_of_study"
              defaultValue={profile.year_of_study ?? ""}
              disabled
              className={`profile-select appearance-none pr-10 ${disabledFieldClass}`}
            >
              <option value="">Year</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="other">other</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-100/40" />
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
            disabled
            className={disabledFieldClass}
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-sm text-cyan-100/85">Student ID</span>
          <input
            name="student_id"
            defaultValue={profile.student_id ?? ""}
            placeholder="e.g. 23233431...."
            disabled
            className={disabledFieldClass}
          />
        </label>
      </div>

      <label className="mt-4 block space-y-1.5">
        <span className="text-sm text-cyan-100/85">Short Bio</span>
        <textarea
          name="bio"
          defaultValue={profile.bio ?? ""}
          placeholder="Short bio"
          disabled
          className="min-h-24 w-full rounded-xl border border-cyan-300/20 bg-background/45 px-3 py-2 text-cyan-50 placeholder:text-cyan-100/35 disabled:cursor-not-allowed disabled:border-cyan-200/10 disabled:bg-background/20 disabled:text-cyan-100/45 disabled:opacity-100"
        />
      </label>

      <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <Button type="button" variant="neonPill" asChild className="h-11 px-6 text-base">
          <Link href="/logout">
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Link>
        </Button>

        <form action={deleteFormAction}>
          <Button
            type="submit"
            variant="outline"
            className="h-11 rounded-full border-red-400/60 bg-transparent px-6 text-base text-red-300 hover:bg-red-500/10 hover:text-red-200"
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete account"}
          </Button>
        </form>
      </div>

      {deleteState.message ? (
        <p className={`mt-3 text-sm ${deleteState.ok ? "text-green-400" : "text-red-400"}`}>
          {deleteState.message}
        </p>
      ) : null}
    </section>
  );
}
