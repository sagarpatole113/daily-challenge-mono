import Link from "next/link";
import { FaqList } from "@/components/marketing/faq";
import { DayThread } from "@/components/dashboard/day-thread";
import { TestCard } from "@/components/dashboard/test-card";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/misc";
import { homeFaqs } from "@/content/faqs";
import { subjects } from "@/content/subjects";
import { BRAND, EXAM_FORMAT } from "@/lib/constants";

export function Hero() {
  return (
    <section aria-labelledby="hero-h" className="relative overflow-hidden border-b border-line">
      <Container className="grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <h1 id="hero-h" className="text-[2.6rem] leading-[1.08] sm:text-6xl">
            Your Daily Practice. <br className="hidden sm:block" />
            Your MPSC Success.
          </h1>
          <p lang="mr" className="mt-5 max-w-xl text-lg font-medium text-brand-700">
            {BRAND.taglineMarathi}
          </p>
          <p className="mt-4 max-w-xl text-lg text-ink-2">
            Practise exam-style questions in English and Marathi, see exactly where you lose marks, and build the habit of
            studying every single day. Three timed tests a day. No app to install.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/signup" size="lg">Start Daily Practice</ButtonLink>
            <ButtonLink href="/mpsc-group-c" size="lg" variant="secondary">Explore MPSC Group C Preparation</ButtonLink>
          </div>
        </div>

        <figure aria-label="Example of the Saatatya daily dashboard" className="relative">
          <div className="rounded-[1.75rem] border border-line bg-card p-5 shadow-pop sm:p-7">
            <p className="text-sm font-semibold text-ink-3">Today</p>
            <p className="mt-1 font-display text-2xl">1 of 3 tests completed</p>
            <DayThread className="mt-6" states={["completed", "in_progress", "locked"]} />
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <TestCard number={2} state="in_progress" />
              <TestCard number={3} state="locked" />
            </div>
          </div>
          <figcaption className="mt-3 text-center text-xs text-ink-3">Example view. Your dashboard shows your own progress.</figcaption>
        </figure>
      </Container>
    </section>
  );
}

const format: [string, string][] = [
  ["Tests each day", String(EXAM_FORMAT.testsPerDay)],
  ["Questions per test", String(EXAM_FORMAT.questionsPerTest)],
  ["Time per test", `${EXAM_FORMAT.durationMinutes} minutes`],
  ["Correct answer", "+1"],
  ["Wrong answer", "−0.25"],
  ["Unanswered", "0"],
  ["Language", "English and Marathi"],
];

