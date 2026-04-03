import Link from "next/link";
import { LogOut } from "lucide-react";
import { AdminSidebarNav } from "@/components/admin/AdminSidebarNav";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="flex h-[calc(100dvh-5rem)] overflow-hidden flex-col bg-background text-foreground md:flex-row">
      <aside className="w-full md:w-64 bg-card-bg border-r border-card-border flex-shrink-0 flex flex-col md:h-full">
        <div className="h-16 flex items-center px-6 border-b border-card-border">
          <span className="text-xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            OLYMPOLE <span className="text-foreground">ADMIN</span>
          </span>
        </div>

        <AdminSidebarNav />

        <div className="p-4 border-t border-card-border space-y-2">
          <Link href="/logout" className="flex items-center justify-center gap-2 rounded-md border border-card-border px-4 py-3 text-sm hover:border-primary/50">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Link>
        </div>
      </aside>

      <main className="flex-1 min-w-0 bg-[#020205] overflow-hidden">
        <div className="h-full overflow-y-auto p-8">{children}</div>
      </main>
    </div>
  );
}
