import { describe, expect, it } from "vitest";
import {
  buildInitialAnswers,
  clearAnswer,
  selectOption,
  summarize,
  toggleMark,
  visit,
} from "@/lib/attempt";
import type { QuestionPublic } from "@/types/shared";

const q = (id: string, n: number): QuestionPublic => ({
  id,
  questionNumber: n,
  questionEnglish: "?",
  questionMarathi: "?",
  options: [],
});
const questions = [q("a", 1), q("b", 2), q("c", 3)];

describe("answer state transitions (mirror the mobile store)", () => {
  it("starts every question NOT_VISITED and visiting marks NOT_ANSWERED once", () => {
    let m = buildInitialAnswers(questions, undefined);
    expect(m.a?.status).toBe("NOT_VISITED");
    m = visit(m, "a");
    expect(m.a?.status).toBe("NOT_ANSWERED");
    const again = visit(m, "a");
    expect(again).toBe(m); // no-op keeps referential equality
  });

  it("selecting and changing an answer", () => {
    let m = buildInitialAnswers(questions, undefined);
    const first = selectOption(m, "a", "B");
    m = first.answers;
    expect(m.a).toEqual({ selectedOptionId: "B", status: "ANSWERED" });
    expect(first.change.body).toEqual({ questionId: "a", selectedOptionId: "B", status: "ANSWERED" });
    m = selectOption(m, "a", "D").answers;
    expect(m.a?.selectedOptionId).toBe("D");
  });

  it("mark-for-review combines with answers both ways", () => {
    let m = buildInitialAnswers(questions, undefined);
    m = toggleMark(m, "a")!.answers;
    expect(m.a?.status).toBe("MARKED_FOR_REVIEW");
    m = selectOption(m, "a", "A").answers;
    expect(m.a?.status).toBe("ANSWERED_AND_MARKED");
    m = toggleMark(m, "a")!.answers;
    expect(m.a?.status).toBe("ANSWERED");
    m = toggleMark(m, "a")!.answers;
    m = clearAnswer(m, "a")!.answers;
    expect(m.a).toEqual({ selectedOptionId: null, status: "MARKED_FOR_REVIEW" });
    m = toggleMark(m, "a")!.answers;
    expect(m.a?.status).toBe("NOT_ANSWERED");
  });

  it("clearing sends selectedOptionId null with NOT_ANSWERED (accepted by the API schema)", () => {
    let m = selectOption(buildInitialAnswers(questions, undefined), "b", "C").answers;
    const r = clearAnswer(m, "b")!;
    expect(r.change.body).toEqual({ questionId: "b", selectedOptionId: null, status: "NOT_ANSWERED" });
    m = r.answers;
    expect(clearAnswer(m, "b")).toBeNull(); // nothing to clear
  });

  it("restores server answers on resume and lets unsynced local answers win", () => {
    const m = buildInitialAnswers(
      questions,
      [
        { questionId: "a", selectedOptionId: "A", status: "ANSWERED" },
        { questionId: "b", selectedOptionId: null, status: "NOT_VISITED" },
        { questionId: "zzz", selectedOptionId: "A", status: "ANSWERED" }, // unknown id ignored
      ],
      [{ questionId: "a", selectedOptionId: "C", status: "ANSWERED" }],
    );
    expect(m.a?.selectedOptionId).toBe("C");
    expect(m.b?.status).toBe("NOT_VISITED");
    expect(m.zzz).toBeUndefined();
  });

  it("summarises answered / unanswered / marked for the submit dialog", () => {
    let m = buildInitialAnswers(questions, undefined);
    m = selectOption(m, "a", "A").answers;
    m = toggleMark(m, "a")!.answers;
    m = toggleMark(m, "b")!.answers;
    expect(summarize(m, questions)).toEqual({ total: 3, answered: 1, unanswered: 2, marked: 2 });
  });
});
