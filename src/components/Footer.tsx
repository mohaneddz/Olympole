"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const socialLinks = [
  { name: "Instagram", href: "https://www.instagram.com/ensia.sport.culture.club/", icon: InstagramIcon },
  { name: "LinkedIn", href: "https://www.linkedin.com/company/ensia-sports-culture-club/posts/?feedView=all", icon: LinkedInIcon },
  { name: "Email", href: "mailto:escc@ensia.edu.dz", icon: GmailIcon },
  { name: "TikTok", href: "https://www.tiktok.com/@escclub", icon: TiktokIcon },
];

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="relative mt-auto w-full overflow-hidden border-t border-cyan-300/15">
      <Image
        src="/images/backgrounds/footer-background.avif"
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,19,56,0.3),rgba(6,16,44,0.62))]" />

      <div className="relative z-10 mx-auto flex min-h-64 w-full max-w-7xl flex-col items-center justify-center px-4 py-6 text-center sm:px-6 sm:py-8">
        <Image
          src="/images/brand/esc.webp"
          alt="ESC Club logo"
          width={84}
          height={84}
          className="h-auto w-14 sm:w-20"
        />

        <div className="mt-2 flex w-full max-w-4xl items-center gap-3 sm:mt-3 sm:gap-6">
          {/* <NeonRail side="left" /> */}
          <h2 className="mx-auto font-heading text-[2.15rem] font-black leading-none tracking-tight text-cyan-200 sm:text-[3.1rem]">
            Olympole 2026
          </h2>
          {/* <NeonRail side="right" /> */}
        </div>

        <p className="mt-3 font-heading text-[1.9rem] leading-none text-white sm:mt-4 sm:text-[2.3rem]">
          &copy; 2026 ESCC
        </p>

        <div className="mt-4 flex items-center justify-center gap-5 sm:mt-5 sm:gap-8">
          {socialLinks.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              aria-label={item.name}
              className="text-white/95 transition-opacity hover:opacity-75"
            >
              <item.icon className="h-11 w-11 sm:h-12 sm:w-12" />
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M7.25 2h9.5A5.26 5.26 0 0 1 22 7.25v9.5A5.26 5.26 0 0 1 16.75 22h-9.5A5.26 5.26 0 0 1 2 16.75v-9.5A5.26 5.26 0 0 1 7.25 2Zm0 2.2A3.06 3.06 0 0 0 4.2 7.25v9.5a3.06 3.06 0 0 0 3.05 3.05h9.5a3.06 3.06 0 0 0 3.05-3.05v-9.5a3.06 3.06 0 0 0-3.05-3.05Zm4.75 2.15a5.65 5.65 0 1 1 0 11.3 5.65 5.65 0 0 1 0-11.3Zm0 2.2a3.45 3.45 0 1 0 0 6.9 3.45 3.45 0 0 0 0-6.9Zm5.4-.95a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6Z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M3 4.6A1.6 1.6 0 0 1 4.6 3h14.8A1.6 1.6 0 0 1 21 4.6v14.8a1.6 1.6 0 0 1-1.6 1.6H4.6A1.6 1.6 0 0 1 3 19.4ZM7.7 10v7.1h2.35V10Zm1.2-1.03a1.37 1.37 0 1 0 0-2.74 1.37 1.37 0 0 0 0 2.74ZM12.1 10v7.1h2.35v-3.52c0-1 .2-1.98 1.44-1.98 1.22 0 1.24 1.14 1.24 2.04v3.46h2.37V13.2c0-1.91-.41-3.38-2.64-3.38a2.3 2.3 0 0 0-2.07 1.13h-.03V10Z" />
    </svg>
  );
}

function GmailIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M2 6.6 12 13l10-6.4V18a2 2 0 0 1-2 2h-4.05v-6.4L12 16.1 8.05 13.6V20H4a2 2 0 0 1-2-2Zm0-2.6A2 2 0 0 1 4 2h16a2 2 0 0 1 2 2l-10 6.4Z" />
    </svg>
  );
}

function TiktokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

