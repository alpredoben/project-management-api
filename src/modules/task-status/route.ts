import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { validationMiddleware as validate } from "../../middleware/validation.middleware";
import { TaskStatusController } from "./controller";
import {
  taskStatusCreateValidation,
  taskStatusIdValidation,
  taskStatusListValidation,
  taskStatusUpdateValidation,
} from "./validate";

const router = Router();
const controller = new TaskStatusController();

router.get(
  "/list",
  authMiddleware,
  validate(taskStatusListValidation),
  controller.fetchPagination,
);
router.get(
  "/find/:id",
  authMiddleware,
  validate(taskStatusIdValidation),
  controller.findById,
);
router.post(
  "/create",
  authMiddleware,
  validate(taskStatusCreateValidation),
  controller.create,
);
router.put(
  "/update/:id",
  authMiddleware,
  validate([...taskStatusIdValidation, ...taskStatusUpdateValidation]),
  controller.update,
);
router.delete(
  "/delete/:id",
  authMiddleware,
  validate(taskStatusIdValidation),
  controller.delete,
);

export default router;