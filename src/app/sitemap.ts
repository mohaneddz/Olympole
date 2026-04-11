import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const routes = [
    "",
    "/sports",
    "/culture",
    "/culture/art",
    "/culture/writing",
    "/culture/talent",
    "/live",
    "/schedule",
    "/predictions",
    "/predictions/match",
    "/predictions/fantasy",
    "/register",
    "/login",
  ];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}

