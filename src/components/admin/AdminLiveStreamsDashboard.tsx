"use client";

import Link from "next/link";
import {
  deleteLiveStreamAction,
  updateLiveStreamDetailsAction,
  updateLiveStreamStatusAction,
} from "@/app/actions/events";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { LiveStreamFormDialog } from "@/components/admin/LiveStreamFormDialog";
import { Trash2 } from "lucide-react";

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
        <div className="flex items-center gap-2">
          <LiveStreamFormDialog
            mode="edit"
            stream={row}
            events={events}
            triggerClassName="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-300/40 text-cyan-100 hover:bg-cyan-400/15"
          />
          <form action={deleteLiveStreamAction}>
            <input type="hidden" name="id" value={row.id} />
            <button
              title="Delete stream"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/60 text-red-300 hover:bg-red-500/15"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    />
  );
}
