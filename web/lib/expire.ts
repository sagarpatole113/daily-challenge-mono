import { ApiError } from "@/lib/api";

export interface ExpireOptions {
  attempts?: number;
  delayMs?: number;
  sleep?: (ms: number) => Promise<void>;
}

/**
 * Finalise an attempt whose countdown reached zero in the browser.
 *
 * The server only accepts /expire once its own `expiresAt` has passed (403
 * otherwise), so if the browser clock runs ahead we simply wait and ask again.
 * Network errors are retried too. Anything else (404, 401...) is final.
 */
export async function expireWithRetry<T>(expire: () => Promise<T>, o: ExpireOptions = {}): Promise<T> {
  const attempts = o.attempts ?? 8;
  const delay = o.delayMs ?? 2000;
  const sleep = o.sleep ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
  let lastError: unknown;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await expire();
    } catch (err) {
      lastError = err;
      const retryable = err instanceof ApiError && (err.status === 403 || err.isRetryable);
      if (!retryable || i === attempts - 1) throw err;
      await sleep(delay);
    }
  }
  throw lastError;
}

export type WarnLevel = "none" | "ten" | "five" | "one";

/** Thresholds at which a screen-reader announcement is made (not every second). */
export function warnLevel(remainingSeconds: number): WarnLevel {
  if (remainingSeconds <= 60) return "one";
  if (remainingSeconds <= 300) return "five";
  if (remainingSeconds <= 600) return "ten";
  return "none";
}
