import Link from "next/link";
import { LayoutDashboard, Users, Trophy, Settings, Activity } from "lucide-react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-background text-foreground flex-1">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-card-bg border-r border-card-border flex-shrink-0 flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-card-border">
                    <span className="text-xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                        OLYMPOLE <span className="text-foreground">ADMIN</span>
                    </span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-md bg-primary/10 text-primary font-medium transition-colors">
                        <LayoutDashboard className="w-5 h-5" />
                        Overview
                    </Link>
                    <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-white/5 text-foreground/70 hover:text-foreground transition-colors">
                        <Users className="w-5 h-5" />
                        Registrations
                    </Link>
                    <Link href="/admin/events" className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-white/5 text-foreground/70 hover:text-foreground transition-colors">
                        <Trophy className="w-5 h-5" />
                        Event Management
                    </Link>
                    <Link href="/admin/system" className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-white/5 text-foreground/70 hover:text-foreground transition-colors">
                        <Activity className="w-5 h-5" />
                        System Status
                    </Link>
                </nav>

                <div className="p-4 border-t border-card-border">
                    <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-white/5 text-foreground/70 hover:text-foreground transition-colors">
                        <Settings className="w-5 h-5" />
                        Settings
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#020205]">
                <header className="h-16 flex items-center justify-between px-8 border-b border-card-border bg-card-bg/50 backdrop-blur-md sticky top-0 z-10">
                    <h2 className="text-lg font-semibold border-l-2 border-primary pl-3">Control Center</h2>
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-sm text-foreground/60">Systems Nominal</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-primary font-bold text-xs">A</div>
                    </div>
                </header>
                <div className="flex-1 p-8 overflow-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
