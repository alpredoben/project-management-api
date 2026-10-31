import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { validationMiddleware } from "../../middleware/validation.middleware";
import { roleController } from "./controller";
import {
  createRoleValidation,
  roleIdValidation,
  roleListValidation,
  updateRoleValidation,
} from "./validate";

const router = Router();

router.use(authMiddleware);

router.post(
  "/",
  validationMiddleware(createRoleValidation),
  roleController.store,
);
router.get(
  "/",
  validationMiddleware(roleListValidation),
  roleController.findAll,
);
router.get(
  "/:id",
  validationMiddleware(roleIdValidation),
  roleController.findById,
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

export default router;