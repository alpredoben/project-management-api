import { Router } from "express";
import healthRoute from "../modules/health/health.route";
import authRoute from "../modules/auth/route";
import permissionRoute from "../modules/permissions/route";

const router = Router();

/** Health Route */
router.use("/health", healthRoute);
router.use("/auth", authRoute);
router.use("/permission", permissionRoute);

export default router;
