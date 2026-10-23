"use client";

import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActiveTest, type ActiveTestProps } from "@/components/test/active-test";
import { useAuth } from "@/components/providers";
import { ButtonLink } from "@/components/ui/button";
import { Container, ErrorState, Spinner } from "@/components/ui/misc";
import { qk } from "@/hooks/queries";
import { AnswerSync } from "@/lib/answer-sync";
import { isExpiredOnStart } from "@/lib/api-types";
import { isApiError } from "@/lib/api";
import { buildInitialAnswers } from "@/lib/attempt";
import { endpoints, fetchServerClockOffsetMs } from "@/lib/endpoints";

type State =
  | { kind: "loading"; step: string }
  | { kind: "error"; message: string; fatal?: boolean }
  | { kind: "locked"; testNumber: number }
  | { kind: "running"; props: ActiveTestProps };

/**
 * Bootstraps a test session:
 *  1. Re-checks the day's test states from the API (never trusts a stale cache).
 *  2. Refuses to start tests the API reports as locked or already completed.
 *  3. POST /tests/:id/start. The API creates the attempt or resumes the
 *     existing IN_PROGRESS one with its ORIGINAL startedAt/expiresAt.
 *  4. GET /attempts/:id to restore previously saved answers (the start
 *     response doesn't include them).
 *
 * Step 2 matters because the API does not itself reject a start for a test
 * that is already completed; see docs/API_CONTRACTS.md.
 */
export function TestRunner({ testId, dayId }: { testId: string; dayId: string | null }) {
  const router = useRouter();
  const qc = useQueryClient();
  const { uid } = useAuth();
  const [state, setState] = useState<State>({ kind: "loading", step: "Checking your test" });
  const [attemptNo, setAttemptNo] = useState(0); // bump to retry
  const started = useRef<string | null>(null);

  const retry = useCallback(() => {
    started.current = null;
    setState({ kind: "loading", step: "Checking your test" });
    setAttemptNo((n) => n + 1);
  }, []);

  useEffect(() => {
    if (!uid || !dayId) return;
    const key = `${uid}:${testId}:${attemptNo}`;
    if (started.current === key) return;
    started.current = key;
    let cancelled = false;

    (async () => {
      try {
        const tests = await qc.fetchQuery({ queryKey: qk.tests(uid, dayId), queryFn: () => endpoints.getTestsForDay(dayId), staleTime: 0 });
        if (cancelled) return;
        const test = tests.find((t) => t.id === testId);
        if (!test) return setState({ kind: "error", fatal: true, message: "We couldn't find that test for this day." });
        if (test.completed) {
          router.replace(test.attemptId ? `/dashboard/result/${test.attemptId}` : "/dashboard");
          return;
        }
        if (!test.unlocked) return setState({ kind: "locked", testNumber: test.testNumber });

        setState({ kind: "loading", step: "Starting your test" });
        const start = await endpoints.startTest(testId, dayId);
        if (cancelled) return;
        if (isExpiredOnStart(start)) {
          qc.setQueryData(qk.result(uid, start.attemptId), start.result);
          await qc.invalidateQueries({ queryKey: ["u", uid], refetchType: "none" });
          router.replace(`/dashboard/result/${start.attemptId}`);
          return;
        }

        setState({ kind: "loading", step: "Loading your saved answers" });
        const [attempt, offset] = await Promise.all([endpoints.getAttempt(start.attemptId), fetchServerClockOffsetMs()]);
        if (cancelled) return;

        const sync = new AnswerSync({
          attemptId: start.attemptId,
          send: (body) => endpoints.saveAnswer(start.attemptId, body),
          storage: typeof window !== "undefined" ? window.sessionStorage : null,
        });
        const initialAnswers = buildInitialAnswers(start.questions, attempt.answers, sync.restored());

        setState({
          kind: "running",
          props: {
            attemptId: start.attemptId,
            testNumber: test.testNumber,
            expiresAt: start.expiresAt,
            questions: start.questions,
            initialAnswers,
            sync,
            serverOffsetMs: offset,
          },
        });
      } catch (e) {
        if (cancelled) return;
        started.current = null;
        if (isApiError(e) && e.status === 403) return setState({ kind: "locked", testNumber: 0 });
        setState({ kind: "error", message: isApiError(e) ? e.message : "Something went wrong starting this test." });
      }
    })();

    return () => {
      cancelled = true;
      started.current = null; // allow StrictMode's second effect run to proceed
    };
  }, [uid, testId, dayId, attemptNo, qc, router]);

  if (!dayId) {
    return (
      <main id="main">
        <Container className="flex min-h-dvh max-w-xl flex-col justify-center py-16">
          <ErrorState title="Couldn't open the test" message="This link is missing its day. Open the test from your dashboard." />
          <Link href="/dashboard" className="mt-5 inline-block font-semibold text-brand-700 underline">Back to dashboard</Link>
        </Container>
      </main>
    );
  }
  if (state.kind === "running") return <ActiveTest {...state.props} />;

  return (
    <main id="main">
      <Container className="flex min-h-dvh max-w-xl flex-col justify-center py-16">
        {state.kind === "loading" && (
          <div className="text-center">
            <Spinner label={state.step} />
            <p className="mt-3 text-sm text-ink-3">Your 60 minutes begin only once the test opens.</p>
          </div>
        )}
        {state.kind === "locked" && (
          <div>
            <Lock className="size-8 text-ink-3" aria-hidden />
            <h1 className="mt-4 text-4xl">This test is locked</h1>
            <p className="mt-3 text-ink-2">
              {state.testNumber > 1 ? `Finish Test ${state.testNumber - 1} first and this one will unlock.` : "Finish the previous test first and this one will unlock."}
            </p>
            <ButtonLink href="/dashboard" className="mt-6">Back to dashboard</ButtonLink>
          </div>
        )}
        {state.kind === "error" && (
          <div>
            <ErrorState title="Couldn't open the test" message={state.message} onRetry={state.fatal ? undefined : retry} />
            <Link href="/dashboard" className="mt-5 inline-block font-semibold text-brand-700 underline">Back to dashboard</Link>
          </div>
        )}
      </Container>
    </main>
  );
}
