import { updateSettingAction } from "@/app/actions/settings";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { requireAdmin } from "@/lib/auth";
import { getAppSettings } from "@/lib/queries";
import { Settings } from "lucide-react";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const settings = await getAppSettings();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={<Settings className="h-3.5 w-3.5" />}
        title="Runtime Settings"
        description="Toggle runtime behavior and registration limits."
        stats={[
          {
            label: "Enabled Flags",
            value: Object.values(settings).filter((value) => value === true).length,
          },
        ]}
      />
      <div className="space-y-3">
        {Object.entries(settings)
          .filter(([key]) => key !== "registration_max_events_per_user")
          .map(([key, value]) => (
            <form key={key} action={updateSettingAction} className="p-4 rounded-xl border border-card-border flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold">{key}</p>
                <p className="text-sm text-foreground/60">Toggle this feature for public usage.</p>
              </div>
              <input type="hidden" name="key" value={key} />
              <input type="hidden" name="value" value={String(!value)} />
              <button className="px-3 py-2 rounded border border-primary/50">{value ? "Disable" : "Enable"}</button>
            </form>
          ))}

        <form action={updateSettingAction} className="p-4 rounded-xl border border-card-border flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-semibold">registration_max_events_per_user</p>
            <p className="text-sm text-foreground/60">Maximum allowed event enrollments per user.</p>
          </div>
          <div className="flex items-center gap-2">
            <input type="hidden" name="key" value="registration_max_events_per_user" />
            <input
              name="value"
              defaultValue={settings.registration_max_events_per_user}
              type="number"
              min={1}
              max={20}
              className="h-10 w-24 px-3 rounded bg-background border border-card-border"
            />
            <button className="px-3 py-2 rounded border border-primary/50">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
