import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { getCurrentUser } from "@/lib/auth";
import { MobileNavMenu } from "@/components/MobileNavMenu";

const navItems = [
  { name: "Sports", href: "/sports" },
  { name: "Culture", href: "/culture" },
  { name: "Live", href: "/live" },
  { name: "Schedule", href: "/schedule" },
  { name: "Fantasy", href: "/predictions" },
];

export async function Navbar() {
  const user = await getCurrentUser();
  const accountHref = user ? "/profile" : "/register";
  const accountLabel = user ? "Profile" : "Register";

  return (
    <header className="sticky top-0 z-50 w-full overflow-visible bg-[linear-gradient(90deg,rgba(2,22,56,0.68),rgba(0,40,92,0.72),rgba(2,22,56,0.68))] shadow-lg backdrop-blur-xl">
      <div className="relative mx-auto flex min-h-20 w-full max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="relative z-10 flex min-w-0 items-center gap-3">
          <Image
            src="/images/brand/esc.webp"
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
          <Button variant="neonPill" size="pill" asChild>
            <Link href={accountHref}>{accountLabel}</Link>
          </Button>
        </div>

        <MobileNavMenu navItems={navItems} accountHref={accountHref} accountLabel={accountLabel} />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-cyan-300/40" />
    </header>
  );
}
