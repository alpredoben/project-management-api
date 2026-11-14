import { Router } from "express";
import { validationMiddleware as validate } from "../../middleware/validation.middleware";
import { RoleController } from "./controller";
import {
  roleCreateValidation,
  roleIdValidation,
  roleListValidation,
  roleSetPermissionsValidation,
  roleUpdateValidation,
} from "./validate";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();
const controller = new RoleController();

router.get("/list" , authMiddleware, validate(roleListValidation), controller.fetchPagination);
router.get("/find/:id", authMiddleware, validate(roleIdValidation), controller.findById);
router.post("/create", authMiddleware, validate(roleCreateValidation), controller.create);
router.put(
  "/update/:id",
  validate([...roleIdValidation, ...roleUpdateValidation]),
  controller.update,
);
router.put(
  "/:id/insert-permissions",
  authMiddleware,
  validate([...roleIdValidation, ...roleSetPermissionsValidation]),
  controller.setPermissions,
);
router.delete("/delete/:id", authMiddleware, validate(roleIdValidation), controller.delete);

export default router;