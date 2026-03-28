import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { getCurrentProfile } from "@/lib/auth";

const navItems = [
  { name: "Home", href: "/" },
  { name: "Sports", href: "/sports" },
  { name: "Culture", href: "/culture" },
  { name: "Schedule", href: "/schedule" },
  { name: "Predictions", href: "/predictions" },
];

export async function Navbar() {
  const profile = await getCurrentProfile();

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="relative flex min-h-24 w-full items-center justify-between overflow-hidden border border-cyan-300/20 bg-[linear-gradient(90deg,rgba(2,22,56,0.1),rgba(0,40,92,0.2),rgba(2,22,56,0.1))] px-4 shadow-[0_16px_60px_rgba(0,16,44,0.1),0_0_20px_rgba(34,211,238,0.1)] backdrop-blur-xl sm:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-90%,rgba(56,189,248,0.45),transparent_50%)]" />

        <div className="relative z-10 flex flex-1 items-center justify-start gap-6 min-w-0">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/images/brand/fire.png" alt="Olympole logo" width={56} height={56} priority className="drop-shadow-[0_0_18px_rgba(56,189,248,0.45)]" />
            <span className="hidden text-sm font-semibold tracking-[0.24em] text-cyan-100/90 sm:inline">ESCC</span>
          </Link>
        </div>

        <nav className="relative z-10 hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-base font-medium tracking-wide text-cyan-50/85 transition-colors hover:text-cyan-100">
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="relative z-10 flex flex-1 items-center justify-end gap-3">
          {profile ? (
            <Button variant="neonPill" size="pill" asChild>
              <Link href="/profile">Profile</Link>
            </Button>
          ) : (
            <Button variant="neonPill" size="pill" asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
