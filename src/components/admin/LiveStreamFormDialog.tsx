"use client";

import { createLiveStreamAction, updateLiveStreamDetailsAction } from "@/server/live-streams";
import { Edit2, PlusCircle, X } from "lucide-react";
import { useRef, useState } from "react";

export type LiveStreamData = {
  id?: string;
  title: string;
  description: string | null;
  status: "draft" | "live" | "ended";
  access: "public" | "private";
  playback_url: string | null;
  starts_at: string | null;
  ends_at: string | null;
  event_id: string | null;
};

function toDateTimeLocalValue(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function LiveStreamFormDialog({ 
  mode,
  stream,
  events,
  triggerClassName
}: { 
  mode: "create" | "edit";
  stream?: LiveStreamData;
  events: Array<{ id: string; title: string }>;
  triggerClassName?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className={triggerClassName || "inline-flex items-center gap-2 rounded-lg border border-cyan-300/40 bg-cyan-400/10 px-3 py-2 text-sm font-medium text-cyan-100 transition-colors hover:bg-cyan-400/20"}
      >
        {mode === "create" ? <PlusCircle className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
        {mode === "create" ? "Create New Live Stream" : ""}
      </button>

      <dialog
        ref={dialogRef}
        className="backdrop:bg-background/80 w-full max-w-2xl rounded-2xl border border-card-border bg-card-bg p-0 shadow-2xl open:animate-in open:fade-in-0 open:zoom-in-95"
      >
        <div className="flex items-center justify-between border-b border-card-border px-6 py-4">
          <h2 className="text-xl font-bold text-foreground">{mode === "create" ? "Create Live Stream" : "Edit Live Stream"}</h2>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="rounded-lg p-2 text-foreground/60 transition-colors hover:bg-foreground/10 hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          action={async (formData) => {
            setIsSubmitting(true);
            try {
              if (mode === "create") {
                await createLiveStreamAction(formData);
              } else {
                await updateLiveStreamDetailsAction(formData);
              }
              dialogRef.current?.close();
            } finally {
              setIsSubmitting(false);
            }
          }}
          className="p-6 text-foreground text-left"
        >
          {mode === "edit" && stream?.id && <input type="hidden" name="id" value={stream.id} />}
          
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Title</label>
              <input
                name="title"
                defaultValue={stream?.title}
                required
                placeholder="Stream title"
                className="h-10 w-full rounded-lg border border-card-border bg-background px-3 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Playback URL</label>
              <input
                name="playback_url"
                defaultValue={stream?.playback_url ?? ""}
                placeholder="https://..."
                className="h-10 w-full rounded-lg border border-card-border bg-background px-3 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-foreground/80">Description</label>
              <textarea
                name="description"
                defaultValue={stream?.description ?? ""}
                placeholder="Description"
                className="min-h-[100px] w-full rounded-lg border border-card-border bg-background p-3 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Linked Event</label>
              <select
                name="event_id"
                defaultValue={stream?.event_id ?? ""}
                className="h-10 w-full rounded-lg border border-card-border bg-background px-3 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                <option value="">No linked event</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">Status</label>
                <select
                  name="status"
                  defaultValue={stream?.status ?? "draft"}
                  className="h-10 w-full rounded-lg border border-card-border bg-background px-3 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="draft">Draft</option>
                  <option value="live">Live</option>
                  <option value="ended">Ended</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">Access</label>
                <select
                  name="access"
                  defaultValue={stream?.access ?? "public"}
                  className="h-10 w-full rounded-lg border border-card-border bg-background px-3 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Starts At</label>
              <input
                type="datetime-local"
                name="starts_at"
                defaultValue={toDateTimeLocalValue(stream?.starts_at ?? null)}
                className="h-10 w-full rounded-lg border border-card-border bg-background px-3 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Ends At</label>
              <input
                type="datetime-local"
                name="ends_at"
                defaultValue={toDateTimeLocalValue(stream?.ends_at ?? null)}
                className="h-10 w-full rounded-lg border border-card-border bg-background px-3 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 border-t border-card-border pt-4">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="rounded-lg border border-card-border bg-transparent px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-cyan-500 px-6 py-2 text-sm font-medium text-black transition-colors hover:bg-cyan-400 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Stream"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
