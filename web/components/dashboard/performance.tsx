import type { DayListItem, User } from "@/types/shared";
import { pct, cn } from "@/lib/utils";
import { formatWeekdayShort } from "@/lib/dates";

/** Only numbers the existing API/profile can support. */
export function PerformanceOverview({ user }: { user: User }) {
  const answered = user.totalCorrectAnswers + user.totalWrongAnswers;
  const accuracy = pct(user.totalCorrectAnswers, answered);
  const avg = user.totalTestsCompleted ? Math.round((user.totalScore / user.totalTestsCompleted) * 10) / 10 : 0;

  const stats: { label: string; value: string; note?: string }[] = [
    { label: "Tests completed", value: String(user.totalTestsCompleted) },
    { label: "Average score", value: user.totalTestsCompleted ? `${avg}` : "No data yet", note: "out of 100" },
    { label: "Best score", value: user.totalTestsCompleted ? String(user.bestScore) : "No data yet" },
    { label: "Accuracy", value: answered ? `${accuracy}%` : "No data yet", note: "of questions you answered" },
    { label: "Correct", value: String(user.totalCorrectAnswers) },
    { label: "Incorrect", value: String(user.totalWrongAnswers) },
    { label: "Questions practised", value: String(user.totalQuestionsAttempted), note: "across completed tests" },
  ];

  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="bg-card p-4">
          <dt className="text-sm text-ink-3">{s.label}</dt>
          <dd className="mt-1 font-display text-3xl text-ink">{s.value}</dd>
          {s.note && <p className="mt-0.5 text-xs text-ink-3">{s.note}</p>}
        </div>
      ))}
      {/* Fills the grid's last cell so the divider colour never shows through. */}
      <div aria-hidden className="bg-card" />
    </dl>
  );
}

/** Last 14 published days, one column each, three segments per column = tests completed. */
export function ConsistencyStrip({ days }: { days: DayListItem[] }) {
  const recent = [...days].sort((a, b) => (a.dayId < b.dayId ? -1 : 1)).slice(-14);
  if (recent.length === 0) return null;
  return (
    <figure>
      <div className="flex items-end gap-2 sm:gap-3" role="img" aria-label={`Tests completed on each of the last ${recent.length} published days`}>
        {recent.map((d) => (
          <div key={d.dayId} className="flex w-7 flex-col items-center gap-1.5 sm:w-9">
            <div className="flex w-full flex-col-reverse gap-0.5">
              {Array.from({ length: d.totalTests || 3 }).map((_, i) => (
                <span key={i} className={cn("h-3 rounded-sm", i < d.completedTests ? "bg-ok-600" : "bg-sunken")} />
              ))}
            </div>
            <span className="text-[0.65rem] font-medium text-ink-3">{formatWeekdayShort(d.dayId).slice(0, 2)}</span>
          </div>
        ))}
      </div>
      <figcaption className="mt-2 text-xs text-ink-3">Each block is one completed test. Gaps are days you didn&apos;t practise.</figcaption>
    </figure>
  );
}
