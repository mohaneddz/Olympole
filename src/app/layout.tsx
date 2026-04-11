import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getSiteOrigin } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const tomoBossa = localFont({
  src: "../../public/fonts/TOMO Bossa Black.ttf",
  variable: "--font-tomo-bossa",
});

export const metadata: Metadata = {
  metadataBase: getSiteOrigin(),
  title: {
    default: "Olympole 2026",
    template: "%s | Olympole 2026",
  },
  description: "Official Olympole 2026 portal for sports, culture, schedules, results, and live streams.",
  keywords: [
    "Olympole 2026",
    "ESC Club",
    "sports tournament",
    "culture events",
    "live streams",
    "event schedule",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Olympole 2026",
    title: "Olympole 2026",
    description: "Official Olympole 2026 portal for sports, culture, schedules, results, and live streams.",
    url: "/",
    images: [
      {
        url: "/images/backgrounds/hero.avif",
        width: 1200,
        height: 630,
        alt: "Olympole 2026",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Olympole 2026",
    description: "Official Olympole 2026 portal for sports, culture, schedules, results, and live streams.",
    images: ["/images/backgrounds/hero.avif"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${tomoBossa.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-primary/30">
        <Navbar />
        <main className="flex-1 flex flex-col relative z-10 w-full">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
