import { Router } from "express";
import healthRoute from "../modules/health/health.route";
import authRouter from "../modules/auth/route";
import menuRouter from "../modules/menus/route";
import permissionRouter from "../modules/permissions/route";
import projectStatusRouter from "../modules/project-status/route";
import roleRouter from "../modules/roles/route";
import userRouter from "../modules/users/route";

const router = Router();

/** Health Route */
router.use("/health", healthRoute);

/** Auth Route */
router.use("/auth", authRouter);
router.use("/menus", menuRouter);
router.use("/permissions", permissionRouter);
router.use("/project-status", projectStatusRouter);
router.use("/roles", roleRouter);
router.use("/users", userRouter);

export default router;
