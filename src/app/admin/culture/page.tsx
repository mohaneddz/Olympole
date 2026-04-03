import { moderateWritingAction } from "@/app/actions/writing";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Palette } from "lucide-react";

export default async function AdminCulturePage() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data: writings } = await supabase
    .from("writing_submissions")
    .select("id,title,status,is_featured,created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const pendingCount = (writings ?? []).filter((entry) => entry.status === "draft").length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={<Palette className="h-3.5 w-3.5" />}
        title="Culture"
        description="Review and moderate writing submissions."
        stats={[
          { label: "Submissions", value: writings?.length ?? 0 },
          { label: "Pending Review", value: pendingCount, tone: "warning" },
        ]}
      />

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Writing Submissions</h2>
        <div className="space-y-3">
          {(writings ?? []).map((writing) => (
            <form key={writing.id} action={moderateWritingAction} className="rounded-xl border border-card-border p-4">
              <input type="hidden" name="id" value={writing.id} />
              <div className="flex flex-wrap items-center gap-3">
                <p className="flex-1 min-w-64 font-medium">{writing.title}</p>
                <p className="text-xs text-foreground/60">{new Date(writing.created_at).toLocaleString()}</p>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <select name="status" defaultValue={writing.status} className="h-10 rounded border border-card-border bg-background px-2">
                  <option value="draft">draft</option>
                  <option value="published">published</option>
                  <option value="rejected">rejected</option>
                </select>
                <select
                  name="is_featured"
                  defaultValue={String(writing.is_featured)}
                  className="h-10 rounded border border-card-border bg-background px-2"
                >
                  <option value="false">Not featured</option>
                  <option value="true">Featured</option>
                </select>
                <button className="rounded border border-primary/60 px-3 py-2">Apply</button>
              </div>
            </form>
          ))}
        </div>
      </section>
    </div>
  );
}
