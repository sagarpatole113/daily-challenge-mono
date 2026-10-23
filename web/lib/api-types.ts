import type {
  AttemptResult,
  QuestionAnswerStatus,
  QuestionPublic,
  TestAttempt,
} from "@/types/shared";

/** Response of POST /tests/:testId/start for a live attempt. */
export interface StartedAttempt {
  attemptId: string;
  startedAt: string;
  expiresAt: string;
  durationMinutes: number;
  questions: QuestionPublic[];
}

/**
 * Response of POST /tests/:testId/start when a stale IN_PROGRESS attempt had
 * already passed its expiry. The server finalized it and returns the result
 * instead of questions. (The controller drops the internal `expired` flag.)
 */
export interface ExpiredOnStart {
  attemptId: string;
  result: AttemptResult;
}

export type StartTestResponse = StartedAttempt | ExpiredOnStart;

export function isExpiredOnStart(r: StartTestResponse): r is ExpiredOnStart {
  return "result" in r && !("questions" in r);
}

/** Answer row as returned by GET /attempts/:id (timestamps are ignored). */
export interface ServerAnswer {
  questionId: string;
  selectedOptionId: string | null;
  status: QuestionAnswerStatus;
}

/**
 * GET /attempts/:id returns `answers` only while the attempt is IN_PROGRESS;
 * for finalized attempts it returns the bare attempt record.
 */
export type AttemptDetail = TestAttempt & { answers?: ServerAnswer[] };

export interface DayDetail {
  dayId: string;
  date: string;
  totalTests: number;
  status: "ACTIVE" | "DRAFT";
  completedTests: number;
  currentUnlockedTest: number;
  dayCompleted: boolean;
}

export interface SaveAnswerBody {
  questionId: string;
  selectedOptionId: string | null;
  status: QuestionAnswerStatus;
}

export interface UpsertProfileBody {
  name: string;
  username?: string;
}
