"use client";

import { useMemo, useState } from "react";
import { deleteEventAction } from "@/app/actions/events";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { EventFormDialog } from "@/components/admin/EventFormDialog";
import { Calendar, Pencil, Trash2 } from "lucide-react";

type ScheduleEvent = {
  id: string;
  title: string;
  slug: string;
  type: "sport" | "culture" | "ceremony" | "mini_game";
  category: string;
  venue: string;
  starts_at: string;
  ends_at: string;
  status: "draft" | "scheduled" | "live" | "completed" | "cancelled";
  description: string | null;
  sport_id: string | null;
  activity_id: string | null;
  show_in_schedule: boolean;
  registration_deadline: string | null;
  max_participants: number | null;
  is_registration_open: boolean | null;
  is_featured: boolean | null;
  visibility: "public" | "private";
  current_round: string | null;
  icon_key: string | null;
  activities?: { id: string; title: string; slug: string; category: "collective_sport" | "individual_sport" | "culture" } | null;
};

type SportOption = {
  id: string;
  name: string;
};

type ActivityOption = {
  id: string;
  slug: string;
  title: string;
  category: "collective_sport" | "individual_sport" | "culture";
  is_active: boolean;
};

type CategoryTab = "collective_sport" | "individual_sport" | "culture";

const tabMeta: Record<CategoryTab, { label: string }> = {
  collective_sport: { label: "Collective Sports" },
  individual_sport: { label: "Individual Sports" },
  culture: { label: "Culture Events" },
};

function extractActivity(event: ScheduleEvent) {
  return Array.isArray(event.activities) ? event.activities[0] : event.activities;
}

function inferCategory(event: ScheduleEvent): CategoryTab {
  const activity = extractActivity(event);
  if (activity?.category) {
    return activity.category;
  }
  if (event.type === "culture") {
    return "culture";
  }
  return "collective_sport";
}

function formatDate(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export function AdminScheduleDashboard({
  events,
  sports,
  activities,
}: {
  events: ScheduleEvent[];
  sports: SportOption[];
  activities: ActivityOption[];
}) {
  const [activeTab, setActiveTab] = useState<CategoryTab>("collective_sport");

  const filteredRows = useMemo(
    () => events.filter((event) => inferCategory(event) === activeTab),
    [activeTab, events]
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(tabMeta) as CategoryTab[]).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-xl border px-4 py-2 text-sm transition ${
                isActive
                  ? "border-cyan-200/60 bg-cyan-400/20 text-cyan-50"
                  : "border-cyan-300/20 bg-cyan-400/5 text-cyan-100/85 hover:bg-cyan-400/12"
              }`}
            >
              {tabMeta[tab].label}
            </button>
          );
        })}
      </div>

      <AdminDataTable
        title={`${tabMeta[activeTab].label} Schedule`}
        rows={filteredRows}
        searchPlaceholder="Search events by title, venue, activity..."
        searchKeys={["title", "venue", "category", "slug"]}
        filters={[
          {
            key: "status",
            label: "Status",
            options: [
              { label: "Draft", value: "draft" },
              { label: "Scheduled", value: "scheduled" },
              { label: "Live", value: "live" },
              { label: "Completed", value: "completed" },
              { label: "Cancelled", value: "cancelled" },
            ],
          },
          {
            key: "show_in_schedule",
            label: "Schedule Visibility",
            options: [
              { label: "Shown", value: "true" },
              { label: "Hidden", value: "false" },
            ],
          },
        ]}
        columns={[
          {
            key: "title",
            label: "Event",
            sortable: true,
            render: (row) => (
              <div>
                <p className="font-semibold">{row.title}</p>
                <p className="text-xs text-foreground/60">{extractActivity(row)?.title ?? row.category}</p>
              </div>
            ),
          },
          { key: "venue", label: "Venue", sortable: true },
          {
            key: "starts_at",
            label: "Starts",
            sortable: true,
            render: (row) => (
              <div className="inline-flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-cyan-200/75" />
                {formatDate(row.starts_at)}
              </div>
            ),
          },
          { key: "status", label: "Status", sortable: true },
          {
            key: "show_in_schedule",
            label: "Public Schedule",
            sortable: true,
            render: (row) => (row.show_in_schedule ? "Shown" : "Hidden"),
          },
        ]}
        renderActions={(row) => (
          <div className="flex items-center gap-2">
            <EventFormDialog
              mode="edit"
              sports={sports}
              activities={activities}
              event={{
                id: row.id,
                title: row.title,
                slug: row.slug,
                type: row.type,
                category: row.category,
                venue: row.venue,
                starts_at: row.starts_at,
                ends_at: row.ends_at,
                status: row.status,
                description: row.description,
                sport_id: row.sport_id,
                activity_id: row.activity_id,
                show_in_schedule: row.show_in_schedule,
                registration_deadline: row.registration_deadline,
                max_participants: row.max_participants,
                is_registration_open: row.is_registration_open,
                is_featured: row.is_featured,
                visibility: row.visibility,
                current_round: row.current_round,
                icon_key: row.icon_key,
              }}
              triggerClassName="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-300/40 text-cyan-100 hover:bg-cyan-400/15"
              trigger={
                <>
                  <Pencil className="h-3.5 w-3.5" />
                  <span className="sr-only">Edit event</span>
                </>
              }
            />
            <form action={deleteEventAction}>
              <input type="hidden" name="id" value={row.id} />
              <button
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/60 text-red-300 hover:bg-red-500/15"
                title="Delete event"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        )}
      />
    </div>
  );
}
