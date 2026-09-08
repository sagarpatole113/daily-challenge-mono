import { z } from "zod";
import { EXAM_CONFIG } from "@shared/index";

const optionSchema = z.object({
  id: z.enum(["A", "B", "C", "D"]),
  english: z.string().trim().min(1, "Option english text required"),
  marathi: z.string().trim().min(1, "Option marathi text required"),
});

const questionSchema = z
  .object({
    questionEnglish: z.string().trim().min(1),
    questionMarathi: z.string().trim().min(1),
    options: z
      .array(optionSchema)
      .length(
        EXAM_CONFIG.OPTIONS_PER_QUESTION,
        `Each question must have exactly ${EXAM_CONFIG.OPTIONS_PER_QUESTION} options`
      ),
    correctOptionId: z.enum(["A", "B", "C", "D"]),
    explanationEnglish: z.string().trim().optional().default(""),
    explanationMarathi: z.string().trim().optional().default(""),
    subject: z.string().trim().optional().default("General"),
    topic: z.string().trim().optional().default("General"),
    difficulty: z.enum(["easy", "medium", "hard"]).optional().default("medium"),
  })
  .superRefine((q, ctx) => {
    const ids = q.options.map((o) => o.id);
    const uniqueIds = new Set(ids);
    if (uniqueIds.size !== ids.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Option ids must be unique (A, B, C, D)",
      });
    }
    if (!ids.includes(q.correctOptionId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `correctOptionId "${q.correctOptionId}" does not match any option id`,
      });
    }
  });

export const testFileSchema = z.object({
  title: z.string().trim().min(1),
  questions: z
    .array(questionSchema)
    .length(
      EXAM_CONFIG.QUESTIONS_PER_TEST,
      `Each test must contain exactly ${EXAM_CONFIG.QUESTIONS_PER_TEST} questions`
    ),
});

export type TestFileInput = z.infer<typeof testFileSchema>;
export type QuestionInput = TestFileInput["questions"][number];
