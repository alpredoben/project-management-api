import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { validationMiddleware } from "../../middleware/validation.middleware";
import { menuController } from "./controller";
import {
  addRolePermissionMenuValidation,
  createMenuValidation,
  menuIdValidation,
  menuListValidation,
  updateMenuValidation,
} from "./validate";

const router = Router().use(authMiddleware);

router.post(
  "/",
  validationMiddleware(createMenuValidation),
  menuController.store,
);
router.get(
  "/",
  validationMiddleware(menuListValidation),
  menuController.fetchPagination,
);
router.post(
  "/role-permissions",
  validationMiddleware(addRolePermissionMenuValidation),
  menuController.addRolePermissionMenu,
);
router.get(
  "/:id",
  validationMiddleware(menuIdValidation),
  menuController.fetchById,
);
router.put(
  "/:id",
  validationMiddleware(updateMenuValidation),
  menuController.update,
);
router.delete(
  "/:id",
  validationMiddleware(menuIdValidation),
  menuController.delete,
);

export default router;