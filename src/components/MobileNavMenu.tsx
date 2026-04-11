"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";

type NavItem = {
  name: string;
  href: string;
};

type MobileNavMenuProps = {
  navItems: NavItem[];
  accountHref: string;
  accountLabel: string;
};

export function MobileNavMenu({ navItems, accountHref, accountLabel }: MobileNavMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!open) return;
      if (!menuRef.current) return;

      const target = event.target as Node | null;
      if (target && !menuRef.current.contains(target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown, { passive: true });
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative z-20 ml-auto md:hidden">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls="mobile-nav-menu"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-400/10 text-cyan-100 transition-colors hover:bg-cyan-300/20"
      >
        <span className="sr-only">Toggle navigation menu</span>
        <span className="relative block h-4 w-5">
          <span className="absolute left-0 top-0 block h-0.5 w-5 rounded-full bg-current" />
          <span className="absolute left-0 top-1.5 block h-0.5 w-5 rounded-full bg-current" />
          <span className="absolute left-0 top-3.5 block h-0.5 w-5 rounded-full bg-current" />
        </span>
      </button>

      {open ? (
        <div
          id="mobile-nav-menu"
          className="absolute right-0 top-[calc(100%+0.7rem)] w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-cyan-300/35 bg-[linear-gradient(135deg,rgba(2,22,56,0.96),rgba(0,40,92,0.93))] shadow-[0_14px_38px_rgba(0,16,44,0.55)] backdrop-blur-xl"
        >
          <nav className="flex flex-col p-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-4 py-3 text-sm font-semibold tracking-[0.08em] text-cyan-50/90 transition-colors hover:bg-cyan-300/10 hover:text-white"
              >
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="border-t border-cyan-300/25 p-2">
            <Button variant="neonPill" asChild className="h-10 w-full px-4 text-sm sm:text-base">
              <Link href={accountHref} onClick={() => setOpen(false)}>
                {accountLabel}
              </Link>
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
