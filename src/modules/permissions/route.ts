import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { validationMiddleware } from "../../middleware/validation.middleware";
import { permissionController } from "./controller";
import {
  createPermissionValidation,
  permissionIdValidation,
  permissionListValidation,
  updatePermissionValidation,
} from "./validate";

const router = Router().use(authMiddleware);

router.post(
  "/",
  validationMiddleware(createPermissionValidation),
  permissionController.store,
);
router.get(
  "/",
  validationMiddleware(permissionListValidation),
  permissionController.fetchPagination,
);
router.get(
  "/:id",
  validationMiddleware(permissionIdValidation),
  permissionController.fetchById,
);
router.put(
  "/:id",
  validationMiddleware(updatePermissionValidation),
  permissionController.update,
);
router.delete(
  "/:id",
  validationMiddleware(permissionIdValidation),
  permissionController.delete,
);

export default router;