export function DailyFormat() {
  return (
    <section aria-labelledby="format-h" className="py-20">
      <Container className="grid gap-12 lg:grid-cols-[1fr_1fr]">
        <div>
          <h2 id="format-h" className="text-4xl">The daily challenge</h2>
          <p className="mt-4 max-w-lg text-ink-2">
            Every day brings three full tests that follow the preliminary exam format. They open in order: finish Test 1 to
            unlock Test 2, and finish Test 2 to unlock Test 3. A test counts as finished when you submit it or when its time
            runs out. The server keeps the clock, so refreshing the page never gives you extra time.
          </p>
          <dl className="mt-8 max-w-md divide-y divide-line border-y border-line">
            {format.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-3">
                <dt className="text-ink-2">{k}</dt>
                <dd className="font-semibold text-ink">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-8">
            <ButtonLink href="/mpsc-group-c/daily-mock-test" variant="secondary">How the daily test works</ButtonLink>
          </div>
        </div>
        <div className="space-y-4 lg:pt-10">
          <TestCard number={1} state="available" />
          <TestCard number={2} state="locked" />
          <TestCard number={3} state="locked" />
        </div>
      </Container>
    </section>
  );
}

const steps = [
  { t: "Create a free account", d: "Pick a username and password. It takes under a minute, and there is nothing to install." },
  { t: "Take today's test", d: "Answer in your own time inside the 60-minute window. Your answers are saved as you go." },
  { t: "Review every answer", d: "See the correct option and an explanation in English and Marathi, only after you finish." },
  { t: "Come back tomorrow", d: "A new set of three tests opens each day. Consistency is what moves your score." },
];

export function HowItWorks() {
  return (
    <section aria-labelledby="how-h" className="border-y border-line bg-sunken/50 py-20">
      <Container>
        <h2 id="how-h" className="max-w-xl text-4xl">How Saatatya works</h2>
        <ol className="relative mt-12 grid gap-10 md:grid-cols-4 md:gap-6">
          {steps.map((s, i) => (
            <li key={s.t} className="relative md:pr-4">
              <span className="relative z-10 inline-flex size-10 items-center justify-center rounded-full bg-brand-600 font-bold text-white">{i + 1}</span>
              {i < steps.length - 1 && (
                <span aria-hidden className="absolute left-10 top-5 hidden h-0.5 w-[calc(100%-2.5rem)] bg-brand-200 md:block" />
              )}
              <h3 className="mt-4 text-2xl">{s.t}</h3>
              <p className="mt-2 text-ink-2">{s.d}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

export function WhyDaily() {
  return (
    <section aria-labelledby="why-h" className="py-20">
      <Container className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <h2 id="why-h" className="text-4xl">What makes daily practice useful</h2>
        <div className="space-y-8 text-ink-2">
          <div>
            <h3 className="text-2xl text-ink">It feels like the real paper</h3>
            <p className="mt-2">100 questions, 60 minutes and negative marking train the pacing and the guess-or-skip decisions that a relaxed practice session never does.</p>
          </div>
          <div>
            <h3 className="text-2xl text-ink">Explanations in both languages</h3>
            <p className="mt-2">A wrong answer only helps if you understand why. Every question has an explanation in English and Marathi to read after the test.</p>
          </div>
          <div>
            <h3 className="text-2xl text-ink">A fair clock you can trust</h3>
            <p className="mt-2">The timer and scoring live on the server, not in your browser. The result is the same on every device and cannot be reset by refreshing.</p>
          </div>
          <div>
            <h3 className="text-2xl text-ink">Small, repeatable habit</h3>
            <p className="mt-2">One test a day, reviewed properly, beats a long session once a week. The dashboard shows what is next so starting takes no effort.</p>
          </div>
        </div>
      </Container>
    </section>
  );
}

export function SubjectLinks() {
  return (
    <section aria-labelledby="subjects-h" className="border-t border-line py-20">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="subjects-h" className="text-4xl">MPSC Group C preparation resources</h2>
            <p className="mt-3 max-w-xl text-ink-2">Free guides to the syllabus, the exam pattern and every subject, written to help you plan, not to replace the official notice.</p>
          </div>
          <Link href="/mpsc-group-c" className="font-semibold text-brand-700 underline underline-offset-4">Start with the preparation guide</Link>
        </div>
        <ul className="mt-10 grid border-t border-line sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((s) => (
            <li key={s.slug} className="border-b border-line">
              <Link href={`/mpsc-group-c/subjects/${s.slug}`} className="group flex items-baseline justify-between gap-3 py-4 pr-4">
                <span className="font-semibold text-ink group-hover:text-brand-700">{s.name}</span>
                <span lang="mr" className="text-sm text-ink-3">{s.marathi}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          {[
            ["/mpsc-group-c/syllabus", "Syllabus"],
            ["/mpsc-group-c/exam-pattern", "Exam pattern"],
            ["/mpsc-group-c/previous-year-questions", "Previous year questions"],
            ["/mpsc-group-c/mock-tests", "Mock tests"],
            ["/mpsc-group-c/study-resources", "Study resources"],
          ].map(([href, label]) => (
            <Link key={href} href={href as string} className="rounded-full border border-line-strong px-4 py-2 font-medium text-ink-2 hover:border-brand-600 hover:text-brand-700">
              {label}
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function HomeFaq() {
  return (
    <section aria-labelledby="faq-h" className="py-20">
      <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <h2 id="faq-h" className="text-4xl">Questions students ask</h2>
        <FaqList faqs={homeFaqs} />
      </Container>
    </section>
  );
}

export function FinalCta() {
  return (
    <section aria-labelledby="cta-h">
      <Container>
        <div className="rounded-[2rem] bg-brand-700 px-6 py-14 text-white sm:px-14">
          <h2 id="cta-h" className="max-w-2xl text-4xl sm:text-5xl">Today&apos;s three tests are waiting.</h2>
          <p lang="mr" className="mt-4 max-w-xl text-brand-100">आजचा सराव सुरू करा. उद्याची तयारी आजपासून.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/signup" size="lg" variant="secondary">Start Daily Practice</ButtonLink>
            <ButtonLink href="/login" size="lg" variant="ghost" className="text-white hover:bg-white/10">I already have an account</ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
