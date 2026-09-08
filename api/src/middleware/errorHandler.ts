import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError";
import { fail } from "../utils/response";

export function notFoundHandler(req: Request, res: Response) {
  fail(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    return fail(res, "Validation failed", 422, err.issues);
  }

  if (err instanceof AppError) {
    return fail(res, err.message, err.status, err.errors);
  }

  // eslint-disable-next-line no-console
  console.error("[Unhandled Error]", err);
  return fail(res, "Internal server error", 500);
}
