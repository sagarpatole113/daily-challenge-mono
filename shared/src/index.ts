// ============================================================================
// MPSC Daily Challenge — Shared Types
// Used by: mobile/, api/, cron/
// ============================================================================

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export type AttemptStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "TIME_EXPIRED";

export type QuestionAnswerStatus =
  | "NOT_VISITED"
  | "NOT_ANSWERED"
  | "ANSWERED"
  | "MARKED_FOR_REVIEW"
  | "ANSWERED_AND_MARKED";

export type BatchStatus = "ACTIVE" | "DRAFT";

export type Difficulty = "easy" | "medium" | "hard";

// ---------------------------------------------------------------------------
// Exam configuration constants (single source of truth)
// ---------------------------------------------------------------------------

export const EXAM_CONFIG = {
  TESTS_PER_DAY: 3,
  QUESTIONS_PER_TEST: 100,
  TOTAL_MARKS: 100,
  DURATION_MINUTES: 60,
  DURATION_MS: 60 * 60 * 1000,
  MARKS_PER_CORRECT: 1,
  NEGATIVE_MARKING: 0.25,
  OPTIONS_PER_QUESTION: 4,
} as const;

// ---------------------------------------------------------------------------
// Question
// ---------------------------------------------------------------------------

export interface QuestionOption {
  id: string; // "A" | "B" | "C" | "D"
  english: string;
  marathi: string;
}

export interface Question {
  id: string;
  subject?: string;
  topic?: string;
  difficulty?: Difficulty;

  questionEnglish: string;
  questionMarathi: string;

  options: QuestionOption[];

  correctOptionId: string;

  explanationEnglish?: string;
  explanationMarathi?: string;

  createdAt?: string; // ISO
  createdBy?: string;
}

/** Question shape safe to send to the client DURING an active test (no answer/explanation). */
export type QuestionPublic = Omit<
  Question,
  "correctOptionId" | "explanationEnglish" | "explanationMarathi" | "createdBy"
> & { questionNumber: number };

// ---------------------------------------------------------------------------
// Daily Test Batch / Test
// ---------------------------------------------------------------------------

export interface DailyTestBatch {
  id: string; // dayId, e.g. "2026-09-02"
  date: string; // "2026-09-02"
  totalTests: number;
  status: BatchStatus;
  createdAt: string;
  publishedAt?: string | null;
}

export interface DailyTest {
  id: string;
  dayId: string;
  testNumber: number;
  title: string;
  totalQuestions: number;
  totalMarks: number;
  durationMinutes: number;
  negativeMarking: number;
  status: BatchStatus;
  createdAt: string;
}

/** Test as returned in the /days/:dayId/tests list, with per-user unlock state. */
export interface DailyTestWithState extends DailyTest {
  locked: boolean;
  unlocked: boolean;
  completed: boolean;
  inProgress: boolean;
  attemptId?: string;
}

export interface TestQuestionMapping {
  questionId: string;
  questionNumber: number;
}

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  name: string;
  username: string;

  createdAt: string;
  updatedAt: string;
  lastActiveAt: string;

  currentDayId?: string | null;
  currentTestNumber?: number;

  totalTestsCompleted: number;
  totalQuestionsAttempted: number;
  totalCorrectAnswers: number;
  totalWrongAnswers: number;
  totalScore: number;
  bestScore: number;
}

// ---------------------------------------------------------------------------
// Test Attempt
// ---------------------------------------------------------------------------

export interface TestAttempt {
  id: string;
  userId: string;
  dayId: string;
  testId: string;
  testNumber: number;

  status: AttemptStatus;

  startedAt: string;
  expiresAt: string;
  submittedAt?: string | null;

  score?: number | null;
  correctAnswers?: number | null;
  wrongAnswers?: number | null;
  unansweredQuestions?: number | null;
  accuracy?: number | null;
  timeTakenSeconds?: number | null;

  createdAt: string;
  updatedAt: string;
}

export interface AttemptAnswer {
  questionId: string;
  selectedOptionId: string | null;
  status: QuestionAnswerStatus;
  answeredAt?: string | null;
  updatedAt: string;
}

export interface AttemptResult {
  attemptId: string;
  testId: string;
  testNumber: number;
  dayId: string;
  status: AttemptStatus;
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  unansweredQuestions: number;
  accuracy: number;
  timeTakenSeconds: number;
  submittedAt: string;
}

export interface ReviewQuestionItem {
  questionNumber: number;
  questionEnglish: string;
  questionMarathi: string;
  options: QuestionOption[];
  selectedOptionId: string | null;
  correctOptionId: string;
  result: "CORRECT" | "WRONG" | "UNANSWERED";
  explanationEnglish?: string;
  explanationMarathi?: string;
}

// ---------------------------------------------------------------------------
// Daily Progress
// ---------------------------------------------------------------------------

export interface UserDailyProgress {
  dayId: string;
  date: string;
  completedTests: number;
  currentUnlockedTest: number;
  completedTestIds: string[];
  dayCompleted: boolean;
  lastUpdatedAt: string;
}

export interface DayListItem {
  dayId: string;
  date: string;
  totalTests: number;
  completedTests: number;
  currentUnlockedTest: number;
  status: BatchStatus;
}

// ---------------------------------------------------------------------------
// API response envelope
// ---------------------------------------------------------------------------

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: unknown[];
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ---------------------------------------------------------------------------
// Scoring helper (shared between API and mobile preview calculations)
// ---------------------------------------------------------------------------

export function calculateScore(correct: number, wrong: number) {
  const raw =
    correct * EXAM_CONFIG.MARKS_PER_CORRECT -
    wrong * EXAM_CONFIG.NEGATIVE_MARKING;
  // round to 2 decimals, avoid -0
  return Math.round(raw * 100) / 100 + 0;
}

export function calculateAccuracy(correct: number, attempted: number) {
  if (attempted === 0) return 0;
  return Math.round((correct / attempted) * 10000) / 100; // 2 decimal %
}
