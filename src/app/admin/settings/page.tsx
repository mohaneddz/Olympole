import { updateSettingAction } from "@/app/actions/settings";
import { requireAdmin } from "@/lib/auth";
import { getAppSettings } from "@/lib/queries";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const settings = await getAppSettings();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Runtime Settings</h1>
      <div className="space-y-3">
        {Object.entries(settings).map(([key, value]) => (
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
      </div>
    </div>
  );
}
