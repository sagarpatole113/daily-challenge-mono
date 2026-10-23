import { ApiError } from "@/lib/api";
import type { SaveAnswerBody } from "@/lib/api-types";

/**
 * Reliable answer saving for an active attempt.
 *
 * - Optimistic UI: callers update local state first, then `enqueue`.
 * - Only the latest value per question is kept (coalescing).
 * - Unsaved answers are mirrored to sessionStorage so a refresh or crash
 *   doesn't drop them (option ids only: nothing sensitive).
 * - Transient failures (network, timeout, 5xx) retry with backoff.
 * - 409 means the attempt is already finalized: stop, nothing left to save.
 *
 * The server stays authoritative; this class only guarantees delivery.
 */
export type SyncPhase = "idle" | "saving" | "retrying" | "closed";

export interface SyncSnapshot {
  phase: SyncPhase;
  pending: number;
  lastError: string | null;
}

type Verdict = "retry" | "closed" | "drop";

export function defaultClassify(err: unknown): Verdict {
  if (err instanceof ApiError) {
    if (err.status === 409) return "closed"; // attempt finalized / expired
    if (err.kind === "auth" || err.status === 401) return "closed";
    if (err.isRetryable) return "retry";
    return "drop"; // 400/403/404/422: repeating can't help
  }
  return "retry";
}

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export interface AnswerSyncOptions {
  attemptId: string;
  send: (body: SaveAnswerBody) => Promise<unknown>;
  onChange?: (s: SyncSnapshot) => void;
  storage?: StorageLike | null;
  classify?: (err: unknown) => Verdict;
  backoffMs?: number[];
}

const KEY = (attemptId: string) => `saatatya:pending:${attemptId}`;

export class AnswerSync {
  private readonly opts: AnswerSyncOptions;
  private readonly pending = new Map<string, SaveAnswerBody>();
  private flushing: Promise<void> | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private failures = 0;
  private phase: SyncPhase = "idle";
  private lastError: string | null = null;
  private listener: ((s: SyncSnapshot) => void) | null = null;

  constructor(opts: AnswerSyncOptions) {
    this.opts = opts;
    for (const item of this.readStored()) this.pending.set(item.questionId, item);
  }

  /** Items restored from a previous page load, to overlay on server state. */
  restored(): SaveAnswerBody[] {
    return [...this.pending.values()];
  }

  /** Subscribe to status changes (for the UI). Returns an unsubscribe function. */
  listen(fn: (s: SyncSnapshot) => void): () => void {
    this.listener = fn;
    fn(this.snapshot());
    return () => {
      if (this.listener === fn) this.listener = null;
    };
  }

  snapshot(): SyncSnapshot {
    return { phase: this.phase, pending: this.pending.size, lastError: this.lastError };
  }

  get pendingCount(): number {
    return this.pending.size;
  }

  enqueue(body: SaveAnswerBody): void {
    if (this.phase === "closed") return;
    this.pending.delete(body.questionId); // re-insert so latest goes last
    this.pending.set(body.questionId, body);
    this.persist();
    void this.flush();
  }

  /** Resolves when the queue is empty, or when a send failed and a retry is scheduled. */
  flush(): Promise<void> {
    if (this.phase === "closed") return Promise.resolve();
    if (this.flushing) return this.flushing;
    this.cancelTimer();
    this.flushing = this.run().finally(() => {
      this.flushing = null;
    });
    return this.flushing;
  }

  /** For "back online" events: retry immediately instead of waiting for backoff. */
  retryNow(): Promise<void> {
    this.failures = 0;
    return this.flush();
  }

  /**
   * Stops the pending retry timer. Deliberately reversible: React StrictMode
   * runs effect cleanup then re-mounts, and the next flush() resumes normally.
   */
  dispose(): void {
    this.cancelTimer();
  }

  /** Call after the attempt is finalized so stale items can't resurrect on reload. */
  clearStored(): void {
    this.pending.clear();
    try {
      this.opts.storage?.removeItem(KEY(this.opts.attemptId));
    } catch {
      /* storage unavailable */
    }
    this.phase = "closed";
    this.emit();
  }

  private async run(): Promise<void> {
    const classify = this.opts.classify ?? defaultClassify;
    this.setPhase("saving");
    for (;;) {
      const next = this.pending.values().next();
      if (next.done) break;
      const item = next.value;
      try {
        await this.opts.send(item);
        if (this.pending.get(item.questionId) === item) this.pending.delete(item.questionId);
        this.failures = 0;
        this.lastError = null;
        this.persist();
      } catch (err) {
        const verdict = classify(err);
        this.lastError = err instanceof Error ? err.message : "Couldn't save an answer.";
        if (verdict === "closed") {
          this.pending.clear();
          this.persist();
          this.setPhase("closed");
          return;
        }
        if (verdict === "drop") {
          if (this.pending.get(item.questionId) === item) this.pending.delete(item.questionId);
          this.persist();
          continue;
        }
        this.failures += 1;
        this.setPhase("retrying");
        this.scheduleRetry();
        return;
      }
    }
    this.setPhase("idle");
  }

  private scheduleRetry() {
    this.cancelTimer();
    const steps = this.opts.backoffMs ?? [1500, 3000, 6000, 12000];
    const delay = steps[Math.min(this.failures - 1, steps.length - 1)] ?? 12000;
    this.timer = setTimeout(() => {
      this.timer = null;
      void this.flush();
    }, delay);
  }

  private cancelTimer() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }

  private setPhase(p: SyncPhase) {
    this.phase = p;
    this.emit();
  }

  private emit() {
    const snap = this.snapshot();
    this.opts.onChange?.(snap);
    this.listener?.(snap);
  }

  private persist() {
    try {
      const { storage, attemptId } = this.opts;
      if (!storage) return;
      if (this.pending.size === 0) storage.removeItem(KEY(attemptId));
      else storage.setItem(KEY(attemptId), JSON.stringify([...this.pending.values()]));
    } catch {
      /* storage unavailable or full: in-memory queue still works */
    }
    this.emit();
  }

  private readStored(): SaveAnswerBody[] {
    try {
      const raw = this.opts.storage?.getItem(KEY(this.opts.attemptId));
      if (!raw) return [];
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(
        (x): x is SaveAnswerBody =>
          !!x && typeof x === "object" && typeof (x as SaveAnswerBody).questionId === "string" && "status" in x,
      );
    } catch {
      return [];
    }
  }
}
