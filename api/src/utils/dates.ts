/** Formats a Date as a dayId string "YYYY-MM-DD" in server-local time (recommend running server in IST). */
export function toDayId(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayDayId(): string {
  return toDayId(new Date());
}

export function yesterdayDayId(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return toDayId(d);
}
