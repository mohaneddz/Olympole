"use client";

import Link from "next/link";
import {
  deleteLiveStreamAction,
  updateLiveStreamDetailsAction,
  updateLiveStreamStatusAction,
} from "@/app/actions/events";
import { AdminDataTable } from "@/components/admin/AdminDataTable";

type LiveStreamRow = {
  id: string;
  title: string;
  description: string | null;
  status: "draft" | "live" | "ended";
  access: "public" | "private";
  playback_url: string | null;
  starts_at: string | null;
  ends_at: string | null;
  event_id: string | null;
  event_title: string | null;
};

function toDateTimeLocalValue(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function formatDate(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export function AdminLiveStreamsDashboard({
  streams,
  events,
}: {
  streams: LiveStreamRow[];
  events: Array<{ id: string; title: string }>;
}) {
  return (
    <AdminDataTable
      title="Live Streams"
      rows={streams}
      searchPlaceholder="Search streams by title, event, status..."
      searchKeys={["title", "event_title", "status", "access"]}
      filters={[
        {
          key: "status",
          label: "Status",
          options: [
            { label: "Draft", value: "draft" },
            { label: "Live", value: "live" },
            { label: "Ended", value: "ended" },
          ],
        },
        {
          key: "access",
          label: "Access",
          options: [
            { label: "Public", value: "public" },
            { label: "Private", value: "private" },
          ],
        },
      ]}
      columns={[
        {
          key: "title",
          label: "Title",
          sortable: true,
          className: "w-1/3 min-w-[250px]",
          render: (row) => (
            <div className="flex flex-col gap-1">
              <p className="font-semibold text-base">{row.title}</p>
              <p className="text-xs text-foreground/60">{row.event_title ?? "No linked event"}</p>
            </div>
          ),
        },
        { 
          key: "status", 
          label: "Status", 
          sortable: true,
          className: "w-28",
          render: (row) => (
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              row.status === 'live' ? 'bg-red-400/10 text-red-400 border border-red-400/20' : 
              row.status === 'draft' ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20' : 
              'bg-foreground/10 text-foreground/70 border border-foreground/20'
            }`}>
              {row.status}
            </span>
          ) 
        },
        { 
          key: "access", 
          label: "Access", 
          sortable: true,
          className: "w-28",
          render: (row) => <span className="text-sm capitalize text-foreground/80">{row.access}</span>
        },
        {
          key: "starts_at",
          label: "Schedule",
          sortable: true,
          className: "min-w-[200px]",
          render: (row) => (
            <div className="flex flex-col space-y-1 text-sm text-foreground/80">
              <span className="whitespace-nowrap">{formatDate(row.starts_at)} <span className="text-foreground/40 mx-1">→</span></span>
              <span className="whitespace-nowrap">{formatDate(row.ends_at)}</span>
            </div>
          ),
        },
      ]}
      renderActions={(row) => (
        <div className="w-[220px] space-y-2">
          <form action={updateLiveStreamStatusAction} className="flex items-center gap-2">
            <input type="hidden" name="id" value={row.id} />
            <select
              name="status"
              defaultValue={row.status}
              className="h-9 rounded-lg border border-card-border bg-background px-2 text-xs"
            >
              <option value="draft">draft</option>
              <option value="live">live</option>
              <option value="ended">ended</option>
            </select>
            <button className="rounded-lg border border-card-border px-2 py-1 text-xs">Apply</button>
          </form>

          <details className="rounded-lg border border-card-border/70 p-2 text-xs">
            <summary className="cursor-pointer text-foreground/85">Edit stream</summary>
            <form action={updateLiveStreamDetailsAction} className="mt-2 space-y-2">
              <input type="hidden" name="id" value={row.id} />
              <input type="hidden" name="status" value={row.status} />
              <input
                name="title"
                defaultValue={row.title}
                required
                className="h-8 w-full rounded border border-card-border bg-background px-2"
              />
              <textarea
                name="description"
                defaultValue={row.description ?? ""}
                className="min-h-14 w-full rounded border border-card-border bg-background px-2 py-1"
              />
              <input
                name="playback_url"
                defaultValue={row.playback_url ?? ""}
                placeholder="https://..."
                className="h-8 w-full rounded border border-card-border bg-background px-2"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  name="access"
                  defaultValue={row.access}
                  className="h-8 rounded border border-card-border bg-background px-2"
                >
                  <option value="public">public</option>
                  <option value="private">private</option>
                </select>
                <select
                  name="event_id"
                  defaultValue={row.event_id ?? ""}
                  className="h-8 rounded border border-card-border bg-background px-2"
                >
                  <option value="">No event</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="datetime-local"
                  name="starts_at"
                  defaultValue={toDateTimeLocalValue(row.starts_at)}
                  className="h-8 rounded border border-card-border bg-background px-2"
                />
                <input
                  type="datetime-local"
                  name="ends_at"
                  defaultValue={toDateTimeLocalValue(row.ends_at)}
                  className="h-8 rounded border border-card-border bg-background px-2"
                />
              </div>
              <button className="rounded border border-card-border px-2 py-1">Save</button>
            </form>
          </details>

          <div className="flex items-center gap-2">
            <form action={deleteLiveStreamAction}>
              <input type="hidden" name="id" value={row.id} />
              <button className="rounded-lg border border-red-500/60 px-2 py-1 text-xs text-red-300">
                Delete
              </button>
            </form>
            {row.playback_url ? (
              <Link
                href={row.playback_url}
                target="_blank"
                className="rounded-lg border border-card-border px-2 py-1 text-xs"
              >
                Open
              </Link>
            ) : null}
          </div>
        </div>
      )}
    />
  );
}
