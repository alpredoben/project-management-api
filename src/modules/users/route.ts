import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { validationMiddleware as validate } from "../../middleware/validation.middleware";
import { avatarUpload } from "./lib/avatar-util";
import { userController } from "./controller";
import {
  addUserRoleValidation,
  changePasswordValidation,
  createUserValidation,
  updateUserValidation,
  userIdValidation,
  userListValidation,
} from "./validate";

const router = Router().use(authMiddleware);

router
  .route("/")
  .get(validate(userListValidation), userController.fetchPagination)
  .post(validate(createUserValidation), userController.store);

// Harus berada di atas "/:id" agar "export" tidak dianggap sebagai id.
router.get("/export", validate(userListValidation), userController.exportUsers);

router
  .route("/:id")
  .get(validate(userIdValidation), userController.fetchById)
  .put(validate(updateUserValidation), userController.update)
  .delete(validate(userIdValidation), userController.delete);

router.post(
  "/:id/roles",
  validate(addUserRoleValidation),
  userController.addUserRole,
);
router.put(
  "/:id/password",
  validate(changePasswordValidation),
  userController.changePassword,
);
router.post(
  "/:id/avatar",
  validate(userIdValidation),
  avatarUpload,
  userController.changeAvatar,
);
router.patch(
  "/:id/unactivate",
  validate(userIdValidation),
  userController.unactivated,
);

export default router;
