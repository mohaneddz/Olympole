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
    button: "border-[#3d243a] text-[#1a1026] hover:bg-[#3d243a] hover:text-[#ef8dd6]",
    items: [
      { name: "Football", href: "/register/football" },
      { name: "Basketball", href: "/register/basketball" },
      { name: "Handball", href: "/register/handball" },
      { name: "Volleyball", href: "/register/volleyball" },
    ],
  },
  {
    title: "Individual Sports",
    icon: Dumbbell,
    border: "border-[#eef15b]",
    heading: "text-[#eef15b]",
    rowBg: "bg-[#ecec65]",
    text: "text-[#181717]",
    button: "border-[#46412b] text-[#1d1b12] hover:bg-[#46412b] hover:text-[#ecec65]",
    items: [
      { name: "Swimming", href: "/register/swimming" },
      { name: "Tennis", href: "/register/tennis" },
      { name: "Chess", href: "/register/chess" },
      { name: "Running", href: "/register/running" },
    ],
  },
  {
    title: "Cultural Events",
    icon: Palette,
    border: "border-[#00d8ff]",
    heading: "text-[#90edff]",
    rowBg: "bg-[#13c8e5]",
    text: "text-white",
    button: "border-white text-white hover:bg-white hover:text-[#13c8e5]",
    items: [
      { name: "Talent Show", href: "/register/talent-show" },
      { name: "Knowledge Cup", href: "/register/knowledge-cup" },
      { name: "Writing Contest", href: "/register/writing-contest" },
      { name: "Drawing & Art", href: "/register/art-exhibition" },
    ],
  },
];
