import { describe, expect, it } from "vitest";
import {
  computeStreak,
  formatMmSs,
  previousDayId,
  remainingMs,
  todayDayId,
  toDayId,
} from "@/lib/dates";
import type { DayListItem } from "@/types/shared";

const day = (dayId: string, completedTests: number): DayListItem => ({
  dayId,
  date: dayId,
  totalTests: 3,
  completedTests,
  currentUnlockedTest: Math.min(3, completedTests + 1),
  status: "ACTIVE",
});

describe("IST day ids", () => {
  it("rolls over at IST midnight, not UTC midnight", () => {
    // 2026-10-19 19:00 UTC == 2026-10-20 00:30 IST
    expect(toDayId(new Date("2026-10-19T19:00:00Z"))).toBe("2026-10-20");
    // 2026-10-19 18:00 UTC == 2026-10-19 23:30 IST
    expect(toDayId(new Date("2026-10-19T18:00:00Z"))).toBe("2026-10-19");
    expect(todayDayId(new Date("2026-10-20T06:00:00Z"))).toBe("2026-10-20");
  });
  it("computes the previous day across month boundaries", () => {
    expect(previousDayId("2026-11-01")).toBe("2026-10-31");
    expect(previousDayId("2026-01-01")).toBe("2025-12-31");
  });
});

describe("countdown helpers", () => {
  it("derives remaining time from the server expiry, never below zero", () => {
    const expires = "2026-10-20T10:00:00.000Z";
    const t = Date.parse("2026-10-20T09:30:00.000Z");
    expect(remainingMs(expires, t)).toBe(30 * 60 * 1000);
    expect(remainingMs(expires, Date.parse("2026-10-20T10:00:01.000Z"))).toBe(0);
  });
  it("corrects for a browser clock that runs behind the server", () => {
    const expires = "2026-10-20T10:00:00.000Z";
    // browser says 09:30, but the server is really 2 minutes ahead
    const browserNow = Date.parse("2026-10-20T09:30:00.000Z");
    expect(remainingMs(expires, browserNow, 2 * 60 * 1000)).toBe(28 * 60 * 1000);
  });
  it("treats an unparseable expiry as expired", () => {
    expect(remainingMs("not-a-date", Date.now())).toBe(0);
  });
  it("formats mm:ss", () => {
    expect(formatMmSs(3600)).toBe("60:00");
    expect(formatMmSs(65)).toBe("01:05");
    expect(formatMmSs(-5)).toBe("00:00");
  });
});

describe("computeStreak", () => {
  it("counts consecutive practised published days", () => {
    const days = [day("2026-10-20", 3), day("2026-10-19", 1), day("2026-10-18", 3), day("2026-10-17", 0)];
    expect(computeStreak(days, "2026-10-20").count).toBe(3);
  });
  it("does not break the streak when today has not started yet", () => {
    const days = [day("2026-10-20", 0), day("2026-10-19", 2), day("2026-10-18", 1)];
    expect(computeStreak(days, "2026-10-20").count).toBe(2);
  });
  it("breaks on a published day with nothing completed", () => {
    const days = [day("2026-10-20", 1), day("2026-10-19", 0), day("2026-10-18", 3)];
    expect(computeStreak(days, "2026-10-20").count).toBe(1);
  });
  it("is not affected by unpublished gaps (they are absent from the list)", () => {
    const days = [day("2026-10-20", 1), day("2026-10-17", 2)];
    expect(computeStreak(days, "2026-10-20").count).toBe(2);
  });
  it("ignores future-dated batches", () => {
    const days = [day("2026-10-22", 0), day("2026-10-20", 1)];
    expect(computeStreak(days, "2026-10-20").count).toBe(1);
  });
  it("flags truncation when the 30-day window is fully consumed", () => {
    const days = Array.from({ length: 30 }, (_, i) => day(`2026-09-${String(30 - i).padStart(2, "0")}`, 1));
    const s = computeStreak(days, "2026-09-30");
    expect(s.count).toBe(30);
    expect(s.truncated).toBe(true);
  });
  it("returns zero for no data", () => {
    expect(computeStreak([], "2026-10-20")).toEqual({ count: 0, truncated: false });
  });
});
