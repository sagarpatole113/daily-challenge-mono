import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuidePage } from "@/components/marketing/guide-page";
import { subjectBySlug, subjects } from "@/content/subjects";
import type { Section } from "@/content/types";
import { buildMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return subjects.map((s) => ({ subject: s.slug }));
}

type Props = { params: Promise<{ subject: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = subjectBySlug((await params).subject);
  if (!s) return {};
  return buildMetadata({
    title: s.metaTitle,
    description: s.metaDescription,
    path: `/mpsc-group-c/subjects/${s.slug}`,
    type: "article",
    publishedTime: s.published,
    modifiedTime: s.updated,
  });
}

export default async function SubjectPage({ params }: Props) {
  const s = subjectBySlug((await params).subject);
  if (!s) notFound();
  const path = `/mpsc-group-c/subjects/${s.slug}`;

  const sections: Section[] = [
    { id: "covers", heading: "What this subject covers", blocks: [{ t: "ul", items: s.covers }] },
    { id: "question-types", heading: "Question types to expect", blocks: [{ t: "ul", items: s.questionTypes }] },
    { id: "how-to-study", heading: "How to study it", blocks: [{ t: "ol", items: s.howToStudy }] },
    ...(s.example ? [{ id: "example", heading: s.example.title, blocks: [{ t: "p" as const, text: s.example.body }] }] : []),
    { id: "mistakes", heading: "Common mistakes", blocks: [{ t: "ul", items: s.commonMistakes }] },
    {
      id: "practice",
      heading: "Practise it on Saatatya",
      blocks:
        s.practisedInSaatatya.length > 0
          ? [
              { t: "p", text: `Saatatya's daily tests currently practise these ${s.name.toLowerCase()} topics: ${s.practisedInSaatatya.join(", ")}.` },
              { t: "p", text: "Take a [daily mock test](/mpsc-group-c/daily-mock-test), then use the explanations to close the gaps." },
            ]
          : [{ t: "p", text: "This subject is not part of the current daily question set. Use it alongside the [daily mock tests](/mpsc-group-c/daily-mock-test)." }],
    },
  ];

  return (
    <GuidePage
      crumbs={[
        { name: "Home", path: "/" },
        { name: "MPSC Group C", path: "/mpsc-group-c" },
        { name: "Subjects", path: "/mpsc-group-c/subjects" },
        { name: s.name, path },
      ]}
      h1={`MPSC Group C ${s.name}`}
      lead={s.summary}
      published={s.published}
      updated={s.updated}
      metaTitle={s.metaTitle}
      description={s.metaDescription}
      path={path}
      sections={sections}
      verification="editorial"
      related={s.related.flatMap((slug) => {
        const r = subjectBySlug(slug);
        return r ? [{ href: `/mpsc-group-c/subjects/${r.slug}`, label: r.name }] : [];
      })}
    />
  );
}
