import { describe, expect, it } from "vitest";
import { guides } from "@/content/guides";
import { subjects } from "@/content/subjects";
import { absoluteUrl, breadcrumbJsonLd, buildMetadata, jsonLdString, organizationJsonLd } from "@/lib/seo";

describe("seo helpers", () => {
  it("builds canonical + social metadata", () => {
    const m = buildMetadata({ title: "T", description: "D", path: "/mpsc-group-c/syllabus" });
    expect(m.alternates?.canonical).toBe(absoluteUrl("/mpsc-group-c/syllabus"));
    expect(m.openGraph?.url).toBe(absoluteUrl("/mpsc-group-c/syllabus"));
    expect(m.twitter).toMatchObject({ card: "summary_large_image" });
    expect(JSON.stringify(m.openGraph)).toContain("/og.png");
    expect(JSON.stringify(m.twitter)).toContain("/og.png");
  });
  it("escapes < in JSON-LD", () => {
    expect(jsonLdString({ a: "</script><b>" })).not.toContain("<");
  });
  it("breadcrumbs are 1-indexed absolute URLs", () => {
    const b = breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "X", path: "/x" }]);
    expect(b.itemListElement[1]).toMatchObject({ position: 2, item: absoluteUrl("/x") });
  });
  it("organization structured data points to the published logo", () => {
    expect(organizationJsonLd().logo).toBe(absoluteUrl("/Saatatya.jpeg"));
  });
});

describe("content quality guards", () => {
  const metas = [
    ...guides.map((g) => ({ id: g.path, title: g.metaTitle, desc: g.metaDescription })),
    ...subjects.map((s) => ({ id: s.slug, title: s.metaTitle, desc: s.metaDescription })),
  ];
  it("every title and description is unique", () => {
    expect(new Set(metas.map((m) => m.title)).size).toBe(metas.length);
    expect(new Set(metas.map((m) => m.desc)).size).toBe(metas.length);
  });
  it("titles and descriptions are within sensible length", () => {
    for (const m of metas) {
      expect(m.title.length, m.id).toBeLessThanOrEqual(66);
      expect(m.desc.length, m.id).toBeGreaterThanOrEqual(100);
      expect(m.desc.length, m.id).toBeLessThanOrEqual(170);
    }
  });
  it("related subject slugs exist", () => {
    const slugs = new Set(subjects.map((s) => s.slug));
    for (const s of subjects) for (const r of s.related) expect(slugs.has(r), `${s.slug}->${r}`).toBe(true);
  });
  it("related guide paths exist", () => {
    const paths = new Set([...guides.map((g) => g.path), "/mpsc-group-c/subjects"]);
    for (const g of guides) for (const r of g.related) expect(paths.has(r), `${g.path}->${r}`).toBe(true);
  });
  it("does not hard-code time-sensitive exam facts", () => {
    const all = JSON.stringify([guides, subjects]);
    expect(all).not.toMatch(/\b(vacanc|last date|cut-?off|salary)/i);
    expect(all).not.toMatch(/\b3 January 2027|25 October 2026/);
  });
});
