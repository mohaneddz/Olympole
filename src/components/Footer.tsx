import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Linkedin } from "lucide-react";

const socialLinks = [
  {
    href: "#",
    label: "Instagram",
    icon: <Instagram className="h-9 w-9" />,
  },
  {
    href: "#",
    label: "LinkedIn",
    icon: <Linkedin className="h-9 w-9" />,
  },
  {
    href: "#",
    label: "Gmail",
    icon: <span className="text-5xl font-black leading-none">M</span>,
  },
  {
    href: "#",
    label: "Facebook",
    icon: <Facebook className="h-9 w-9" />,
  },
];

export function Footer() {
  return (
    <footer className="relative mt-auto overflow-hidden bg-[#02081e]">
      <div className="relative mx-auto flex min-h-[420px] w-full items-center justify-center px-4 py-12 sm:min-h-[500px] sm:py-16">
        <Image
          src="/images/footer.png"
          alt=""
          fill
          sizes="100vw"
          className="pointer-events-none select-none object-cover object-center"
        />

        <div className="relative z-10 flex w-full max-w-xl flex-col items-center text-center">
          <Image
            src="/images/esc.png"
            alt="ESC Club logo"
            width={132}
            height={132}
            className="h-20 w-20 sm:h-28 sm:w-28"
          />

          <h2 className="mt-3 font-heading text-4xl font-black tracking-tight text-[#a4e6ff] sm:text-6xl">
            Olympole 2026
          </h2>

          <p className="mt-2 text-3xl font-extrabold tracking-wide text-white sm:text-5xl">
            © 2026 ESCC
          </p>

          <nav aria-label="Social links" className="mt-6 flex items-center gap-5 sm:gap-8">
            {socialLinks.map((social) => (
              <Link
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="text-white/85 transition hover:text-white"
              >
                {social.icon}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
