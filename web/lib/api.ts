import { env } from "@/lib/env";

export type ApiErrorKind = "http" | "network" | "timeout" | "parse" | "config" | "auth";

export class ApiError extends Error {
  readonly status: number;
  readonly kind: ApiErrorKind;
  readonly errors?: unknown[];

  constructor(message: string, status: number, kind: ApiErrorKind, errors?: unknown[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.kind = kind;
    this.errors = errors;
  }

  get isRetryable(): boolean {
    return this.kind === "network" || this.kind === "timeout" || (this.kind === "http" && this.status >= 500);
  }
}

export function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError;
}

export type TokenProvider = (forceRefresh?: boolean) => Promise<string | null>;

let getToken: TokenProvider = async () => null;
let onUnauthorized: (() => void) | null = null;

/** Wired once by the auth provider. Keeps this module free of Firebase imports. */
export function configureApiClient(opts: { getToken: TokenProvider; onUnauthorized?: () => void }) {
  getToken = opts.getToken;
  onUnauthorized = opts.onUnauthorized ?? null;
}

export const DEFAULT_TIMEOUT_MS = 15_000;

interface RequestOptions {
  method?: "GET" | "POST";
  body?: unknown;
  signal?: AbortSignal;
  timeoutMs?: number;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
}

interface Envelope<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: unknown[];
}

async function attempt<T>(path: string, token: string, o: RequestOptions): Promise<{ status: number; json: Envelope<T> }> {
  const base = o.baseUrl ?? env.apiUrl;
  const doFetch = o.fetchImpl ?? fetch;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(new DOMException("timeout", "TimeoutError")), o.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const onAbort = () => controller.abort(o.signal?.reason);
  o.signal?.addEventListener("abort", onAbort, { once: true });

  let res: Response;
  try {
    res = await doFetch(`${base}${path}`, {
      method: o.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: o.body === undefined ? undefined : JSON.stringify(o.body),
      signal: controller.signal,
      cache: "no-store",
      credentials: "omit", // bearer token only; never send cookies to the API
    });
  } catch (err) {
    if (o.signal?.aborted) throw err; // caller cancelled; let it propagate
    if (controller.signal.aborted) {
      throw new ApiError("The request took too long. Check your connection and try again.", 0, "timeout");
    }
    throw new ApiError("Can't reach the server. Check your connection and try again.", 0, "network");
  } finally {
    clearTimeout(timeout);
    o.signal?.removeEventListener("abort", onAbort);
  }

  let json: Envelope<T>;
  try {
    json = (await res.json()) as Envelope<T>;
  } catch {
    throw new ApiError(`Unexpected response from the server (status ${res.status}).`, res.status, "parse");
  }
  if (typeof json !== "object" || json === null || typeof json.success !== "boolean") {
    throw new ApiError(`Unexpected response from the server (status ${res.status}).`, res.status, "parse");
  }
  return { status: res.status, json };
}

/**
 * Authenticated request against the existing API.
 * - Sends `Authorization: Bearer <Firebase ID token>`.
 * - On 401, forces ONE token refresh and retries once; if it still fails the
 *   session is treated as expired.
 * - Unwraps the `{ success, data, message }` envelope.
 */
export async function apiRequest<T>(path: string, o: RequestOptions = {}): Promise<T> {
  if (!(o.baseUrl ?? env.apiUrl)) {
    throw new ApiError("The API address isn't configured (NEXT_PUBLIC_API_URL).", 0, "config");
  }

  let token = await getToken(false);
  if (!token) {
    onUnauthorized?.();
    throw new ApiError("You're signed out. Please log in again.", 401, "auth");
  }

  let result = await attempt<T>(path, token, o);

  if (result.status === 401) {
    token = await getToken(true);
    if (token) result = await attempt<T>(path, token, o);
    if (result.status === 401 || !token) {
      onUnauthorized?.();
      throw new ApiError("Your session has expired. Please log in again.", 401, "auth");
    }
  }

  const { json, status } = result;
  if (!json.success) {
    throw new ApiError(json.message || `Request failed (status ${status}).`, status, "http", json.errors);
  }
  return json.data as T;
}

export const api = {
  get: <T>(path: string, o?: Omit<RequestOptions, "method" | "body">) => apiRequest<T>(path, { ...o, method: "GET" }),
  post: <T>(path: string, body?: unknown, o?: Omit<RequestOptions, "method" | "body">) =>
    apiRequest<T>(path, { ...o, method: "POST", body }),
};
