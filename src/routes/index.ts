import { Router } from "express";
import healthRoute from "../modules/health/health.route";
import authRoute from "../modules/auth/route";
import permissionRoute from "../modules/permissions/route";
import roleRoute from "../modules/roles/route";
import projectStatusRoute from "../modules/project-status/route";
import projectTypeRoute from "../modules/project-types/route";
import taskStatusRoute from "../modules/task-status/route";
import taskTypeRoute from "../modules/task-types/route";
import workspaceRoute from "../modules/workspaces/route";
import workspaceMemberRoute from "../modules/workspace-members/route";
import projectRoute, { projectActionRoute } from "../modules/projects/route";
import projectMemberRoute from "../modules/project-members/route";

const router = Router();

/** Health Route */
router.use("/health", healthRoute);
router.use("/auth", authRoute);
router.use("/permission", permissionRoute);
router.use("/role", roleRoute);
router.use("/project-status", projectStatusRoute);
router.use("/project-types", projectTypeRoute);
router.use("/task-status", taskStatusRoute);
router.use("/task-type", taskTypeRoute);
router.use("/workspace", workspaceRoute);
router.use("/workspace-members", workspaceMemberRoute);
router.use("/projects", projectRoute);
router.use("/project", projectActionRoute);
router.use("/project-member", projectMemberRoute);

export default router;
