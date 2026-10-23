import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuidePage, relatedLabel } from "@/components/marketing/guide-page";
import { guideByPath } from "@/content/guides";
import { buildMetadata } from "@/lib/seo";

export function guideMetadata(path: string): Metadata {
  const g = guideByPath(path);
  if (!g) return {};
  return buildMetadata({
    title: g.metaTitle,
    description: g.metaDescription,
    path: g.path,
    type: "article",
    publishedTime: g.published,
    modifiedTime: g.updated,
  });
}

export function GuideRoute({ path }: { path: string }) {
  const g = guideByPath(path);
  if (!g) notFound();
  return (
    <GuidePage
      crumbs={g.crumbs}
      h1={g.h1}
      lead={g.lead}
      published={g.published}
      updated={g.updated}
      metaTitle={g.metaTitle}
      description={g.metaDescription}
      path={g.path}
      sections={g.sections}
      faqs={g.faqs}
      verification={g.verification}
      related={g.related.map((href) => ({ href, label: relatedLabel(href) }))}
    />
  );
}
