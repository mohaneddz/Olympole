"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  GitBranch,
  LayoutDashboard,
  FlagTriangleRight,
  Palette,
  Radio,
  Settings,
  Shield,
  Trophy,
  Users,
  UsersRound,
} from "lucide-react";

const navGroups = [
  {
    title: "Core",
    links: [
      { href: "/admin", label: "Overview", icon: LayoutDashboard },
      { href: "/admin/events", label: "Event Management", icon: Trophy },
      { href: "/admin/matches", label: "Matches", icon: FlagTriangleRight },
      { href: "/admin/live", label: "Live Streams", icon: Radio },
    ],
  },
  {
    title: "Programs",
    links: [
      { href: "/admin/sports", label: "Sports", icon: Shield },
      { href: "/admin/teams", label: "Teams", icon: UsersRound },
      { href: "/admin/culture", label: "Culture", icon: Palette },
      { href: "/admin/tournaments", label: "Tournaments", icon: GitBranch },
    ],
  },
  {
    title: "Management",
    links: [
      { href: "/admin/registrations", label: "Registrations", icon: ClipboardList },
      { href: "/admin/users", label: "User Management", icon: Users },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 overflow-y-auto p-4">
      <div className="space-y-4">
        {navGroups.map((group) => (
          <section key={group.title}>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/45">
              {group.title}
            </p>
            <div className="mt-2 space-y-1">
              {group.links.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      "flex items-center gap-3 rounded-md border px-3 py-2.5 text-sm transition-colors",
                      isActive
                        ? "border-cyan-300/40 bg-cyan-400/10 text-cyan-100"
                        : "border-transparent text-foreground/70 hover:border-cyan-300/20 hover:bg-white/5 hover:text-foreground",
                    ].join(" ")}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
            <div className="mt-4 border-t border-card-border/60" />
          </section>
        ))}
      </div>
    </nav>
  );
}
