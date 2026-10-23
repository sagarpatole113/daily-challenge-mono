import type { MetadataRoute } from "next";
import { guides } from "@/content/guides";
import { subjects } from "@/content/subjects";
import { absoluteUrl } from "@/lib/seo";

/**
 * Public, indexable pages only. lastModified comes from the content's own
 * `updated` date, so it changes only when the content does. Private routes
 * (/dashboard, /login, /signup) are deliberately absent.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { path: "/", lastModified: "2026-10-20", priority: 1 },
    { path: "/mpsc-group-c/subjects", lastModified: "2026-10-20", priority: 0.7 },
    { path: "/about", lastModified: "2026-10-20", priority: 0.4 },
    { path: "/contact", lastModified: "2026-10-20", priority: 0.3 },
    { path: "/privacy-policy", lastModified: "2026-10-20", priority: 0.2 },
    { path: "/terms", lastModified: "2026-10-20", priority: 0.2 },
  ];
  return [
    ...staticPages.map((p) => ({ url: absoluteUrl(p.path), lastModified: p.lastModified, priority: p.priority })),
    ...guides.map((g) => ({ url: absoluteUrl(g.path), lastModified: g.updated, priority: g.path === "/mpsc-group-c" ? 0.9 : 0.8 })),
    ...subjects.map((s) => ({ url: absoluteUrl(`/mpsc-group-c/subjects/${s.slug}`), lastModified: s.updated, priority: 0.6 })),
  ];
}
