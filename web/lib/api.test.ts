import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, api, configureApiClient } from "@/lib/api";

const BASE = "https://api.example.test/api/v1";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

describe("api client", () => {
  const getToken = vi.fn<(force?: boolean) => Promise<string | null>>();
  const onUnauthorized = vi.fn();

  beforeEach(() => {
    getToken.mockReset();
    onUnauthorized.mockReset();
    configureApiClient({ getToken, onUnauthorized });
  });

  it("sends the Firebase ID token as a Bearer header and unwraps the envelope", async () => {
    getToken.mockResolvedValue("tok-1");
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ success: true, data: { id: "u1" }, message: "ok" }));

    const out = await api.get<{ id: string }>("/users/me", { baseUrl: BASE, fetchImpl });

    expect(out).toEqual({ id: "u1" });
    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${BASE}/users/me`);
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer tok-1");
    expect(init.credentials).toBe("omit");
    expect(init.cache).toBe("no-store");
  });

  it("POSTs JSON bodies exactly as given", async () => {
    getToken.mockResolvedValue("t");
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ success: true, data: { attemptId: "a" }, message: "" }));
    await api.post("/tests/test-1/start", { dayId: "2026-09-07" }, { baseUrl: BASE, fetchImpl });
    const [, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe("POST");
    expect(init.body).toBe(JSON.stringify({ dayId: "2026-09-07" }));
  });

  it("refreshes the token once on 401 and retries", async () => {
    getToken.mockResolvedValueOnce("stale").mockResolvedValueOnce("fresh");
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ success: false, message: "Invalid or expired authentication token" }, 401))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: [1], message: "" }));

    const out = await api.get<number[]>("/days", { baseUrl: BASE, fetchImpl });

    expect(out).toEqual([1]);
    expect(getToken).toHaveBeenNthCalledWith(2, true);
    const second = fetchImpl.mock.calls[1] as [string, RequestInit];
    expect((second[1].headers as Record<string, string>).Authorization).toBe("Bearer fresh");
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it("treats a second 401 as an expired session", async () => {
    getToken.mockResolvedValue("t");
    const fetchImpl = vi.fn().mockImplementation(async () => jsonResponse({ success: false, message: "nope" }, 401));
    await expect(api.get("/days", { baseUrl: BASE, fetchImpl })).rejects.toMatchObject({ status: 401, kind: "auth" });
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("does not call the API when signed out", async () => {
    getToken.mockResolvedValue(null);
    const fetchImpl = vi.fn();
    await expect(api.get("/days", { baseUrl: BASE, fetchImpl })).rejects.toMatchObject({ status: 401, kind: "auth" });
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(onUnauthorized).toHaveBeenCalled();
  });

  it("surfaces 403 (locked test) with the server's message and does not sign out", async () => {
    getToken.mockResolvedValue("t");
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(jsonResponse({ success: false, message: "Test 2 is locked. Complete test 1 first." }, 403));
    const err = (await api.post("/tests/test-2/start", { dayId: "d" }, { baseUrl: BASE, fetchImpl }).catch((e: unknown) => e)) as ApiError;
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ status: 403, kind: "http", message: "Test 2 is locked. Complete test 1 first." });
    expect(err.isRetryable).toBe(false);
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it("classifies network failures as retryable", async () => {
    getToken.mockResolvedValue("t");
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
    const err = (await api.get("/days", { baseUrl: BASE, fetchImpl }).catch((e: unknown) => e)) as ApiError;
    expect(err).toMatchObject({ kind: "network", status: 0 });
    expect(err.isRetryable).toBe(true);
  });

  it("times out hung requests", async () => {
    getToken.mockResolvedValue("t");
    const fetchImpl = vi.fn(
      (_url: string, init?: RequestInit) =>
        new Promise<Response>((_res, rej) => {
          init?.signal?.addEventListener("abort", () => rej(new DOMException("aborted", "AbortError")));
        }),
    );
    const err = (await api
      .get("/days", { baseUrl: BASE, fetchImpl: fetchImpl as unknown as typeof fetch, timeoutMs: 20 })
      .catch((e: unknown) => e)) as ApiError;
    expect(err).toMatchObject({ kind: "timeout" });
  });

  it("rejects responses that are not the expected envelope", async () => {
    getToken.mockResolvedValue("t");
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ hello: "world" }, 200));
    await expect(api.get("/days", { baseUrl: BASE, fetchImpl })).rejects.toMatchObject({ kind: "parse" });
  });

  it("reports a missing API base URL clearly", async () => {
    getToken.mockResolvedValue("t");
    await expect(api.get("/days", { baseUrl: "" })).rejects.toMatchObject({ kind: "config" });
  });
});
