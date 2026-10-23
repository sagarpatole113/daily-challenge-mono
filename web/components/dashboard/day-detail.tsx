"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { DayThread } from "@/components/dashboard/day-thread";
import { TestCard } from "@/components/dashboard/test-card";
import { ErrorState, Skeleton } from "@/components/ui/misc";
import { useTestsForDay } from "@/hooks/queries";
import { ApiError } from "@/lib/api";
import { formatDayLabel } from "@/lib/dates";
import { deriveTestState, testHref } from "@/lib/test-state";

export function DayDetail({ dayId }: { dayId: string }) {
  const tests = useTestsForDay(dayId);
  const list = [...(tests.data ?? [])].sort((a, b) => a.testNumber - b.testNumber);
  const notFound = tests.error instanceof ApiError && tests.error.status === 404;

  return (
    <div>
      <Link href="/dashboard/tests" className="inline-flex items-center gap-1 text-sm font-medium text-ink-3 hover:text-ink">
        <ChevronLeft className="size-4" aria-hidden /> All practice days
      </Link>
      <h1 className="mt-3 text-4xl sm:text-5xl">{formatDayLabel(dayId)}</h1>
      {tests.isError ? (
        <ErrorState className="mt-6" title={notFound ? "That day isn't available" : undefined} message={notFound ? "There is no published practice for this date." : tests.error.message} onRetry={notFound ? undefined : () => tests.refetch()} />
      ) : tests.isPending ? (
        <div className="mt-8 grid gap-4 md:grid-cols-3">{[1, 2, 3].map((n) => <Skeleton key={n} className="h-44" />)}</div>
      ) : (
        <>
          <DayThread className="mt-8 max-w-lg" states={list.map(deriveTestState)} />
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {list.map((t) => (
              <li key={t.id}>
                <TestCard
                  number={t.testNumber}
                  state={deriveTestState(t)}
                  questions={t.totalQuestions}
                  minutes={t.durationMinutes}
                  startHref={testHref(t.id, dayId)}
                  resultHref={t.attemptId ? `/dashboard/result/${t.attemptId}` : undefined}
                  reviewHref={t.attemptId ? `/dashboard/review/${t.attemptId}` : undefined}
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
