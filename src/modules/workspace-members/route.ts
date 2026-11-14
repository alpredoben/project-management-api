import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { validationMiddleware as validate } from "../../middleware/validation.middleware";
import { WorkspaceMemberController } from "./controller";
import {
  workspaceMemberCreateValidation,
  workspaceMemberIdValidation,
  workspaceMemberListValidation,
  workspaceMemberUpdateValidation,
} from "./validate";

const router = Router();
const controller = new WorkspaceMemberController();

router.get(
  "/list",
  authMiddleware,
  validate(workspaceMemberListValidation),
  controller.fetchPagination,
);
router.get(
  "/find/:id",
  authMiddleware,
  validate(workspaceMemberIdValidation),
  controller.findById,
);
router.post(
  "/create",
  authMiddleware,
  validate(workspaceMemberCreateValidation),
  controller.create,
);
router.put(
  "/update/:id",
  authMiddleware,
  validate([
    ...workspaceMemberIdValidation,
    ...workspaceMemberUpdateValidation,
  ]),
  controller.update,
);
router.delete(
  "/delete/:id",
  authMiddleware,
  validate(workspaceMemberIdValidation),
  controller.delete,
);

export default router;