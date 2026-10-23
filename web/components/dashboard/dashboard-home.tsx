"use client";

import Link from "next/link";
import { Flame, PartyPopper } from "lucide-react";
import { DayThread } from "@/components/dashboard/day-thread";
import { ConsistencyStrip, PerformanceOverview } from "@/components/dashboard/performance";
import { TestCard } from "@/components/dashboard/test-card";
import { ButtonLink } from "@/components/ui/button";
import { ErrorState, ProgressBar, Skeleton } from "@/components/ui/misc";
import { useDays, useMe, useTestsForDay } from "@/hooks/queries";
import { computeStreak, formatDayLabel, formatLongDate, todayDayId } from "@/lib/dates";
import { deriveTestState, nextActionableTest, testHref } from "@/lib/test-state";
import { firstName } from "@/lib/utils";

function message(done: number, total: number, hasNext: boolean): { en: string; mr?: string } {
  if (done >= total && total > 0) return { en: "All three tests done for today. Review your mistakes, then rest.", mr: "आजचा सराव पूर्ण. उद्या पुन्हा भेटू." };
  if (done === 0) return { en: "Three tests are waiting. Start with Test 1.", mr: "आजच्या सरावाला सुरुवात करा." };
  return { en: hasNext ? `${done} down, ${total - done} to go. Keep the thread unbroken.` : "Nice progress. Come back when the next test opens.", mr: "सातत्य ठेवा." };
}

