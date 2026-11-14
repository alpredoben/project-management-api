import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { validationMiddleware as validate } from "../../middleware/validation.middleware";
import { ProjectStatusController } from "./controller";
import {
  projectStatusCreateValidation,
  projectStatusIdValidation,
  projectStatusListValidation,
  projectStatusUpdateValidation,
} from "./validate";

const router = Router();
const controller = new ProjectStatusController();

router.get(
  "/list",
  authMiddleware,
  validate(projectStatusListValidation),
  controller.fetchPagination,
);
router.get(
  "/find/:id",
  authMiddleware,
  validate(projectStatusIdValidation),
  controller.findById,
);
router.post(
  "/create",
  authMiddleware,
  validate(projectStatusCreateValidation),
  controller.create,
);
router.put(
  "/update/:id",
  authMiddleware,
  validate([
    ...projectStatusIdValidation,
    ...projectStatusUpdateValidation,
  ]),
  controller.update,
);
router.delete(
  "/delete/:id",
  authMiddleware,
  validate(projectStatusIdValidation),
  controller.delete,
);

export default router;