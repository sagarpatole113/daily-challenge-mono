import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { getMe, upsertProfile } from "./users.controller";

const router = Router();

router.post("/profile", requireAuth, upsertProfile);
router.get("/me", requireAuth, getMe);

export default router;
