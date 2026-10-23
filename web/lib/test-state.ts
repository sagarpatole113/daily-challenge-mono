import type { DailyTestWithState } from "@/types/shared";

export type TestState = "completed" | "in_progress" | "available" | "locked";

/** Display state taken straight from the API's flags. No unlock logic lives here. */
export function deriveTestState(t: Pick<DailyTestWithState, "completed" | "inProgress" | "unlocked">): TestState {
  if (t.completed) return "completed";
  if (t.inProgress) return "in_progress";
  if (t.unlocked) return "available";
  return "locked";
}

export function testHref(testId: string, dayId: string): string {
  return `/dashboard/test/${encodeURIComponent(testId)}?day=${encodeURIComponent(dayId)}`;
}

/** The next test the student can act on: in-progress first, then the first available one. */
export function nextActionableTest<T extends Pick<DailyTestWithState, "completed" | "inProgress" | "unlocked" | "testNumber">>(
  tests: T[],
): T | undefined {
  const sorted = [...tests].sort((a, b) => a.testNumber - b.testNumber);
  return sorted.find((t) => t.inProgress && !t.completed) ?? sorted.find((t) => t.unlocked && !t.completed);
}
