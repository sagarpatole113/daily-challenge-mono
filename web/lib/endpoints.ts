import { api, isApiError } from "@/lib/api";
import { apiOrigin } from "@/lib/env";
import type {
  AttemptDetail,
  DayDetail,
  SaveAnswerBody,
  StartTestResponse,
  UpsertProfileBody,
} from "@/lib/api-types";
import type {
  AttemptResult,
  DailyTestWithState,
  DayListItem,
  ReviewQuestionItem,
  User,
} from "@/types/shared";

/**
 * One function per existing API route. Contracts verified against
 * api/src/modules/* (see docs/API_CONTRACTS.md). Do not add routes here that
 * the API doesn't already expose.
 */
export const endpoints = {
  getMe: () => api.get<User>("/users/me"),
  upsertProfile: (body: UpsertProfileBody) => api.post<User>("/users/profile", body),

  getDays: () => api.get<DayListItem[]>("/days"),
  getDay: (dayId: string) => api.get<DayDetail>(`/days/${encodeURIComponent(dayId)}`),
  getTestsForDay: (dayId: string) => api.get<DailyTestWithState[]>(`/days/${encodeURIComponent(dayId)}/tests`),

  startTest: (testId: string, dayId: string) =>
    api.post<StartTestResponse>(`/tests/${encodeURIComponent(testId)}/start`, { dayId }),
  getAttempt: (attemptId: string) => api.get<AttemptDetail>(`/attempts/${encodeURIComponent(attemptId)}`),
  saveAnswer: (attemptId: string, body: SaveAnswerBody) =>
    api.post<{ saved: boolean }>(`/attempts/${encodeURIComponent(attemptId)}/answers`, body),
  submitAttempt: (attemptId: string) =>
    api.post<AttemptResult>(`/attempts/${encodeURIComponent(attemptId)}/submit`),
  expireAttempt: (attemptId: string) =>
    api.post<AttemptResult>(`/attempts/${encodeURIComponent(attemptId)}/expire`),
  getResult: (attemptId: string) => api.get<AttemptResult>(`/attempts/${encodeURIComponent(attemptId)}/result`),
  getReview: (attemptId: string) =>
    api.get<ReviewQuestionItem[]>(`/attempts/${encodeURIComponent(attemptId)}/review`),
};

/**
 * Estimates (serverClock - browserClock) in ms using the API's unauthenticated
 * /health route (server root, outside /api/v1). Used only to make the
 * countdown display honest on devices with a wrong clock; the server still
 * decides expiry. Returns 0 on any failure.
 */
export async function fetchServerClockOffsetMs(fetchImpl: typeof fetch = fetch): Promise<number> {
  try {
    const t0 = Date.now();
    const res = await fetchImpl(`${apiOrigin()}/health`, { cache: "no-store", credentials: "omit" });
    const t1 = Date.now();
    const json = (await res.json()) as { data?: { time?: string } };
    const server = Date.parse(json.data?.time ?? "");
    if (Number.isNaN(server)) return 0;
    return Math.round(server - (t0 + t1) / 2);
  } catch {
    return 0;
  }
}

export { isApiError };
