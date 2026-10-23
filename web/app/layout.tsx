import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { JsonLd } from "@/components/json-ld";
import { env } from "@/lib/env";
import { organizationJsonLd, websiteJsonLd, SITE_NAME } from "@/lib/seo";
import "./globals.css";

const figtree = localFont({
  src: "./fonts/figtree-latin-wght-normal.woff2",
  weight: "300 900",
  variable: "--font-figtree",
  display: "swap",
  adjustFontFallback: "Arial",
});
const notoDeva = localFont({
  src: "./fonts/noto-sans-devanagari-devanagari-wght-normal.woff2",
  weight: "100 900",
  variable: "--font-noto-deva",
  display: "swap",
  declarations: [{ prop: "unicode-range", value: "U+0900-097F, U+1CD0-1CFF, U+200C-200D, U+20A8, U+20B9, U+25CC, U+A830-A839, U+A8E0-A8FF" }],
});
const tiroLatin = localFont({
  src: "./fonts/tiro-devanagari-marathi-latin-400-normal.woff2",
  weight: "400",
  variable: "--font-tiro-latin",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});
const tiroDeva = localFont({
  src: "./fonts/tiro-devanagari-marathi-devanagari-400-normal.woff2",
  weight: "400",
  variable: "--font-tiro-deva",
  display: "swap",
  declarations: [{ prop: "unicode-range", value: "U+0900-097F, U+1CD0-1CFF, U+200C-200D, U+20A8, U+20B9, U+25CC, U+A830-A839, U+A8E0-A8FF" }],
});

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: { default: `${SITE_NAME}: Daily MPSC Group C Mock Tests`, template: "%s | Saatatya" },
  description:
    "Daily timed MPSC Group C mock tests with bilingual explanations, plus free preparation guides for syllabus, exam pattern and subjects.",
  applicationName: "Saatatya",
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#faf9f6",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${figtree.variable} ${notoDeva.variable} ${tiroLatin.variable} ${tiroDeva.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
        {children}
      </body>
    </html>
  );
}
