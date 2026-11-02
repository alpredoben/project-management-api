import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { validationMiddleware as validate } from "../../middleware/validation.middleware";
import { avatarUpload } from "./lib/avatar-util";
import { userController as controller } from "./controller";
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
  .get(validate(userListValidation), controller.fetchPagination)
  .post(validate(createUserValidation), controller.store);

// Harus berada di atas "/:id" agar "export" tidak dianggap sebagai id.
router.get("/export", validate(userListValidation), controller.exportUsers);

router
  .route("/:id")
  .get(validate(userIdValidation), controller.fetchById)
  .put(validate(updateUserValidation), controller.update)
  .delete(validate(userIdValidation), controller.delete);

router.post(
  "/:id/roles",
  validate(addUserRoleValidation),
  controller.addUserRole,
);
router.put(
  "/:id/password",
  validate(changePasswordValidation),
  controller.changePassword,
);
router.post(
  "/:id/avatar",
  validate(userIdValidation),
  avatarUpload,
  controller.changeAvatar,
);
router.patch(
  "/:id/unactivate",
  validate(userIdValidation),
  controller.unactivated,
);

export default router;
