"use client";

import Link from "next/link";
import { CheckCircle2, CircleSlash, Clock, Target, XCircle } from "lucide-react";
import { ScoreRing } from "@/components/result/score-ring";
import { ButtonLink } from "@/components/ui/button";
import { Badge, ErrorState, Skeleton } from "@/components/ui/misc";
import { useResult, useTestsForDay } from "@/hooks/queries";
import { ApiError } from "@/lib/api";
import { EXAM_FORMAT } from "@/lib/constants";
import { formatDayLabel, formatMmSs } from "@/lib/dates";
import { nextActionableTest, testHref } from "@/lib/test-state";
import { cn } from "@/lib/utils";

export function ResultView({ attemptId }: { attemptId: string }) {
  const res = useResult(attemptId);
  const r = res.data;
  const tests = useTestsForDay(r?.dayId);
  const next = r && tests.data ? nextActionableTest(tests.data.filter((t) => t.testNumber > r.testNumber)) : undefined;
  const allDone = !!tests.data && tests.data.length > 0 && tests.data.every((t) => t.completed);

  if (res.isPending) return <Skeleton className="h-96" />;
  if (res.isError) {
    const nf = res.error instanceof ApiError && res.error.status === 404;
    return <ErrorState title={nf ? "Result not found" : undefined} message={nf ? "We couldn't find that attempt." : res.error.message} onRetry={nf ? undefined : () => res.refetch()} />;
  }
  if (!r) return null;

  const inProgress = r.status === "IN_PROGRESS";
  if (inProgress) {
    return (
      <div className="rounded-2xl border border-line bg-card p-8">
        <h1 className="text-3xl">This test isn&apos;t finished yet</h1>
        <p className="mt-2 text-ink-2">Results appear after you submit or time runs out.</p>
      </div>
    );
  }

  const insights: string[] = [];
  if (r.wrongAnswers > 0) insights.push(`${r.wrongAnswers} wrong ${r.wrongAnswers === 1 ? "answer" : "answers"} cost you ${r.wrongAnswers * EXAM_FORMAT.negativeMarking} marks.`);
  if (r.unansweredQuestions > 0) insights.push(`${r.unansweredQuestions} ${r.unansweredQuestions === 1 ? "question was" : "questions were"} left unanswered. Those score 0, with no penalty.`);

  return (
    <div className="space-y-10">
      <header>
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone={r.status === "TIME_EXPIRED" ? "warn" : "ok"}>{r.status === "TIME_EXPIRED" ? "Time ran out" : "Submitted"}</Badge>
          <p className="text-sm text-ink-3">{formatDayLabel(r.dayId)}</p>
        </div>
        <h1 className="mt-2 text-4xl sm:text-5xl">Test {r.testNumber} complete</h1>
      </header>

      <section aria-label="Your score" className="grid items-center gap-10 rounded-[1.75rem] border border-line bg-card p-6 shadow-card sm:p-10 md:grid-cols-[auto_1fr]">
        <div className="mx-auto"><ScoreRing score={r.score} outOf={EXAM_FORMAT.totalMarks} /></div>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat icon={CheckCircle2} label="Correct" value={String(r.correctAnswers)} tone="ok" />
          <Stat icon={XCircle} label="Incorrect" value={String(r.wrongAnswers)} tone="bad" />
          <Stat icon={CircleSlash} label="Unanswered" value={String(r.unansweredQuestions)} tone="neutral" />
          <Stat icon={Target} label="Accuracy" value={`${r.accuracy}%`} tone="brand" note="of answered" />
          <Stat icon={Clock} label="Time taken" value={formatMmSs(r.timeTakenSeconds)} tone="neutral" />
        </dl>
      </section>

      {insights.length > 0 && (
        <ul className="max-w-xl space-y-1 text-ink-2">
          {insights.map((i) => <li key={i}>{i}</li>)}
        </ul>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <ButtonLink href={`/dashboard/review/${r.attemptId}`} size="lg">Review answers</ButtonLink>
        {next && <ButtonLink href={testHref(next.id, r.dayId)} size="lg" variant="secondary">Continue with Test {next.testNumber}</ButtonLink>}
        <ButtonLink href="/dashboard" size="lg" variant="ghost">Back to dashboard</ButtonLink>
      </div>
      {allDone && (
        <p className="animate-pop font-semibold text-ok-700">All three tests for {formatDayLabel(r.dayId)} are done. See you tomorrow.</p>
      )}
      <p className="text-sm text-ink-3">
        Score = +1 per correct, −0.25 per wrong, 0 unanswered.{" "}
        <Link href={`/dashboard/tests/${r.dayId}`} className="underline">See all tests for this day</Link>
      </p>
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone, note }: { icon: typeof Clock; label: string; value: string; tone: "ok" | "bad" | "neutral" | "brand"; note?: string }) {
  const cls = { ok: "bg-ok-50 text-ok-700", bad: "bg-bad-50 text-bad-700", neutral: "bg-sunken text-ink-2", brand: "bg-brand-50 text-brand-700" }[tone];
  return (
    <div className={cn("rounded-2xl p-4", cls)}>
      <dt className="flex items-center gap-1.5 text-sm font-semibold"><Icon className="size-4" aria-hidden />{label}</dt>
      <dd className="mt-1 font-display text-3xl tabular-nums">{value}</dd>
      {note && <p className="text-xs opacity-80">{note}</p>}
    </div>
  );
}
