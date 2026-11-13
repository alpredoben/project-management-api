import { Router } from "express";
import healthRoute from "../modules/health/health.route";

const router = Router();

/** Health Route */
router.use("/health", healthRoute);

export default router;
