import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { validationMiddleware as validate } from "../../middleware/validation.middleware";
import { menuController as controller } from "./controller";
import {
  addRolePermissionMenuValidation,
  createMenuValidation,
  menuIdValidation,
  menuListValidation,
  updateMenuValidation,
} from "./validate";

const router = Router().use(authMiddleware);

router
  .route("/")
  .get(validate(menuListValidation), controller.fetchPagination)
  .post(validate(createMenuValidation), controller.store);

router.post(
  "/role-permissions",
  validate(addRolePermissionMenuValidation),
  controller.addRolePermissionMenu,
);

router
  .route("/:id")
  .get(validate(menuIdValidation), controller.fetchById)
  .put(validate(updateMenuValidation), controller.update)
  .delete(validate(menuIdValidation), controller.delete);

export default router;
