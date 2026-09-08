import { Router } from "express";
import usersRoutes from "../modules/users/users.routes";
import dailyTestsRoutes from "../modules/daily-tests/daily-tests.routes";
import attemptsRoutes from "../modules/attempts/attempts.routes";

const router = Router();

router.use("/users", usersRoutes);
router.use("/", dailyTestsRoutes); // exposes /days, /days/:dayId, /days/:dayId/tests...
router.use("/", attemptsRoutes); // exposes /tests/:testId/start, /attempts/...

export default router;
