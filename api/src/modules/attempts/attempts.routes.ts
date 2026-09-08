import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import {
  getAttemptById,
  getAttemptResult,
  getAttemptReview,
  postExpireAttempt,
  postSaveAnswer,
  postStartTest,
  postSubmitAttempt,
} from "./attempts.controller";

const router = Router();

// Matches spec: POST /api/v1/tests/:testId/start
// Firestore stores tests as a subcollection of a day (dayId is required to
// locate the doc), so the client passes { "dayId": "..." } in the body —
// it already knows this from the Tests screen it navigated from.
router.post("/tests/:testId/start", requireAuth, postStartTest);

router.post("/attempts/:attemptId/answers", requireAuth, postSaveAnswer);
router.get("/attempts/:attemptId", requireAuth, getAttemptById);
router.post("/attempts/:attemptId/submit", requireAuth, postSubmitAttempt);
router.post("/attempts/:attemptId/expire", requireAuth, postExpireAttempt);
router.get("/attempts/:attemptId/result", requireAuth, getAttemptResult);
router.get("/attempts/:attemptId/review", requireAuth, getAttemptReview);

export default router;
