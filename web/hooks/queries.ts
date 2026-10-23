"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/providers";
import { ApiError } from "@/lib/api";
import { USERNAME_REGEX } from "@/lib/auth";
import { endpoints } from "@/lib/endpoints";
import type { User } from "@/types/shared";

/**
 * Every key is namespaced by the Firebase uid, and the whole cache is cleared
 * on account change (components/providers.tsx). Two layers so one student's
 * data can never be rendered for another.
 */
export const qk = {
  me: (uid: string) => ["u", uid, "me"] as const,
  days: (uid: string) => ["u", uid, "days"] as const,
  tests: (uid: string, dayId: string) => ["u", uid, "days", dayId, "tests"] as const,
  result: (uid: string, attemptId: string) => ["u", uid, "attempt", attemptId, "result"] as const,
  review: (uid: string, attemptId: string) => ["u", uid, "attempt", attemptId, "review"] as const,
};

/**
 * Mirrors the mobile app's self-heal: signup is two calls (Firebase account,
 * then POST /users/profile). If the second never happened, /users/me 404s
 * forever, so recreate the profile from the username encoded in the account's
 * synthetic email using the same endpoint signup uses.
 */
export async function loadOrHealProfile(email: string | null | undefined): Promise<User> {
  try {
    return await endpoints.getMe();
  } catch (err) {
    if (err instanceof ApiError && err.status === 404 && email) {
      const username = email.split("@")[0]?.toLowerCase() ?? "";
      if (USERNAME_REGEX.test(username)) {
        return endpoints.upsertProfile({ name: username, username });
      }
    }
    throw err;
  }
}

export function useMe() {
  const { uid, user } = useAuth();
  return useQuery({
    queryKey: qk.me(uid ?? "none"),
    queryFn: () => loadOrHealProfile(user?.email),
    enabled: !!uid,
  });
}

export function useDays() {
  const { uid } = useAuth();
  return useQuery({
    queryKey: qk.days(uid ?? "none"),
    queryFn: endpoints.getDays,
    enabled: !!uid,
  });
}

export function useTestsForDay(dayId: string | undefined) {
  const { uid } = useAuth();
  return useQuery({
    queryKey: qk.tests(uid ?? "none", dayId ?? "none"),
    queryFn: () => endpoints.getTestsForDay(dayId as string),
    enabled: !!uid && !!dayId,
  });
}

export function useResult(attemptId: string | undefined) {
  const { uid } = useAuth();
  return useQuery({
    queryKey: qk.result(uid ?? "none", attemptId ?? "none"),
    queryFn: () => endpoints.getResult(attemptId as string),
    enabled: !!uid && !!attemptId,
    staleTime: Infinity, // a finalized result never changes
  });
}

export function useReview(attemptId: string | undefined) {
  const { uid } = useAuth();
  return useQuery({
    queryKey: qk.review(uid ?? "none", attemptId ?? "none"),
    queryFn: () => endpoints.getReview(attemptId as string),
    enabled: !!uid && !!attemptId,
    staleTime: Infinity,
  });
}
