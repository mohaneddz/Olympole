import Link from "next/link";
import Image from "next/image";
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
    <div className="flex h-[calc(100dvh-5rem)] min-h-0 overflow-hidden flex-col bg-background text-foreground md:fixed md:inset-x-0 md:bottom-0 md:top-20 md:h-auto md:flex-row">
      <aside className="w-full md:w-64 bg-card-bg border-r border-card-border flex-shrink-0 flex min-h-0 flex-col md:h-full">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-card-border bg-black/20 relative z-10 center ">
          <Image src="/images/brand/fire.webp" width={48} height={48} alt="Olympole Flame" className="h-8 w-auto hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
          <div className="flex flex-col">
            <span className="text-[1.1rem] leading-none font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-br from-primary via-primary/80 to-secondary">
              OLYMPOLE
            </span>
            <span className="text-[0.65rem] mt-0.5 leading-none font-bold tracking-[0.2em] text-cyan-400 uppercase drop-shadow-[0_0_2px_rgba(34,211,238,0.3)]">
              Admin Area
            </span>
          </div>
        </div>

        <AdminSidebarNav />

        <div className="p-4 border-t border-card-border space-y-2">
          <Link href="/logout" className="flex items-center justify-center gap-2 rounded-md border border-card-border px-4 py-3 text-sm hover:border-primary/50">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Link>
        </div>
      </aside>

      <main className="flex-1 min-h-0 min-w-0 bg-[#020205] overflow-hidden">
        <div className="h-full min-h-0 overflow-y-auto overscroll-contain p-8 pb-32">{children}</div>
      </main>
    </div>
  );
}
