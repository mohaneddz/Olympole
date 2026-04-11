import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sports",
  description: "Browse Olympole sports competitions across collective and individual categories.",
  alternates: {
    canonical: "/sports",
  },
};

export default function SportsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

