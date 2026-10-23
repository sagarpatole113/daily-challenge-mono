import type { QuestionAnswerStatus, QuestionPublic } from "@/types/shared";
import type { SaveAnswerBody, ServerAnswer } from "@/lib/api-types";

/**
 * Pure answer-state transitions for the test runner. They mirror the mobile
 * attempt store (mobile/src/store/attemptStore.ts) exactly so a student sees
 * identical palette semantics on web and mobile. No scoring happens here:
 * correctness is only ever computed by the API.
 */
export interface LocalAnswer {
  selectedOptionId: string | null;
  status: QuestionAnswerStatus;
}
export type AnswerMap = Record<string, LocalAnswer>;

export interface Change {
  questionId: string;
  body: SaveAnswerBody;
}

export const isAnswered = (s: QuestionAnswerStatus) => s === "ANSWERED" || s === "ANSWERED_AND_MARKED";
export const isMarked = (s: QuestionAnswerStatus) => s === "MARKED_FOR_REVIEW" || s === "ANSWERED_AND_MARKED";

/**
 * Server rows win over defaults; locally queued (not yet saved) answers win
 * over the server, because they are the student's latest intent.
 */
export function buildInitialAnswers(
  questions: QuestionPublic[],
  server: ServerAnswer[] | undefined,
  pending: SaveAnswerBody[] = [],
): AnswerMap {
  const map: AnswerMap = {};
  for (const q of questions) map[q.id] = { selectedOptionId: null, status: "NOT_VISITED" };
  for (const a of server ?? []) {
    if (map[a.questionId]) map[a.questionId] = { selectedOptionId: a.selectedOptionId ?? null, status: a.status };
  }
  for (const p of pending) {
    if (map[p.questionId]) map[p.questionId] = { selectedOptionId: p.selectedOptionId, status: p.status };
  }
  return map;
}

export function visit(answers: AnswerMap, qid: string): AnswerMap {
  const cur = answers[qid];
  if (!cur || cur.status !== "NOT_VISITED") return answers;
  return { ...answers, [qid]: { ...cur, status: "NOT_ANSWERED" } };
}

export function selectOption(answers: AnswerMap, qid: string, optionId: string): { answers: AnswerMap; change: Change } {
  const cur = answers[qid];
  const status: QuestionAnswerStatus = cur && isMarked(cur.status) ? "ANSWERED_AND_MARKED" : "ANSWERED";
  return {
    answers: { ...answers, [qid]: { selectedOptionId: optionId, status } },
    change: { questionId: qid, body: { questionId: qid, selectedOptionId: optionId, status } },
  };
}

export function toggleMark(answers: AnswerMap, qid: string): { answers: AnswerMap; change: Change } | null {
  const cur = answers[qid];
  if (!cur) return null;
  const has = !!cur.selectedOptionId;
  const status: QuestionAnswerStatus = isMarked(cur.status)
    ? has ? "ANSWERED" : "NOT_ANSWERED"
    : has ? "ANSWERED_AND_MARKED" : "MARKED_FOR_REVIEW";
  return {
    answers: { ...answers, [qid]: { ...cur, status } },
    change: { questionId: qid, body: { questionId: qid, selectedOptionId: cur.selectedOptionId, status } },
  };
}

/** Clears the chosen option (API accepts selectedOptionId: null). Keeps the review mark. */
export function clearAnswer(answers: AnswerMap, qid: string): { answers: AnswerMap; change: Change } | null {
  const cur = answers[qid];
  if (!cur || !cur.selectedOptionId) return null;
  const status: QuestionAnswerStatus = isMarked(cur.status) ? "MARKED_FOR_REVIEW" : "NOT_ANSWERED";
  return {
    answers: { ...answers, [qid]: { selectedOptionId: null, status } },
    change: { questionId: qid, body: { questionId: qid, selectedOptionId: null, status } },
  };
}

export interface Summary {
  total: number;
  answered: number;
  unanswered: number;
  marked: number;
}

export function summarize(answers: AnswerMap, questions: QuestionPublic[]): Summary {
  let answered = 0;
  let marked = 0;
  for (const q of questions) {
    const a = answers[q.id];
    if (!a) continue;
    if (isAnswered(a.status)) answered += 1;
    if (isMarked(a.status)) marked += 1;
  }
  return { total: questions.length, answered, unanswered: questions.length - answered, marked };
}
