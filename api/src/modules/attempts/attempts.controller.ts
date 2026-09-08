import { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler";
import { ok } from "../../utils/response";
import {
  expireAttempt,
  getAttempt,
  getResult,
  getReview,
  saveAnswer,
  saveAnswerSchema,
  startTest,
  submitAttempt,
} from "./attempts.service";

const startTestBodySchema = z.object({ dayId: z.string().min(1) });

// POST /api/v1/tests/:testId/start   body: { "dayId": "2026-09-02" }
export const postStartTest = asyncHandler(async (req: Request, res: Response) => {
  const { dayId } = startTestBodySchema.parse(req.body);
  const result = await startTest(req.user!.uid, dayId, req.params.testId);

  if ("expired" in result && result.expired) {
    return ok(
      res,
      { attemptId: result.attemptId, result: result.result },
      "Previous attempt had already expired and was auto-submitted",
      200
    );
  }

  ok(res, result, "Test started");
});

export const postSaveAnswer = asyncHandler(async (req: Request, res: Response) => {
  const input = saveAnswerSchema.parse(req.body);
  const result = await saveAnswer(req.user!.uid, req.params.attemptId, input);
  ok(res, result, "Answer saved");
});

export const getAttemptById = asyncHandler(async (req: Request, res: Response) => {
  const attempt = await getAttempt(req.user!.uid, req.params.attemptId);
  ok(res, attempt, "Attempt fetched");
});

export const postSubmitAttempt = asyncHandler(async (req: Request, res: Response) => {
  const result = await submitAttempt(req.user!.uid, req.params.attemptId);
  ok(res, result, "Test submitted");
});

export const postExpireAttempt = asyncHandler(async (req: Request, res: Response) => {
  const result = await expireAttempt(req.user!.uid, req.params.attemptId);
  ok(res, result, "Test marked as expired");
});

export const getAttemptResult = asyncHandler(async (req: Request, res: Response) => {
  const result = await getResult(req.user!.uid, req.params.attemptId);
  ok(res, result, "Result fetched");
});

export const getAttemptReview = asyncHandler(async (req: Request, res: Response) => {
  const review = await getReview(req.user!.uid, req.params.attemptId);
  ok(res, review, "Review fetched");
});
