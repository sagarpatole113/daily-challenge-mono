import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { useAttemptStore } from "../store/attemptStore";
import { useTimerStore } from "../store/timerStore";
import { useAuthStore } from "../store/authStore";
import { enqueueAndSync } from "../utils/syncQueue";
import type {
  AttemptResult,
  QuestionAnswerStatus,
  QuestionPublic,
  ReviewQuestionItem,
  User,
} from "@shared/index";

interface StartTestResponse {
  attemptId: string;
  startedAt: string;
  expiresAt: string;
  durationMinutes: number;
  questions: QuestionPublic[];
}

/** Starts (or resumes) a test attempt and hydrates the attempt + timer stores. */
export function useStartTest() {
  const loadAttempt = useAttemptStore((s) => s.loadAttempt);
  const setExpiresAt = useTimerStore((s) => s.setExpiresAt);

  return useMutation({
    mutationFn: ({ dayId, testId }: { dayId: string; testId: string }) =>
      api.post<StartTestResponse>(`/tests/${testId}/start`, { dayId }),
    onSuccess: (data, variables) => {
      loadAttempt({
        attemptId: data.attemptId,
        testId: variables.testId,
        dayId: variables.dayId,
        questions: data.questions,
      });
      setExpiresAt(data.expiresAt);
    },
  });
}

/** Debounced-by-caller answer save: writes locally first, then syncs (with offline queue). */
export function useSaveAnswer(attemptId: string | null) {
  return useMutation({
    mutationFn: async (params: {
      questionId: string;
      selectedOptionId: string | null;
      status: QuestionAnswerStatus;
    }) => {
      if (!attemptId) return;
      await enqueueAndSync({ attemptId, queuedAt: Date.now(), ...params });
    },
  });
}

// finalizeAttempt (submit/expire) on the API updates the user's aggregate
// stats (totalTestsCompleted, totalScore, bestScore, ...) server-side, but
// nothing on the client ever pulled that fresh data back down. The Home
// screen's "Tests Completed" / "Average Score" boxes read directly from
// authStore.profile, which is only ever set at login/signup — so it sat
// stale until the next full app restart. The Profile screen was slightly
// better off (it re-fetches via react-query) but seeded that query with
// the same stale `profile` as `initialData` with no `initialDataUpdatedAt`,
// so with the app's 30s default staleTime it could go a while before
// refetching too.
//
// Fix: after a successful submit/expire, re-fetch /users/me once and push
// it into both the shared zustand store (so Home's direct read updates
// immediately) and the "profile" query cache (so Profile's react-query
// hook doesn't show stale data either).
async function refreshProfile(queryClient: ReturnType<typeof useQueryClient>) {
  try {
    const fresh = await api.get<User>("/users/me");
    useAuthStore.getState().setProfile(fresh);
    queryClient.setQueryData(["profile"], fresh);
  } catch {
    // Non-fatal — worst case the Profile screen's own query will retry
    // this the next time it's focused.
  }
}

export function useSubmitAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (attemptId: string) => api.post<AttemptResult>(`/attempts/${attemptId}/submit`),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["days"] });
      await refreshProfile(queryClient);
    },
  });
}

export function useExpireAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (attemptId: string) => api.post<AttemptResult>(`/attempts/${attemptId}/expire`),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["days"] });
      await refreshProfile(queryClient);
    },
  });
}

export function useAttemptResult(attemptId: string | undefined) {
  return useQuery({
    queryKey: ["attempts", attemptId, "result"],
    queryFn: () => api.get<AttemptResult>(`/attempts/${attemptId}/result`),
    enabled: !!attemptId,
  });
}

export function useAttemptReview(attemptId: string | undefined) {
  return useQuery({
    queryKey: ["attempts", attemptId, "review"],
    queryFn: () => api.get<ReviewQuestionItem[]>(`/attempts/${attemptId}/review`),
    enabled: !!attemptId,
  });
}
