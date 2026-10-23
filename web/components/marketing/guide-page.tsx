import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { Blocks } from "@/components/marketing/blocks";
import { Breadcrumbs } from "@/components/marketing/breadcrumbs";
import { FaqList } from "@/components/marketing/faq";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/misc";
import { guideByPath } from "@/content/guides";
import type { Guide, Section } from "@/content/types";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

const RELATED_LABEL: Record<string, string> = {
  "/mpsc-group-c/subjects": "Subject-wise preparation",
};

export function relatedLabel(path: string): string {
  return RELATED_LABEL[path] ?? guideByPath(path)?.h1 ?? path;
}

interface Props {
  crumbs: Guide["crumbs"];
  h1: string;
  lead: string;
  published: string;
  updated: string;
  metaTitle: string;
  description: string;
  path: string;
  sections: Section[];
  faqs?: Guide["faqs"];
  related?: { href: string; label: string }[];
  verification: Guide["verification"];
  /** Extra content rendered above the sections (e.g. subject facts). */
  children?: React.ReactNode;
}

export function GuidePage(p: Props) {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(p.crumbs)} />
      <JsonLd data={articleJsonLd({ headline: p.metaTitle, description: p.description, path: p.path, published: p.published, updated: p.updated })} />
      <Container className="pt-8 sm:pt-12">
        <Breadcrumbs crumbs={p.crumbs} />
        <div className="mt-6 grid gap-12 lg:grid-cols-[minmax(0,1fr)_16rem]">
          <article>
            <header className="max-w-3xl">
              <h1 className="text-4xl sm:text-5xl">{p.h1}</h1>
              <p className="mt-5 text-lg text-ink-2">{p.lead}</p>
              <p className="mt-4 text-sm text-ink-3">
                Last reviewed <time dateTime={p.updated}>{fmt(p.updated)}</time>
                {p.verification === "reported" && (
                  <>. Exam details here follow recent MPSC notices as summarised by education sources. The Commission revises its scheme between cycles, so confirm on mpsc.gov.in.</>
                )}
              </p>
            </header>
            {p.children}
            <div className="prose-guide mt-4">
              {p.sections.map((s) => (
                <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`}>
                  <h2 id={`${s.id}-h`}>{s.heading}</h2>
                  <Blocks blocks={s.blocks} />
                </section>
              ))}
            </div>
            {p.faqs && p.faqs.length > 0 && (
              <section aria-labelledby="faq-h" className="mt-14 max-w-3xl">
                <h2 id="faq-h" className="text-3xl">Frequently asked questions</h2>
                <div className="mt-5"><FaqList faqs={p.faqs} /></div>
              </section>
            )}
            {p.related && p.related.length > 0 && (
              <nav aria-labelledby="related-h" className="mt-14 max-w-3xl">
                <h2 id="related-h" className="text-3xl">Keep going</h2>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {p.related.map((r) => (
                    <li key={r.href}>
                      <Link href={r.href} className="block rounded-xl border border-line bg-card px-4 py-3 font-medium text-ink hover:border-brand-200 hover:text-brand-700">
                        {r.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </article>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            {p.sections.length > 2 && (
              <nav aria-label="On this page" className="hidden lg:block">
                <p className="text-sm font-bold text-ink">On this page</p>
                <ul className="mt-3 space-y-2 border-l border-line pl-4 text-sm">
                  {p.sections.map((s) => (
                    <li key={s.id}>
                      <a href={`#${s.id}`} className="text-ink-2 hover:text-brand-700">{s.heading}</a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
            <div className="mt-8 rounded-2xl bg-brand-700 p-5 text-white">
              <p className="font-display text-2xl leading-tight">Practise it today</p>
              <p className="mt-2 text-sm text-brand-100">Three timed tests a day, with explanations in English and Marathi.</p>
              <ButtonLink href="/signup" variant="secondary" className="mt-4 w-full">Start daily practice</ButtonLink>
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}
