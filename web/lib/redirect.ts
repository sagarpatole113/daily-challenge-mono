/**
 * Post-login redirect targets are limited to the authenticated area so the
 * `next` query parameter can never be used as an open redirect.
 */
export function safeNextPath(raw: string | null | undefined, fallback = "/dashboard"): string {
  if (!raw) return fallback;
  if (!raw.startsWith("/dashboard")) return fallback;
  if (raw.startsWith("//") || raw.includes("\\") || /[\u0000-\u001f]/.test(raw)) return fallback;
  // "/dashboardfoo" must not pass; only "/dashboard" or "/dashboard/..." / "?..."
  const rest = raw.slice("/dashboard".length);
  if (rest !== "" && !/^[/?#]/.test(rest)) return fallback;
  return raw;
}
