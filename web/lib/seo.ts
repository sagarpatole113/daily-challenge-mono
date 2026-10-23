import type { Metadata } from "next";
import { env } from "@/lib/env";
import { BRAND } from "@/lib/constants";

export const SITE_NAME = `${BRAND.name} (${BRAND.marathi})`;

const OG_IMAGE = {
  url: "/og.png",
  width: 1200,
  height: 630,
  alt: "Saatatya: daily MPSC Group C mock tests, in English and Marathi",
} as const;

export function absoluteUrl(path: string): string {
  return `${env.siteUrl}${path === "/" ? "" : path}`;
}

interface PageMeta {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
}

/** Unique title + description, canonical, Open Graph and Twitter for a public page. */
export function buildMetadata(p: PageMeta): Metadata {
  const url = absoluteUrl(p.path);
  return {
    title: p.title,
    description: p.description,
    alternates: { canonical: url },
    openGraph: {
      title: p.title,
      description: p.description,
      url,
      siteName: SITE_NAME,
      locale: "en_IN",
      images: [{ ...OG_IMAGE, url: absoluteUrl(OG_IMAGE.url) }],
      type: p.type ?? "website",
      ...(p.type === "article" ? { publishedTime: p.publishedTime, modifiedTime: p.modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: p.title,
      description: p.description,
      images: [absoluteUrl(OG_IMAGE.url)],
    },
  };
}

export const noIndex: Metadata = { robots: { index: false, follow: false } };
export const noIndexFollow: Metadata = { robots: { index: false, follow: true } };

export function breadcrumbJsonLd(crumbs: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

export function articleJsonLd(a: { headline: string; description: string; path: string; published: string; updated: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.headline,
    description: a.description,
    mainEntityOfPage: absoluteUrl(a.path),
    datePublished: a.published,
    dateModified: a.updated,
    inLanguage: "en-IN",
    author: { "@type": "Organization", name: BRAND.name, url: env.siteUrl },
    publisher: { "@type": "Organization", name: BRAND.name, url: env.siteUrl },
  };
}

export const organizationJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: BRAND.name,
  alternateName: BRAND.marathi,
  url: env.siteUrl,
  logo: absoluteUrl("/Saatatya.jpeg"),
});

export const websiteJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: BRAND.name,
  alternateName: BRAND.marathi,
  url: env.siteUrl,
  inLanguage: ["en-IN", "mr-IN"],
});

/** Safe serialisation for inline JSON-LD (prevents </script> breakout). */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
