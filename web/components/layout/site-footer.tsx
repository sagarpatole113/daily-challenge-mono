import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { Container } from "@/components/ui/misc";
import { subjects } from "@/content/subjects";

const group = [
  { href: "/mpsc-group-c", label: "Preparation guide" },
  { href: "/mpsc-group-c/syllabus", label: "Syllabus" },
  { href: "/mpsc-group-c/exam-pattern", label: "Exam pattern" },
  { href: "/mpsc-group-c/previous-year-questions", label: "Previous year questions" },
  { href: "/mpsc-group-c/mock-tests", label: "Mock tests" },
  { href: "/mpsc-group-c/daily-mock-test", label: "Daily mock test" },
  { href: "/mpsc-group-c/study-resources", label: "Study resources" },
];
const company = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy-policy", label: "Privacy policy" },
  { href: "/terms", label: "Terms" },
];

function Col({ title, items }: { title: string; items: { href: string; label: string }[] }) {
  return (
    <nav aria-label={title}>
      <h2 className="font-sans text-sm font-bold text-ink">{title}</h2>
      <ul className="mt-3 space-y-2">
        {items.map((i) => (
          <li key={i.href}>
            <Link href={i.href} className="text-sm text-ink-2 hover:text-brand-700 hover:underline">
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-sunken/60">
      <Container className="py-12">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-ink-2">
              Daily timed mock tests for MPSC Group C and Group B aspirants, with bilingual explanations.
            </p>
            <p lang="mr" className="mt-3 max-w-xs text-sm text-ink-3">
              दररोज सराव. सातत्य ठेवा.
            </p>
          </div>
          <Col title="MPSC Group C" items={group} />
          <Col title="Subjects" items={subjects.slice(0, 6).map((s) => ({ href: `/mpsc-group-c/subjects/${s.slug}`, label: s.name }))} />
          <Col title="Saatatya" items={company} />
        </div>
        <p className="mt-10 max-w-3xl border-t border-line pt-6 text-xs leading-relaxed text-ink-3">
          Saatatya is an independent practice platform. It is not affiliated with or endorsed by the Maharashtra Public
          Service Commission. Confirm all notifications, dates and rules on mpsc.gov.in. Practice questions may contain
          errors; please report any you find.
        </p>
      </Container>
    </footer>
  );
}
