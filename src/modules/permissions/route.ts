import { Router } from "express";
import { validationMiddleware as validate } from "../../middleware/validation.middleware";
import { PermissionController } from "./controller";
import {
  permissionCreateValidation,
  permissionIdValidation,
  permissionListValidation,
  permissionUpdateValidation,
} from "./validate";

const router = Router();
const controller = new PermissionController();

router.get("/list", validate(permissionListValidation), controller.list);
router.get(
  "/find/:id",
  validate(permissionIdValidation),
  controller.findById,
);
router.post("/create", validate(permissionCreateValidation), controller.create);
router.put(
  "/update/:id",
  validate([...permissionIdValidation, ...permissionUpdateValidation]),
  controller.update,
);
router.delete(
  "/delete/:id",
  validate(permissionIdValidation),
  controller.delete,
);

export default router;