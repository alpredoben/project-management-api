import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { validationMiddleware as validate } from "../../middleware/validation.middleware";
import { ProjectTypeController } from "./controller";
import {
  projectTypeCreateValidation,
  projectTypeIdValidation,
  projectTypeListValidation,
  projectTypeUpdateValidation,
} from "./validate";

const router = Router();
const controller = new ProjectTypeController();

router.get(
  "/list",
  authMiddleware,
  validate(projectTypeListValidation),
  controller.fetchPagination,
);
router.get(
  "/find/:id",
  authMiddleware,
  validate(projectTypeIdValidation),
  controller.findById,
);
router.post(
  "/create",
  authMiddleware,
  validate(projectTypeCreateValidation),
  controller.create,
);
router.put(
  "/update/:id",
  authMiddleware,
  validate([...projectTypeIdValidation, ...projectTypeUpdateValidation]),
  controller.update,
);
router.delete(
  "/delete/:id",
  authMiddleware,
  validate(projectTypeIdValidation),
  controller.delete,
);

export default router;