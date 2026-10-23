import { describe, expect, it } from "vitest";
import { EXAM_CONFIG } from "@shared/index";
import { EXAM_FORMAT } from "@/lib/constants";

describe("display constants stay in sync with shared/src/index.ts", () => {
  it("matches EXAM_CONFIG", () => {
    expect(EXAM_FORMAT.testsPerDay).toBe(EXAM_CONFIG.TESTS_PER_DAY);
    expect(EXAM_FORMAT.questionsPerTest).toBe(EXAM_CONFIG.QUESTIONS_PER_TEST);
    expect(EXAM_FORMAT.totalMarks).toBe(EXAM_CONFIG.TOTAL_MARKS);
    expect(EXAM_FORMAT.durationMinutes).toBe(EXAM_CONFIG.DURATION_MINUTES);
    expect(EXAM_FORMAT.marksPerCorrect).toBe(EXAM_CONFIG.MARKS_PER_CORRECT);
    expect(EXAM_FORMAT.negativeMarking).toBe(EXAM_CONFIG.NEGATIVE_MARKING);
    expect(EXAM_FORMAT.optionsPerQuestion).toBe(EXAM_CONFIG.OPTIONS_PER_QUESTION);
  });
});
