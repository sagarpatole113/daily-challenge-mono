import { describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api";
import { expireWithRetry, warnLevel } from "@/lib/expire";

const noSleep = async () => {};

describe("expireWithRetry", () => {
  it("returns the server result on success", async () => {
    const expire = vi.fn().mockResolvedValue({ status: "TIME_EXPIRED" });
    await expect(expireWithRetry(expire, { sleep: noSleep })).resolves.toEqual({ status: "TIME_EXPIRED" });
    expect(expire).toHaveBeenCalledTimes(1);
  });
  it("waits and retries while the server says it has not expired yet (403, browser clock ahead)", async () => {
    const expire = vi
      .fn()
      .mockRejectedValueOnce(new ApiError("Attempt has not yet expired.", 403, "http"))
      .mockRejectedValueOnce(new ApiError("Attempt has not yet expired.", 403, "http"))
      .mockResolvedValue({ ok: true });
    const sleep = vi.fn(noSleep);
    await expect(expireWithRetry(expire, { sleep, delayMs: 50 })).resolves.toEqual({ ok: true });
    expect(expire).toHaveBeenCalledTimes(3);
    expect(sleep).toHaveBeenCalledWith(50);
  });
  it("retries transient network errors", async () => {
    const expire = vi.fn().mockRejectedValueOnce(new ApiError("offline", 0, "network")).mockResolvedValue(1);
    await expect(expireWithRetry(expire, { sleep: noSleep })).resolves.toBe(1);
  });
  it("does not retry permanent errors", async () => {
    const expire = vi.fn().mockRejectedValue(new ApiError("Attempt not found", 404, "http"));
    await expect(expireWithRetry(expire, { sleep: noSleep })).rejects.toMatchObject({ status: 404 });
    expect(expire).toHaveBeenCalledTimes(1);
  });
  it("gives up after the configured attempts", async () => {
    const expire = vi.fn().mockRejectedValue(new ApiError("not yet", 403, "http"));
    await expect(expireWithRetry(expire, { sleep: noSleep, attempts: 3 })).rejects.toMatchObject({ status: 403 });
    expect(expire).toHaveBeenCalledTimes(3);
  });
});

describe("warnLevel", () => {
  it("steps at 10, 5 and 1 minutes", () => {
    expect(warnLevel(3600)).toBe("none");
    expect(warnLevel(601)).toBe("none");
    expect(warnLevel(600)).toBe("ten");
    expect(warnLevel(300)).toBe("five");
    expect(warnLevel(60)).toBe("one");
    expect(warnLevel(0)).toBe("one");
  });
});
