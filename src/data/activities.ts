import { CircleDot, Dumbbell, Palette, type LucideIcon } from "lucide-react";

export interface ActivityItem {
  name: string;
  href: string;
}

export interface ActivityColumn {
  title: string;
  icon: LucideIcon;
  border: string;
  heading: string;
  rowBg: string;
  text: string;
  button: string;
  items: ActivityItem[];
}

export const ACTIVITY_COLUMNS: ActivityColumn[] = [
  {
    title: "Collective Sports",
    icon: CircleDot,
    border: "border-[#f18cd4]",
    heading: "text-[#f2acd9]",
    rowBg: "bg-[#ef8dd6]",
    text: "text-[#120920]",
    button: "border-[#3d243a] text-[#1a1026]",
    items: [
      { name: "Football", href: "/register" },
      { name: "Basketball", href: "/register" },
      { name: "Handball", href: "/register" },
      { name: "Volleyball", href: "/register" },
    ],
  },
  {
    title: "Individual Sports",
    icon: Dumbbell,
    border: "border-[#eef15b]",
    heading: "text-[#eef15b]",
    rowBg: "bg-[#ecec65]",
    text: "text-[#181717]",
    button: "border-[#46412b] text-[#1d1b12]",
    items: [
      { name: "Swimming", href: "/register" },
      { name: "Tennis", href: "/register" },
      { name: "Chess", href: "/register" },
      { name: "Running", href: "/register" },
    ],
  },
  {
    title: "Cultural Events",
    icon: Palette,
    border: "border-[#00d8ff]",
    heading: "text-[#90edff]",
    rowBg: "bg-[#13c8e5]",
    text: "text-white",
    button: "border-white text-white",
    items: [
      { name: "Talent Show", href: "/culture/talent" },
      { name: "Knowledge Cup", href: "/culture" },
      { name: "Writing Contest", href: "/culture/writing" },
      { name: "Drawing & Art", href: "/culture/art" },
    ],
  },
];
