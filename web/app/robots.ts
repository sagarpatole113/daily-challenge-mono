import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

/**
 * /login and /signup are noindex via meta tags (not blocked here), so
 * crawlers can read the noindex directive. /dashboard is private and is
 * blocked outright; it also sends noindex and a no-store header.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/dashboard"] }],
    sitemap: `${env.siteUrl}/sitemap.xml`,
    host: env.siteUrl,
  };
}
