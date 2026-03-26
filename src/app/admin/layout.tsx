import Link from "next/link";
import { LayoutDashboard, Users, Trophy, Settings, Activity } from "lucide-react";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background text-foreground flex-1">
      <aside className="w-full md:w-64 bg-card-bg border-r border-card-border flex-shrink-0 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-card-border">
          <span className="text-xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            OLYMPOLE <span className="text-foreground">ADMIN</span>
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-white/5 text-foreground/70 hover:text-foreground transition-colors"><LayoutDashboard className="w-5 h-5" />Overview</Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-white/5 text-foreground/70 hover:text-foreground transition-colors"><Users className="w-5 h-5" />Registrations</Link>
          <Link href="/admin/events" className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-white/5 text-foreground/70 hover:text-foreground transition-colors"><Trophy className="w-5 h-5" />Event Management</Link>
          <Link href="/admin/system" className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-white/5 text-foreground/70 hover:text-foreground transition-colors"><Activity className="w-5 h-5" />System Status</Link>
        </nav>

        <div className="p-4 border-t border-card-border space-y-2">
          <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-white/5 text-foreground/70 hover:text-foreground transition-colors"><Settings className="w-5 h-5" />Settings</Link>
          <Link href="/logout" className="block w-full text-left px-4 py-3 rounded-md border border-card-border hover:border-primary/50">Sign Out</Link>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-[#020205]">
        <header className="h-16 flex items-center justify-between px-8 border-b border-card-border bg-card-bg/50 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-lg font-semibold border-l-2 border-primary pl-3">Control Center</h2>
          <div className="hidden sm:flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span><span className="text-sm text-foreground/60">Protected</span></div>
        </header>
        <div className="flex-1 p-8 overflow-auto">{children}</div>
      </main>
    </div>
  );
}
