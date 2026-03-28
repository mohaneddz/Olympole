import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updateRegistrationStatusAction } from "@/app/actions/registrations";

export default async function AdminUsersPage() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data: registrations } = await supabase
    .from("registrations")
    .select("id, full_name, email, category_type, status, attendance_status, created_at, events(title)")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Registrations</h1>
      <div className="overflow-x-auto rounded-xl border border-card-border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-card-bg border-b border-card-border text-foreground/60">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Category</th>
              <th className="p-3">Event</th>
              <th className="p-3">Status</th>
              <th className="p-3">Attendance</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(registrations ?? []).map((row) => {
              const event = row.events as { title?: string } | Array<{ title?: string }> | null;
              const eventTitle = Array.isArray(event) ? event[0]?.title : event?.title;

              return (
              <tr key={row.id} className="border-b border-card-border/50">
                <td className="p-3">{row.full_name}</td>
                <td className="p-3">{row.email}</td>
                <td className="p-3">{row.category_type}</td>
                <td className="p-3">{eventTitle ?? "-"}</td>
                <td className="p-3">{row.status}</td>
                <td className="p-3">{row.attendance_status}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    {(["pending", "approved", "rejected"] as const).map((status) => (
                      <form key={status} action={updateRegistrationStatusAction}>
                        <input type="hidden" name="id" value={row.id} />
                        <input type="hidden" name="status" value={status} />
                        <button className="px-2 py-1 text-xs border rounded border-card-border hover:border-primary">{status}</button>
                      </form>
                    ))}
                  </div>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  );
}
