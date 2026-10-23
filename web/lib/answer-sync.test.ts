import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AnswerSync, type SyncSnapshot } from "@/lib/answer-sync";
import { ApiError } from "@/lib/api";
import type { SaveAnswerBody } from "@/lib/api-types";

const body = (questionId: string, sel: string | null): SaveAnswerBody => ({
  questionId,
  selectedOptionId: sel,
  status: sel ? "ANSWERED" : "NOT_ANSWERED",
});

function memoryStorage() {
  const m = new Map<string, string>();
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
    raw: m,
  };
}

describe("AnswerSync", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("sends each answer to the API and empties the queue", async () => {
    const send = vi.fn().mockResolvedValue({ saved: true });
    const s = new AnswerSync({ attemptId: "att", send });
    s.enqueue(body("q1", "A"));
    s.enqueue(body("q2", "B"));
    await s.flush();
    expect(send).toHaveBeenCalledTimes(2);
    expect(s.pendingCount).toBe(0);
  });

  it("coalesces rapid changes to one question into the latest value", async () => {
    let release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    const send = vi.fn().mockImplementationOnce(() => gate).mockResolvedValue({ saved: true });
    const s = new AnswerSync({ attemptId: "att", send });
    s.enqueue(body("q1", "A")); // starts sending A and blocks on the gate
    s.enqueue(body("q1", "B")); // supersedes while A is in flight
    s.enqueue(body("q1", "C"));
    release();
    await s.flush();
    const sent = send.mock.calls.map((c) => (c[0] as SaveAnswerBody).selectedOptionId);
    expect(sent).toEqual(["A", "C"]); // B was coalesced away; final state C reached the server
    expect(s.pendingCount).toBe(0);
  });

  it("keeps answers queued and retries with backoff after a network failure", async () => {
    const send = vi
      .fn()
      .mockRejectedValueOnce(new ApiError("offline", 0, "network"))
      .mockResolvedValue({ saved: true });
    const snaps: SyncSnapshot[] = [];
    const s = new AnswerSync({ attemptId: "att", send, onChange: (x) => snaps.push(x), backoffMs: [1000] });
    s.enqueue(body("q1", "A"));
    await s.flush();
    expect(s.pendingCount).toBe(1);
    expect(snaps.at(-1)?.phase).toBe("retrying");

    await vi.advanceTimersByTimeAsync(1000);
    expect(send).toHaveBeenCalledTimes(2);
    expect(s.pendingCount).toBe(0);
    expect(snaps.at(-1)?.phase).toBe("idle");
  });

  it("stops and clears on 409 (attempt already finalized)", async () => {
    const send = vi.fn().mockRejectedValue(new ApiError("Cannot modify answers on a completed attempt", 409, "http"));
    const s = new AnswerSync({ attemptId: "att", send });
    s.enqueue(body("q1", "A"));
    await s.flush();
    expect(s.pendingCount).toBe(0);
    s.enqueue(body("q2", "B")); // ignored once closed
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("drops an answer the API rejects as invalid instead of looping forever", async () => {
    const send = vi
      .fn()
      .mockRejectedValueOnce(new ApiError("Validation failed", 422, "http"))
      .mockResolvedValue({ saved: true });
    const s = new AnswerSync({ attemptId: "att", send });
    s.enqueue(body("bad", "A"));
    s.enqueue(body("good", "B"));
    await s.flush();
    expect(send).toHaveBeenCalledTimes(2);
    expect(s.pendingCount).toBe(0);
  });

  it("persists unsaved answers and restores them after a reload", async () => {
    const storage = memoryStorage();
    const failing = vi.fn().mockRejectedValue(new ApiError("offline", 0, "network"));
    const a = new AnswerSync({ attemptId: "att", send: failing, storage });
    a.enqueue(body("q1", "D"));
    await a.flush();
    a.dispose(); // timer only; queue state persists
    expect(storage.raw.get("saatatya:pending:att")).toContain("q1");

    const b = new AnswerSync({ attemptId: "att", send: vi.fn().mockResolvedValue({}), storage });
    expect(b.restored()).toEqual([body("q1", "D")]);
    await b.flush();
    expect(b.pendingCount).toBe(0);
    expect(storage.raw.has("saatatya:pending:att")).toBe(false);
  });

  it("ignores corrupt stored data", () => {
    const storage = memoryStorage();
    storage.setItem("saatatya:pending:att", "{not json");
    const s = new AnswerSync({ attemptId: "att", send: vi.fn(), storage });
    expect(s.restored()).toEqual([]);
  });
});

describe("AnswerSync lifecycle", () => {
  it("keeps working after dispose() (React StrictMode remount)", async () => {
    const send = vi.fn().mockResolvedValue({});
    const s = new AnswerSync({ attemptId: "att", send });
    s.dispose();
    s.enqueue(body("q1", "A"));
    await s.flush();
    expect(send).toHaveBeenCalledTimes(1);
  });
});
