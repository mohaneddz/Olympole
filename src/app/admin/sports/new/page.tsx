import { createSportAction } from "@/app/actions/events";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { requireAdmin } from "@/lib/auth";
import { PlusCircle, Shield } from "lucide-react";

export default async function AdminNewSportPage() {
  await requireAdmin();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        icon={<Shield className="h-3.5 w-3.5" />}
        title="New Sport"
        description="Create or update a sport."
      />

      <section className="rounded-2xl border border-card-border bg-card-bg/20 p-5">
        <form action={createSportAction} className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <input name="name" required placeholder="Sport name" className="h-10 rounded border border-card-border bg-background px-3" />
          <input name="slug" required placeholder="sport-slug" className="h-10 rounded border border-card-border bg-background px-3" />
          <select name="sport_type" className="h-10 rounded border border-card-border bg-background px-3">
            <option value="collective">collective</option>
            <option value="individual">individual</option>
            <option value="culture">culture</option>
          </select>
          <select name="is_team_based" defaultValue="false" className="h-10 rounded border border-card-border bg-background px-3">
            <option value="false">solo</option>
            <option value="true">team based</option>
          </select>
          <input name="gender_division" placeholder="mixed / men_women" className="h-10 rounded border border-card-border bg-background px-3" />
          <textarea name="description" placeholder="Description" className="md:col-span-3 min-h-20 rounded border border-card-border bg-background px-3 py-2" />
          <button className="md:col-span-3 inline-flex items-center justify-center gap-2 rounded-lg border border-primary/60 px-3 py-2 text-sm">
            <PlusCircle className="h-4 w-4" />
            Save Sport
          </button>
        </form>
      </section>
    </div>
  );
}
