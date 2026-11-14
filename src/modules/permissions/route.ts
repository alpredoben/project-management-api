import { Router } from "express";
import { validationMiddleware as validate } from "../../middleware/validation.middleware";
import { PermissionController } from "./controller";
import {
  permissionCreateValidation,
  permissionIdValidation,
  permissionListValidation,
  permissionUpdateValidation,
} from "./validate";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();
const controller = new PermissionController();

router.get(
  "/list",
  authMiddleware,
  validate(permissionListValidation),
  controller.fetchPagination,
);
router.get(
  "/find/:id",
  authMiddleware,
  validate(permissionIdValidation),
  controller.findById,
);
router.post(
  "/create",
  authMiddleware,
  validate(permissionCreateValidation),
  controller.create,
);
router.put(
  "/update/:id",
  authMiddleware,
  validate([...permissionIdValidation, ...permissionUpdateValidation]),
  controller.update,
);
router.delete(
  "/delete/:id",
  authMiddleware,
  validate(permissionIdValidation),
  controller.delete,
);

export default router;
