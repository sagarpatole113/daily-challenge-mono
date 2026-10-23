import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { Breadcrumbs } from "@/components/marketing/breadcrumbs";
import { Container } from "@/components/ui/misc";
import { subjects } from "@/content/subjects";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

const PATH = "/mpsc-group-c/subjects";
export const metadata = buildMetadata({
  title: "MPSC Group C Subjects: Subject-wise Preparation Guides",
  description:
    "Subject-wise MPSC Group C preparation: polity, history, geography, economy, science, current affairs, Maharashtra GK, reasoning and language. Pick a subject to start.",
  path: PATH,
});

const crumbs = [
  { name: "Home", path: "/" },
  { name: "MPSC Group C", path: "/mpsc-group-c" },
  { name: "Subjects", path: PATH },
];

export default function SubjectsHub() {
  return (
    <Container className="pt-8 sm:pt-12">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs crumbs={crumbs} />
      <h1 className="mt-6 max-w-3xl text-4xl sm:text-5xl">Subject-wise MPSC Group C preparation</h1>
      <p className="mt-5 max-w-2xl text-lg text-ink-2">
        Each guide lists what the subject covers, the question types to expect, a study method and the mistakes to avoid. Where
        Saatatya&apos;s daily tests practise the subject, the exact topics are listed so your study and your practice line up.
      </p>
      <ul className="mt-10 grid gap-x-10 border-t border-line sm:grid-cols-2">
        {subjects.map((s) => (
          <li key={s.slug} className="border-b border-line">
            <Link href={`/mpsc-group-c/subjects/${s.slug}`} className="group block py-5">
              <span className="flex items-baseline justify-between gap-4">
                <span className="font-display text-2xl text-ink group-hover:text-brand-700">{s.name}</span>
                <span lang="mr" className="text-sm text-ink-3">{s.marathi}</span>
              </span>
              <span className="mt-2 block text-ink-2">{s.summary}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}
