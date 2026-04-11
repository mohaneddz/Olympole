"use client";

import { useActionState, useRef, useState } from "react";
import { CalendarCheck2, Mail, MapPin, Shield, Sparkles, Upload } from "lucide-react";
import { uploadProfileAvatarAction } from "@/app/actions/profile";
import { createAvatarGradient } from "@/lib/avatar-gradient";

type ProfileHeaderCardProps = {
  displayName: string;
  displayEmail: string;
  schoolLabel: string;
  timezone: string;
  yearLabel: string;
  avatarUrl: string | null;
  initials: string;
  registrationsCount: number;
  predictionsCount: number;
  roleLabel: string;
  avatarSeed: string;
};

export function ProfileHeaderCard({
  displayName,
  displayEmail,
  schoolLabel,
  timezone,
  yearLabel,
  avatarUrl,
  initials,
  registrationsCount,
  predictionsCount,
  roleLabel,
  avatarSeed,
}: ProfileHeaderCardProps) {
  const uploadFormRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadState, uploadFormAction, uploading] = useActionState(uploadProfileAvatarAction, { ok: false, message: "" });
  const [previewUrl, setPreviewUrl] = useState<string | null>(avatarUrl);
  const [avatarVariant, setAvatarVariant] = useState(0);
  const avatarFallback = createAvatarGradient(`${avatarSeed}:${avatarVariant}`);

  return (
    <section className="rounded-3xl border border-cyan-300/20 bg-[linear-gradient(130deg,rgba(4,17,50,0.82),rgba(3,10,32,0.92))] p-6 shadow-2xl backdrop-blur-xl md:p-9">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex flex-col items-center gap-3">
            <div className="group relative h-36 w-36 shrink-0 overflow-hidden rounded-full border-4 border-cyan-300/70 bg-background">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="Profile avatar" className="h-full w-full object-cover" />
              ) : (
                <button
                  type="button"
                  onClick={() => setAvatarVariant((value) => value + 1)}
                  className="relative flex h-full w-full items-center justify-center overflow-hidden transition-opacity hover:opacity-90"
                  title="Click to randomize avatar"
                >
                  <div
                    className="relative flex h-full w-full items-center justify-center overflow-hidden"
                    style={{ backgroundImage: avatarFallback.backgroundImage }}
                  >
                    <span
                      className="relative z-10 text-4xl font-black"
                      style={{ color: avatarFallback.textColor }}
                    >
                      {initials}
                    </span>
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 opacity-20 mix-blend-soft-light"
                      style={{
                        backgroundImage: "radial-gradient(rgba(255,255,255,0.9) 0.6px, transparent 0.6px)",
                        backgroundSize: "3px 3px",
                      }}
                    />
                  </div>
                </button>
              )}
              <span className="pointer-events-none absolute inset-0" />
            </div>

            <div className="flex items-center gap-2">
              <form ref={uploadFormRef} action={uploadFormAction}>
                <input
                  ref={fileInputRef}
                  type="file"
                  name="avatar"
                  accept=".png,.jpg,.jpeg,.webp,.avif,.heic,image/png,image/jpg,image/jpeg,image/webp,image/avif,image/heic,image/heif"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) {
                      return;
                    }
                    setPreviewUrl(URL.createObjectURL(file));
                    uploadFormRef.current?.requestSubmit();
                  }}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/45 bg-cyan-400/20 px-3 py-1 text-xs font-semibold text-cyan-50 transition-colors hover:bg-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-55"
                >
                  <Upload className="h-3.5 w-3.5" />
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </form>
            </div>
            {uploadState.message ? (
              <p className={`max-w-[220px] text-center text-xs ${uploadState.ok ? "text-green-300" : "text-red-300"}`}>
                {uploadState.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black uppercase tracking-tight text-white md:text-5xl">{displayName}</h1>
            <p className="text-xl text-cyan-50/90">{roleLabel}</p>
            <p className="text-base text-cyan-100/70">{schoolLabel}</p>

            <p className="flex items-center gap-2 text-lg text-cyan-50/90">
              <Mail className="h-5 w-5 text-violet-300" />
              {displayEmail}
            </p>
            <p className="flex items-center gap-2 text-lg text-cyan-100/85">
              <MapPin className="h-5 w-5 text-violet-300" />
              {timezone} {yearLabel ? ` • Year ${yearLabel}` : ""}
            </p>
          </div>
        </div>

      </div>

      <div className="mt-7 hidden grid-cols-1 gap-3 sm:grid-cols-3 md:grid">
        <div className="rounded-2xl border border-cyan-300/20 bg-background/30 p-4">
          <p className="flex items-center gap-2 text-sm text-cyan-100/70">
            <CalendarCheck2 className="h-4 w-4 text-violet-300" />
            Registrations
          </p>
          <p className="mt-2 text-3xl font-bold text-white">{registrationsCount}</p>
        </div>
        <div className="rounded-2xl border border-cyan-300/20 bg-background/30 p-4">
          <p className="flex items-center gap-2 text-sm text-cyan-100/70">
            <Sparkles className="h-4 w-4 text-cyan-300" />
            Predictions
          </p>
          <p className="mt-2 text-3xl font-bold text-white">{predictionsCount}</p>
        </div>
        <div className="rounded-2xl border border-cyan-300/20 bg-background/30 p-4">
          <p className="flex items-center gap-2 text-sm text-cyan-100/70">
            <Shield className="h-4 w-4 text-emerald-300" />
            Role
          </p>
          <p className="mt-2 text-3xl font-bold text-white">{roleLabel}</p>
        </div>
      </div>
    </section>
  );
}
