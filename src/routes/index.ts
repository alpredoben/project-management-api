import { Router } from "express";
import healthRoute from "../modules/health/health.route";
import authRoute from "../modules/auth/route";

const router = Router();

/** Health Route */
router.use("/health", healthRoute);
router.use("/auth", authRoute);

export default router;
