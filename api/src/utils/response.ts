import { Response } from "express";
import type { ApiError, ApiSuccess } from "@shared/index";

export function ok<T>(res: Response, data: T, message = "Success", status = 200) {
  const body: ApiSuccess<T> = { success: true, data, message };
  return res.status(status).json(body);
}

export function created<T>(res: Response, data: T, message = "Created") {
  return ok(res, data, message, 201);
}

export function fail(
  res: Response,
  message: string,
  status = 400,
  errors?: unknown[]
) {
  const body: ApiError = { success: false, message, errors };
  return res.status(status).json(body);
}
