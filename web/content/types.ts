/**
 * Editorial content model. New verified articles are added by appending to
 * content/guides.ts (or a new file) and registering the path; routes,
 * sitemap, breadcrumbs, JSON-LD and internal links all derive from this data.
 */
export type Block =
  | { t: "p"; text: string }
  | { t: "h3"; text: string }
  | { t: "ul"; items: string[] }
  | { t: "ol"; items: string[] }
  | { t: "callout"; tone: "official" | "tip" | "note"; title: string; text: string }
  | { t: "table"; caption: string; head: string[]; rows: string[][] };

export interface Section {
  id: string;
  heading: string;
  blocks: Block[];
}

export interface Faq {
  q: string;
  a: string;
}

/**
 * - "editorial": original study advice; no time-sensitive exam facts.
 * - "reported": contains exam-structure statements drawn from MPSC notices as
 *   summarised by secondary sources; must be re-checked against mpsc.gov.in
 *   before each exam cycle (see docs/CONTENT_REVIEW.md).
 */
export type Verification = "editorial" | "reported";

export interface Guide {
  path: string; // e.g. "/mpsc-group-c/syllabus"
  metaTitle: string; // <title>, aim <= 60 chars
  metaDescription: string; // aim 120-160 chars
  h1: string;
  lead: string;
  published: string; // ISO date
  updated: string; // ISO date
  verification: Verification;
  sections: Section[];
  faqs?: Faq[];
  related: string[]; // internal paths shown at the end
  crumbs: { name: string; path: string }[];
}

export interface Subject {
  slug: string;
  name: string;
  marathi: string;
  metaTitle: string;
  metaDescription: string;
  summary: string;
  /** Topics Saatatya's current question bank actually practises (from cron data). */
  practisedInSaatatya: string[];
  covers: string[];
  questionTypes: string[];
  howToStudy: string[];
  commonMistakes: string[];
  example?: { title: string; body: string };
  related: string[]; // subject slugs
  published: string;
  updated: string;
}
