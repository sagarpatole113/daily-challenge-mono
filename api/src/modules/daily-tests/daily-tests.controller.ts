import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ok } from "../../utils/response";
import {
  getDayDetail,
  getTestWithMaskedQuestions,
  listDays,
  listTestsForDay,
} from "./daily-tests.service";

export const getDays = asyncHandler(async (req: Request, res: Response) => {
  const days = await listDays(req.user!.uid);
  ok(res, days, "Days fetched");
});

export const getDayById = asyncHandler(async (req: Request, res: Response) => {
  const day = await getDayDetail(req.user!.uid, req.params.dayId);
  ok(res, day, "Day fetched");
});

export const getTestsForDay = asyncHandler(async (req: Request, res: Response) => {
  const tests = await listTestsForDay(req.user!.uid, req.params.dayId);
  ok(res, tests, "Tests fetched");
});

export const getTestDetail = asyncHandler(async (req: Request, res: Response) => {
  const test = await getTestWithMaskedQuestions(req.params.dayId, req.params.testId);
  ok(res, test, "Test fetched");
});
