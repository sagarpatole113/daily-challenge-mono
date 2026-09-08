import { create } from "zustand";
import type { QuestionAnswerStatus, QuestionPublic } from "@shared/index";

export interface LocalAnswer {
  selectedOptionId: string | null;
  status: QuestionAnswerStatus;
  pendingSync: boolean; // true until confirmed saved to API
}

interface AttemptState {
  attemptId: string | null;
  testId: string | null;
  dayId: string | null;
  questions: QuestionPublic[];
  answers: Record<string, LocalAnswer>; // questionId -> answer
  currentIndex: number;

  loadAttempt: (params: {
    attemptId: string;
    testId: string;
    dayId: string;
    questions: QuestionPublic[];
    initialAnswers?: Record<string, LocalAnswer>;
  }) => void;

  setCurrentIndex: (i: number) => void;
  selectOption: (questionId: string, optionId: string) => void;
  toggleMarkForReview: (questionId: string) => void;
  markVisited: (questionId: string) => void;
  markSynced: (questionId: string) => void;

  answeredCount: () => number;
  unansweredCount: () => number;
  clear: () => void;
}

export const useAttemptStore = create<AttemptState>((set, get) => ({
  attemptId: null,
  testId: null,
  dayId: null,
  questions: [],
  answers: {},
  currentIndex: 0,

  loadAttempt: ({ attemptId, testId, dayId, questions, initialAnswers }) => {
    const answers: Record<string, LocalAnswer> = {};
    questions.forEach((q) => {
      const existing = initialAnswers?.[q.id];
      answers[q.id] = existing ?? {
        selectedOptionId: null,
        status: "NOT_VISITED",
        pendingSync: false,
      };
    });
    set({ attemptId, testId, dayId, questions, answers, currentIndex: 0 });
  },

  setCurrentIndex: (i) => {
    const { questions } = get();
    if (i < 0 || i >= questions.length) return;
    get().markVisited(questions[i].id);
    set({ currentIndex: i });
  },

  markVisited: (questionId) => {
    set((state) => {
      const current = state.answers[questionId];
      if (!current || current.status !== "NOT_VISITED") return state;
      return {
        answers: {
          ...state.answers,
          [questionId]: { ...current, status: "NOT_ANSWERED" },
        },
      };
    });
  },

  selectOption: (questionId, optionId) => {
    set((state) => {
      const current = state.answers[questionId];
      const wasMarked =
        current?.status === "MARKED_FOR_REVIEW" ||
        current?.status === "ANSWERED_AND_MARKED";
      return {
        answers: {
          ...state.answers,
          [questionId]: {
            selectedOptionId: optionId,
            status: wasMarked ? "ANSWERED_AND_MARKED" : "ANSWERED",
            pendingSync: true,
          },
        },
      };
    });
  },

  toggleMarkForReview: (questionId) => {
    set((state) => {
      const current = state.answers[questionId];
      if (!current) return state;
      const hasAnswer = !!current.selectedOptionId;
      const nextStatus: QuestionAnswerStatus =
        current.status === "MARKED_FOR_REVIEW" || current.status === "ANSWERED_AND_MARKED"
          ? hasAnswer
            ? "ANSWERED"
            : "NOT_ANSWERED"
          : hasAnswer
          ? "ANSWERED_AND_MARKED"
          : "MARKED_FOR_REVIEW";
      return {
        answers: {
          ...state.answers,
          [questionId]: { ...current, status: nextStatus, pendingSync: true },
        },
      };
    });
  },

  markSynced: (questionId) => {
    set((state) => {
      const current = state.answers[questionId];
      if (!current) return state;
      return {
        answers: { ...state.answers, [questionId]: { ...current, pendingSync: false } },
      };
    });
  },

  answeredCount: () => {
    const { answers } = get();
    return Object.values(answers).filter(
      (a) => a.status === "ANSWERED" || a.status === "ANSWERED_AND_MARKED"
    ).length;
  },

  unansweredCount: () => {
    const { questions } = get();
    return questions.length - get().answeredCount();
  },

  clear: () =>
    set({ attemptId: null, testId: null, dayId: null, questions: [], answers: {}, currentIndex: 0 }),
}));
