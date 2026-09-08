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

export function formatDayLabel(dayId: string): string {
  const [y, m, d] = dayId.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-IN", { month: "long", day: "numeric" });
}
