import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { validationMiddleware } from "../../middleware/validation.middleware";
import { roleController } from "./controller";
import {
  assignPermissionValidation,
  createRoleValidation,
  roleIdValidation,
  roleListValidation,
  updateRoleValidation,
} from "./validate";

const router = Router().use(authMiddleware);

router.post(
  "/",
  validationMiddleware(createRoleValidation),
  roleController.store,
);
router.get(
  "/",
  validationMiddleware(roleListValidation),
  roleController.fetchPagination,
);
router.get(
  "/:id",
  validationMiddleware(roleIdValidation),
  roleController.fetchById,
);
router.put(
  "/:id",
  validationMiddleware(updateRoleValidation),
  roleController.update,
);
router.delete(
  "/:id",
  validationMiddleware(roleIdValidation),
  roleController.delete,
);
router.post(
  "/:id/permissions",
  validationMiddleware(assignPermissionValidation),
  roleController.assignPermission,
);

export default router;
