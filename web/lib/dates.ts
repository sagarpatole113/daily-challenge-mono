import type { DayListItem } from "@/types/shared";

/**
 * The API derives `dayId` (YYYY-MM-DD) from server-local time and recommends
 * running in IST. The target audience is in Maharashtra, so the web app
 * always reasons about "today" in Asia/Kolkata, independent of the browser's
 * own time zone.
 */
export const APP_TIME_ZONE = "Asia/Kolkata";

const dayIdFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function toDayId(date: Date): string {
  return dayIdFormatter.format(date); // en-CA => YYYY-MM-DD
}

export function todayDayId(now: Date = new Date()): string {
  return toDayId(now);
}

export function previousDayId(dayId: string): string {
  const d = dayIdToDate(dayId);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

/** Parses a dayId at 12:00 UTC so formatting in any zone stays on the same date. */
export function dayIdToDate(dayId: string): Date {
  const [y, m, d] = dayId.split("-").map(Number);
  return new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1, 12, 0, 0));
}

export function formatDayLabel(dayId: string): string {
  return dayIdToDate(dayId).toLocaleDateString("en-IN", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatWeekdayShort(dayId: string): string {
  return dayIdToDate(dayId).toLocaleDateString("en-IN", { timeZone: "UTC", weekday: "short" });
}

export function formatLongDate(now: Date = new Date()): string {
  return now.toLocaleDateString("en-IN", {
    timeZone: APP_TIME_ZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** 3725 -> "62:05" (mm:ss, minutes may exceed 59 on purpose). */
export function formatMmSs(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

/** Remaining milliseconds until an ISO expiry, corrected by a server clock offset. */
export function remainingMs(expiresAtIso: string, nowMs: number, serverOffsetMs = 0): number {
  const expires = Date.parse(expiresAtIso);
  if (Number.isNaN(expires)) return 0;
  return Math.max(0, expires - (nowMs + serverOffsetMs));
}

export interface Streak {
  count: number;
  /** True when the whole 30-day window the API returns was consumed. */
  truncated: boolean;
}

/**
 * Consecutive PUBLISHED days (most recent first) on which the student
 * completed at least one test. Only data from GET /days is used.
 *
 * - Days that were never published don't break a streak (we only walk the
 *   list the API returns), so a content gap is never blamed on the student.
 * - Today is skipped if nothing was completed yet: the day isn't over.
 * - The API returns at most 30 days, so very long streaks are reported as
 *   truncated rather than guessed.
 */
export function computeStreak(days: DayListItem[], todayId: string): Streak {
  const sorted = [...days].sort((a, b) => (a.dayId < b.dayId ? 1 : a.dayId > b.dayId ? -1 : 0));
  let count = 0;
  for (const day of sorted) {
    if (day.dayId > todayId) continue; // ignore future-dated batches
    if (day.completedTests >= 1) {
      count += 1;
      continue;
    }
    if (day.dayId === todayId) continue; // today not started yet: keep going
    return { count, truncated: false };
  }
  return { count, truncated: sorted.length >= 30 };
}
