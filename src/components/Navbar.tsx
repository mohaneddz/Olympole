"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "./ui/Button";

const navItems = [
  { name: "Home", href: "/" },
  { name: "Sports", href: "/sports" },
  { name: "Culture", href: "/culture" },
  { name: "Schedule", href: "/schedule" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full pt-12 ">
      <div className="relative flex h-24 w-full items-center justify-between overflow-hidden border border-cyan-300/20 bg-[linear-gradient(90deg,rgba(2,22,56,0.1),rgba(0,40,92,0.2),rgba(2,22,56,0.1))] px-4 shadow-[0_16px_60px_rgba(0,16,44,0.1),0_0_20px_rgba(34,211,238,0.1)] backdrop-blur-xl sm:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-90%,rgba(56,189,248,0.45),transparent_50%)]" />
        <div className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
        <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />

        <div className="relative z-10 flex min-w-0 items-center gap-10">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/fire.png"
              alt="Olympole logo"
              width={56}
              height={56}
              priority
              className="drop-shadow-[0_0_18px_rgba(56,189,248,0.45)]"
            />
            <span className="hidden text-sm font-semibold tracking-[0.24em] text-cyan-100/90 sm:inline">
              ESCC
            </span>
          </Link>

          <nav className="hidden items-center gap-3 md:flex">
            {navItems.map((item) => (
              <div key={item.href} className="flex items-center gap-3">
                <Link
                  href={item.href}
                  className={cn(
                    "relative pb-1 text-xl font-medium tracking-wide text-cyan-50/85 transition-colors hover:text-cyan-100",
                    pathname === item.href &&
                      "text-cyan-100 after:absolute after:-bottom-[14px] after:left-0 after:h-[3px] after:w-full after:rounded-full after:bg-cyan-300 after:shadow-[0_0_16px_rgba(34,211,238,0.95)]"
                  )}
                >
                  {item.name}
                </Link>
                {item.href !== navItems[navItems.length - 1].href && (
                  <span className="text-cyan-100/35">|</span>
                )}
              </div>
            ))}
          </nav>
        </div>

        <div className="relative z-10 flex items-center">
          <Button variant="neonPill" size="pill" asChild>
            <Link href="/register">Register</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
