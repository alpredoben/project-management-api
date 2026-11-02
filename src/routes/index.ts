import { Router } from "express";
import healthRoute from "../modules/health/health.route";
import authRouter from "../modules/auth/route";
import menuRouter from "../modules/menus/route";
import permissionRouter from "../modules/permissions/route";
import projectStatusRouter from "../modules/project-status/route";
import projectTypeRouter from "../modules/project-type/route";
import roleRouter from "../modules/roles/route";
import userRouter from "../modules/users/route";
import taskStatusRouter from "../modules/task-status/route";

const router = Router();

/** Health Route */
router.use("/health", healthRoute);

/** Auth Route */
router.use("/auth", authRouter);

/** RBAC (Role-Based Access Control) */
router.use("/menus", menuRouter);
router.use("/roles", roleRouter);
router.use("/users", userRouter);
router.use("/permissions", permissionRouter);

/** Master Data */
router.use("/project-status", projectStatusRouter);
router.use("/project-type", projectTypeRouter);
router.use("/task-status", taskStatusRouter);

export default router;
