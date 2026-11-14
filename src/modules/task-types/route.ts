import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { validationMiddleware as validate } from "../../middleware/validation.middleware";
import { TaskTypeController } from "./controller";
import {
  taskTypeCreateValidation,
  taskTypeIdValidation,
  taskTypeListValidation,
  taskTypeUpdateValidation,
} from "./validate";

const router = Router();
const controller = new TaskTypeController();

router.get(
  "/list",
  authMiddleware,
  validate(taskTypeListValidation),
  controller.fetchPagination,
);
router.get(
  "/find/:id",
  authMiddleware,
  validate(taskTypeIdValidation),
  controller.findById,
);
router.post(
  "/create",
  authMiddleware,
  validate(taskTypeCreateValidation),
  controller.create,
);
router.put(
  "/update/:id",
  authMiddleware,
  validate([...taskTypeIdValidation, ...taskTypeUpdateValidation]),
  controller.update,
);
router.delete(
  "/delete/:id",
  authMiddleware,
  validate(taskTypeIdValidation),
  controller.delete,
);

export default router;