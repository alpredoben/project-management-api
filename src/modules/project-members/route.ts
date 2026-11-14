import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { validationMiddleware as validate } from "../../middleware/validation.middleware";
import { ProjectMemberController } from "./controller";
import {
  projectMemberCreateValidation,
  projectMemberIdValidation,
  projectMemberListValidation,
  projectMemberUpdateValidation,
} from "./validate";

const router = Router();
const controller = new ProjectMemberController();

router.get(
  "/list",
  authMiddleware,
  validate(projectMemberListValidation),
  controller.fetchPagination,
);
router.get(
  "/find/:id",
  authMiddleware,
  validate(projectMemberIdValidation),
  controller.findById,
);
router.post(
  "/create",
  authMiddleware,
  validate(projectMemberCreateValidation),
  controller.create,
);
router.put(
  "/update/:id",
  authMiddleware,
  validate([
    ...projectMemberIdValidation,
    ...projectMemberUpdateValidation,
  ]),
  controller.update,
);
router.delete(
  "/delete/:id",
  authMiddleware,
  validate(projectMemberIdValidation),
  controller.delete,
);

export default router;