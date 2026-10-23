"use client";

import { DayRows } from "@/components/dashboard/dashboard-home";
import { ErrorState } from "@/components/ui/misc";
import { useDays } from "@/hooks/queries";

export function DaysList() {
  const days = useDays();
  const sorted = [...(days.data ?? [])].sort((a, b) => (a.dayId < b.dayId ? 1 : -1));
  return (
    <div>
      <h1 className="text-4xl sm:text-5xl">Practice days</h1>
      <p className="mt-3 max-w-xl text-ink-2">Every published day, newest first. Open a day to see its three tests, your results and answer reviews.</p>
      {days.isError ? (
        <ErrorState className="mt-6" message={days.error.message} onRetry={() => days.refetch()} />
      ) : (
        <DayRows days={sorted} loading={days.isPending} />
      )}
    </div>
  );
}
