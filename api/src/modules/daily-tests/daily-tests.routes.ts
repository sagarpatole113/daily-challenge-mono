import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import {
  getDayById,
  getDays,
  getTestDetail,
  getTestsForDay,
} from "./daily-tests.controller";

const router = Router();

router.get("/days", requireAuth, getDays);
router.get("/days/:dayId", requireAuth, getDayById);
router.get("/days/:dayId/tests", requireAuth, getTestsForDay);
router.get("/days/:dayId/tests/:testId", requireAuth, getTestDetail);

export default router;
