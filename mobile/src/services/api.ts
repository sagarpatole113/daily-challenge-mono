import { getIdToken } from "./firebase";
import type { ApiResponse } from "@shared/index";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// A request must never hang forever. Without a timeout, an unreachable API
// (wrong LAN IP, backend not running, phone switched networks/wifi->cell,
// device came back from sleep) leaves `fetch()` pending indefinitely.
// That's what was causing the "splash screen stuck on loader, can't log
// in after a while" symptom: app/_layout.tsx awaits `api.get("/users/me")`
// before it ever calls setAuthChecked(true), so one stuck fetch = stuck
// splash screen forever, with no error shown. 15s is generous for mobile
// networks but still bounded.
const REQUEST_TIMEOUT_MS = 15000;

export class ApiClientError extends Error {
  status: number;
  errors?: unknown[];
  constructor(message: string, status: number, errors?: unknown[]) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T> {
  const token = await getIdToken();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });
  } catch (err: any) {
    if (err?.name === "AbortError") {
      throw new ApiClientError(
        `Request to ${path} timed out. Check that the API server is running and reachable, and that EXPO_PUBLIC_API_URL points at it (a LAN IP, not localhost, for a physical device).`,
        0
      );
    }
    throw new ApiClientError(
      `Network request to ${path} failed. Check your connection and EXPO_PUBLIC_API_URL.`,
      0
    );
  } finally {
    clearTimeout(timeoutId);
  }

  let json: ApiResponse<T>;
  try {
    json = await res.json();
  } catch {
    throw new ApiClientError(`Unexpected response from server (status ${res.status}) for ${path}`, res.status);
  }

  if (!json.success) {
    throw new ApiClientError(json.message, res.status, json.errors);
  }
  return json.data;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body }),
};