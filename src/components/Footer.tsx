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
    <footer className="w-full mt-auto bg-black flex justify-center items-center">
      <Image
        src="/images/backgrounds/footer.png"
        height={1080}
        width={1920}
        alt="Footer Background"
        className="w-full h-auto object-cover pointer-events-none select-none max-w-full"
      />

      {/*
      <div className="container relative z-10 mx-auto flex h-full flex-col items-center justify-end pb-8 pt-24 gap-6">
        <div className="flex items-center gap-8">
          {socialLinks.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="text-white/80 hover:text-cyan-400 transition-colors drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] scale-100 hover:scale-110"
              aria-label={link.label}
            >
              {link.icon}
            </Link>
          ))}
        </div>
        <p className="text-sm text-white/50 text-center">
          &copy; 2026 Olympole. All rights reserved.
        </p>
      </div> 
      */}
    </footer>
  );
}
