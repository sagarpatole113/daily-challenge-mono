/**
 * Re-exports of the monorepo's shared contract types (shared/src/index.ts).
 *
 * These are `export type` only, so they are erased at compile time and the
 * web bundle never imports anything from outside web/. The shared package
 * itself is untouched. Constants/functions from shared are NOT imported at
 * runtime; see lib/constants.ts and the drift test in lib/constants.test.ts.
 */
export type {
  ApiError as ApiErrorBody,
  ApiResponse,
  ApiSuccess,
  AttemptAnswer,
  AttemptResult,
  AttemptStatus,
  BatchStatus,
  DailyTestWithState,
  DayListItem,
  QuestionAnswerStatus,
  QuestionOption,
  QuestionPublic,
  ReviewQuestionItem,
  TestAttempt,
  User,
} from "@shared/index";
