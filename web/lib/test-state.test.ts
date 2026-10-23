import { describe, expect, it } from "vitest";
import { deriveTestState, nextActionableTest, testHref } from "@/lib/test-state";

const t = (n: number, o: Partial<{ completed: boolean; inProgress: boolean; unlocked: boolean }> = {}) => ({
  testNumber: n,
  completed: false,
  inProgress: false,
  unlocked: false,
  ...o,
});

describe("test state (display only; the API decides unlocking)", () => {
  it("maps API flags to states", () => {
    expect(deriveTestState(t(1, { completed: true, unlocked: true }))).toBe("completed");
    expect(deriveTestState(t(1, { inProgress: true, unlocked: true }))).toBe("in_progress");
    expect(deriveTestState(t(1, { unlocked: true }))).toBe("available");
    expect(deriveTestState(t(2))).toBe("locked");
  });
  it("finds the next action: resume before start, never a locked test", () => {
    expect(nextActionableTest([t(1, { completed: true, unlocked: true }), t(2, { unlocked: true }), t(3)])?.testNumber).toBe(2);
    expect(nextActionableTest([t(1, { completed: true, unlocked: true }), t(2, { inProgress: true, unlocked: true }), t(3)])?.testNumber).toBe(2);
    expect(nextActionableTest([t(1, { completed: true, unlocked: true }), t(2, { completed: true, unlocked: true }), t(3, { completed: true, unlocked: true })])).toBeUndefined();
    expect(nextActionableTest([t(1), t(2), t(3)])).toBeUndefined();
  });
  it("builds the test URL with the day id", () => {
    expect(testHref("test-1", "2026-09-07")).toBe("/dashboard/test/test-1?day=2026-09-07");
  });
});
