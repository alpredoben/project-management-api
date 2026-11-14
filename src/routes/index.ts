import { Router } from "express";
import healthRoute from "../modules/health/health.route";
import authRoute from "../modules/auth/route";
import permissionRoute from "../modules/permissions/route";
import roleRoute from "../modules/roles/route";
import projectStatusRoute from "../modules/project-status/route";
import projectTypeRoute from "../modules/project-types/route";

const router = Router();

/** Health Route */
router.use("/health", healthRoute);
router.use("/auth", authRoute);
router.use("/permission", permissionRoute);
router.use("/role", roleRoute);
router.use("/project-status", projectStatusRoute);
router.use("/project-types", projectTypeRoute);

export default router;
