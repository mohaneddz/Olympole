import { AdminSettingsPanel } from "@/components/admin/AdminSettingsPanel";
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
      <AdminSettingsPanel initialSettings={settings} />
    </div>
  );
}

