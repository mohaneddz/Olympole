import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { getCurrentProfile } from "@/lib/auth";

const navItems = [
  { name: "Sports", href: "/sports" },
  { name: "Culture", href: "/culture" },
  { name: "Live", href: "/live" },
  { name: "Schedule", href: "/schedule" },
  { name: "Fantasy", href: "/predictions" },
];

export async function Navbar() {
  const profile = await getCurrentProfile();

  return (
    <header className="sticky top-0 z-50 w-full overflow-visible bg-[linear-gradient(90deg,rgba(2,22,56,0.68),rgba(0,40,92,0.72),rgba(2,22,56,0.68))] shadow-lg backdrop-blur-xl">
      <div className="relative mx-auto flex min-h-20 w-full max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="relative z-10 flex min-w-0 items-center gap-3">
          <Image
            src="/images/brand/esc.png"
            alt="ESC Club logo"
            width={52}
            height={52}
            priority
            className="h-11 w-11 sm:h-12 sm:w-12"
          />
          <span className="hidden text-sm font-semibold tracking-[0.24em] text-cyan-100/90 sm:inline">
            ESCC
          </span>
        </Link>

        <nav className="absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-7 md:flex lg:gap-9">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative block py-2 text-sm font-semibold tracking-[0.08em] text-cyan-50/85 transition-colors duration-300 hover:text-white lg:text-base"
            >
              {item.name}
              <span className="pointer-events-none absolute -bottom-1 left-0 right-0 h-0.5 origin-left scale-x-0 rounded-full bg-cyan-300 transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>

        <div className="relative z-10 ml-auto hidden items-center md:flex">
          {profile ? (
            <Button variant="neonPill" size="pill" asChild>
              <Link href="/profile">Profile</Link>
            </Button>
          ) : (
            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center rounded-full border border-cyan-300/55 bg-transparent px-5 text-sm font-semibold tracking-[0.08em] text-cyan-50/90 transition-colors hover:bg-cyan-300/10 hover:text-white lg:text-base"
            >
              Sign in
            </Link>
          )}
        </div>

        <details className="relative z-20 ml-auto md:hidden">
          <summary className="flex h-10 w-10 list-none items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-400/10 text-cyan-100 transition-colors hover:bg-cyan-300/20 [&::-webkit-details-marker]:hidden">
            <span className="sr-only">Toggle navigation menu</span>
            <span className="relative block h-4 w-5">
              <span className="absolute left-0 top-0 block h-0.5 w-5 rounded-full bg-current" />
              <span className="absolute left-0 top-1.5 block h-0.5 w-5 rounded-full bg-current" />
              <span className="absolute left-0 top-3.5 block h-0.5 w-5 rounded-full bg-current" />
            </span>
          </summary>

          <div className="absolute right-0 top-[calc(100%+0.7rem)] w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-cyan-300/35 bg-[linear-gradient(135deg,rgba(2,22,56,0.96),rgba(0,40,92,0.93))] shadow-[0_14px_38px_rgba(0,16,44,0.55)] backdrop-blur-xl">
            <nav className="flex flex-col p-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-xl px-4 py-3 text-sm font-semibold tracking-[0.08em] text-cyan-50/90 transition-colors hover:bg-cyan-300/10 hover:text-white"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="border-t border-cyan-300/25 p-2">
              {profile ? (
                <Button variant="neonPill" asChild className="h-10 w-full px-4 text-base">
                  <Link href="/profile">Profile</Link>
                </Button>
              ) : (
                <Link
                  href="/login"
                  className="block rounded-xl border border-cyan-300/55 bg-transparent px-4 py-3 text-center text-base font-semibold tracking-[0.08em] text-cyan-50/90 transition-colors hover:bg-cyan-300/10 hover:text-white"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </details>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-cyan-300/40" />
    </header>
  );
}
