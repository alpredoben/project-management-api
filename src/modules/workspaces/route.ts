import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { validationMiddleware as validate } from "../../middleware/validation.middleware";
import { WorkspaceController } from "./controller";
import {
  workspaceAddMembersValidation,
  workspaceCreateValidation,
  workspaceIdValidation,
  workspaceListValidation,
  workspaceMembersListValidation,
  workspaceUpdateValidation,
} from "./validate";

const router = Router();
const controller = new WorkspaceController();

router.get(
  "/list",
  authMiddleware,
  validate(workspaceListValidation),
  controller.fetchPagination,
);
router.get(
  "/find/:id",
  authMiddleware,
  validate(workspaceIdValidation),
  controller.findById,
);
router.post(
  "/create",
  authMiddleware,
  validate(workspaceCreateValidation),
  controller.create,
);
router.put(
  "/update/:id",
  authMiddleware,
  validate([...workspaceIdValidation, ...workspaceUpdateValidation]),
  controller.update,
);
router.delete(
  "/delete/:id",
  authMiddleware,
  validate(workspaceIdValidation),
  controller.delete,
);
router.get(
  "/:id/list-members",
  authMiddleware,
  validate([...workspaceIdValidation, ...workspaceMembersListValidation]),
  controller.fetchMembers,
);
router.put(
  "/:id/add-update-members",
  authMiddleware,
  validate([...workspaceIdValidation, ...workspaceAddMembersValidation]),
  controller.addMembers,
);

export default router;