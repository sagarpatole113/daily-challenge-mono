export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function firstName(name: string | undefined | null): string {
  const n = (name ?? "").trim().split(/\s+/)[0];
  return n || "there";
}

/** Percent 0..100, safe for zero denominators. */
export function pct(part: number, whole: number): number {
  if (!whole) return 0;
  return Math.round((part / whole) * 1000) / 10;
}