export function DashboardHome() {
  const me = useMe();
  const days = useDays();
  const today = todayDayId();

  const list = days.data ?? [];
  // Prefer today's batch; otherwise fall back to the most recent published day.
  const todayDay = list.find((d) => d.dayId === today);
  const activeDay = todayDay ?? [...list].sort((a, b) => (a.dayId < b.dayId ? 1 : -1))[0];
  const isToday = !!todayDay;

  const tests = useTestsForDay(activeDay?.dayId);
  const testList = [...(tests.data ?? [])].sort((a, b) => a.testNumber - b.testNumber);
  const completed = testList.filter((t) => t.completed).length;
  const total = testList.length || activeDay?.totalTests || 3;
  const next = nextActionableTest(testList);
  const streak = computeStreak(list, today);
  const msg = message(completed, total, !!next);
  const allDone = total > 0 && completed >= total;

  return (
    <div className="space-y-12">
      <section aria-labelledby="welcome-h">
        <p className="text-sm font-medium text-ink-3">{formatLongDate()}</p>
        <h1 id="welcome-h" className="mt-1 text-4xl sm:text-5xl">
          {me.data ? `Welcome back, ${firstName(me.data.name)}.` : "Welcome back."}
        </h1>
        <p className="mt-3 text-ink-2">{msg.en}</p>
        {msg.mr && <p lang="mr" className="text-ink-3">{msg.mr}</p>}
      </section>

      {days.isError ? (
        <ErrorState message={days.error.message} onRetry={() => days.refetch()} />
      ) : days.isPending ? (
        <Skeleton className="h-64" />
      ) : !activeDay ? (
        <div className="rounded-2xl border border-line bg-card p-8">
          <h2 className="text-2xl">No tests published yet</h2>
          <p className="mt-2 text-ink-2">New tests appear here as soon as they are published. Check back soon.</p>
        </div>
      ) : (
        <section aria-labelledby="today-h" className="space-y-6">
          <div className="rounded-[1.75rem] border border-line bg-card p-6 shadow-card sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 id="today-h" className="text-3xl">{isToday ? "Today's practice" : `Latest practice: ${formatDayLabel(activeDay.dayId)}`}</h2>
                <p className="mt-1 text-ink-2">
                  <span className="font-semibold text-ink">{completed} of {total}</span> tests completed
                </p>
              </div>
              {streak.count >= 2 && (
                <p className="inline-flex items-center gap-1.5 rounded-full bg-warn-50 px-3 py-1.5 text-sm font-semibold text-warn-700">
                  <Flame className="size-4" aria-hidden />
                  {streak.count}{streak.truncated ? "+" : ""} day streak
                </p>
              )}
            </div>
            {!isToday && (
              <p className="mt-3 rounded-xl bg-warn-50 px-4 py-2.5 text-sm text-warn-700">
                No batch has been published for today yet, so this shows your most recent day.
              </p>
            )}
            <div className="mt-6 max-w-lg">
              {tests.isPending ? (
                <Skeleton className="h-20" />
              ) : (
                <DayThread states={testList.map(deriveTestState)} />
              )}
            </div>
            <div className="mt-6 max-w-lg">
              <ProgressBar value={completed} max={total} label="Tests completed today" />
            </div>
            <div className="mt-6">
              {allDone ? (
                <p className="inline-flex items-center gap-2 font-semibold text-ok-700 animate-pop">
                  <PartyPopper className="size-5" aria-hidden />
                  All done. Brilliant consistency.
                </p>
              ) : next ? (
                <ButtonLink href={testHref(next.id, activeDay.dayId)} size="lg">
                  {next.inProgress ? `Continue Test ${next.testNumber}` : `Start Test ${next.testNumber}`}
                </ButtonLink>
              ) : null}
            </div>
          </div>

          {tests.isError ? (
            <ErrorState message={tests.error.message} onRetry={() => tests.refetch()} />
          ) : (
            <ul className="grid gap-4 md:grid-cols-3">
              {tests.isPending
                ? [1, 2, 3].map((n) => <li key={n}><Skeleton className="h-44" /></li>)
                : testList.map((t) => (
                    <li key={t.id}>
                      <TestCard
                        number={t.testNumber}
                        state={deriveTestState(t)}
                        questions={t.totalQuestions}
                        minutes={t.durationMinutes}
                        startHref={testHref(t.id, activeDay.dayId)}
                        resultHref={t.attemptId ? `/dashboard/result/${t.attemptId}` : undefined}
                        reviewHref={t.attemptId ? `/dashboard/review/${t.attemptId}` : undefined}
                      />
                    </li>
                  ))}
            </ul>
          )}
        </section>
      )}

      <section aria-labelledby="perf-h">
        <h2 id="perf-h" className="text-3xl">Your performance</h2>
        <div className="mt-5">
          {me.isPending ? <Skeleton className="h-40" /> : me.isError ? <ErrorState message={me.error.message} onRetry={() => me.refetch()} /> : <PerformanceOverview user={me.data} />}
        </div>
        {list.length > 0 && (
          <div className="mt-8 max-w-xl">
            <h3 className="text-xl">Recent consistency</h3>
            <div className="mt-3"><ConsistencyStrip days={list} /></div>
          </div>
        )}
      </section>

      <section aria-labelledby="hist-h">
        <div className="flex items-end justify-between gap-4">
          <h2 id="hist-h" className="text-3xl">Earlier practice days</h2>
          <Link href="/dashboard/tests" className="text-sm font-semibold text-brand-700 underline underline-offset-4">See all days</Link>
        </div>
        <DayRows days={list.filter((d) => d.dayId !== activeDay?.dayId).slice(0, 5)} loading={days.isPending} />
      </section>
    </div>
  );
}

export function DayRows({ days, loading }: { days: { dayId: string; completedTests: number; totalTests: number }[]; loading?: boolean }) {
  if (loading) return <Skeleton className="mt-5 h-40" />;
  if (days.length === 0) return <p className="mt-4 text-ink-3">No earlier days yet.</p>;
  return (
    <ul className="mt-5 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
      {days.map((d) => (
        <li key={d.dayId}>
          <Link href={`/dashboard/tests/${d.dayId}`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-sunken/60">
            <span className="font-semibold text-ink">{formatDayLabel(d.dayId)}</span>
            <span className="flex items-center gap-3 text-sm text-ink-2">
              <span aria-hidden className="flex gap-1">
                {Array.from({ length: d.totalTests }).map((_, i) => (
                  <span key={i} className={`size-2.5 rounded-full ${i < d.completedTests ? "bg-ok-600" : "bg-line-strong"}`} />
                ))}
              </span>
              {d.completedTests} of {d.totalTests} completed
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
