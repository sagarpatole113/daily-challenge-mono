import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ok } from "../../utils/response";
import { getOrCreateProfile, getProfile, upsertProfileSchema } from "./users.service";

export const upsertProfile = asyncHandler(async (req: Request, res: Response) => {
  const input = upsertProfileSchema.parse(req.body);
  const user = await getOrCreateProfile(req.user!.uid, input);
  ok(res, user, "Profile saved");
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await getProfile(req.user!.uid);
  ok(res, user, "Profile fetched");
});
