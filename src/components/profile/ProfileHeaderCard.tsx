"use client";

import { startTransition, useActionState, useRef, useState } from "react";
import { uploadProfileAvatarAction } from "@/app/actions/profile";
import { CalendarCheck2, Mail, MapPin, Shield, Sparkles } from "lucide-react";

const initialState = { ok: false, message: "" };
const MAX_SOURCE_FILE_SIZE = 8 * 1024 * 1024;
const MAX_OUTPUT_SIDE = 640;

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
};

async function convertToWebp(file: File) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_OUTPUT_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Failed to prepare image conversion.");
  }

  context.drawImage(bitmap, 0, 0, width, height);
  const webpBlob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", 0.88)
  );

  if (!webpBlob) {
    throw new Error("Failed to generate .webp avatar.");
  }

  return new File([webpBlob], `avatar-${Date.now()}.webp`, { type: "image/webp" });
}

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
}: ProfileHeaderCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(avatarUrl);
  const [localError, setLocalError] = useState("");
  const [state, action, pending] = useActionState(uploadProfileAvatarAction, initialState);

  async function onAvatarPick(event: React.ChangeEvent<HTMLInputElement>) {
    const sourceFile = event.target.files?.[0];
    setLocalError("");
    if (!sourceFile) {
      return;
    }

    if (!sourceFile.type.startsWith("image/")) {
      setLocalError("Please select an image file.");
      return;
    }

    if (sourceFile.size > MAX_SOURCE_FILE_SIZE) {
      setLocalError("Image is too large. Maximum allowed size is 8MB.");
      return;
    }

    try {
      const converted = await convertToWebp(sourceFile);
      setPreviewUrl(URL.createObjectURL(converted));
      const formData = new FormData();
      formData.set("avatar", converted);
      startTransition(() => action(formData));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to process image.";
      setLocalError(message);
    }
  }

  return (
    <section className="rounded-3xl border border-cyan-300/20 bg-[linear-gradient(130deg,rgba(4,17,50,0.82),rgba(3,10,32,0.92))] p-6 shadow-2xl backdrop-blur-xl md:p-9">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group relative h-36 w-36 shrink-0 cursor-pointer overflow-hidden rounded-full border-4 border-cyan-300/70 bg-background transition-transform hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-cyan-300/75"
            >
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="Profile avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl font-black text-cyan-100/90">
                  {initials}
                </div>
              )}
              <span className="pointer-events-none absolute inset-0 bg-cyan-300/0 transition-colors group-hover:bg-cyan-300/10" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onAvatarPick}
            />
            <p className="text-xs text-cyan-100/70">
              {pending ? "Uploading..." : "Click photo to change"}
            </p>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-black uppercase tracking-tight text-white md:text-5xl">{displayName}</h1>
            <p className="text-xl text-cyan-50/90">Olympole Participant</p>
            <p className="text-base text-cyan-100/70">{schoolLabel}</p>
            <p className="flex items-center gap-2 text-lg text-cyan-50/90">
              <Mail className="h-5 w-5 text-violet-300" />
              {displayEmail}
            </p>
            <p className="flex items-center gap-2 text-lg text-cyan-100/85">
              <MapPin className="h-5 w-5 text-violet-300" />
              {timezone} {yearLabel ? ` • Year ${yearLabel}` : ""}
            </p>
            {(localError || state.message) ? (
              <p className={state.ok ? "text-sm text-green-300" : "text-sm text-red-300"}>
                {localError || state.message}
              </p>
            ) : null}
          </div>
        </div>

      </div>

      <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
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
