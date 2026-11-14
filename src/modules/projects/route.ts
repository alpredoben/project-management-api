import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { validationMiddleware as validate } from "../../middleware/validation.middleware";
import { ProjectController } from "./controller";
import {
  projectChangeStatusValidation,
  projectChangeTypeValidation,
  projectCreateValidation,
  projectIdValidation,
  projectListValidation,
  projectMilestoneListValidation,
  projectUpdateValidation,
} from "./validate";

const router = Router();
export const projectActionRoute = Router();
const controller = new ProjectController();

router.get(
  "/list",
  authMiddleware,
  validate(projectListValidation),
  controller.fetchPagination,
);
router.get(
  "/find/:id",
  authMiddleware,
  validate(projectIdValidation),
  controller.findById,
);
router.post(
  "/create",
  authMiddleware,
  validate(projectCreateValidation),
  controller.create,
);
router.put(
  "/update/:id",
  authMiddleware,
  validate([...projectIdValidation, ...projectUpdateValidation]),
  controller.update,
);
router.delete(
  "/delete/:id",
  authMiddleware,
  validate(projectIdValidation),
  controller.delete,
);

projectActionRoute.put(
  "/:id/change-status",
  authMiddleware,
  validate([...projectIdValidation, ...projectChangeStatusValidation]),
  controller.changeStatus,
);
projectActionRoute.put(
  "/:id/change-type",
  authMiddleware,
  validate([...projectIdValidation, ...projectChangeTypeValidation]),
  controller.changeType,
);
projectActionRoute.get(
  "/:id/list-milestones",
  authMiddleware,
  validate([...projectIdValidation, ...projectMilestoneListValidation]),
  controller.fetchMilestones,
);

export default router;