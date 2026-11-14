import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { validationMiddleware as validate } from "../../middleware/validation.middleware";
import { MilestoneController } from "./controller";
import {
  milestoneCreateValidation,
  milestoneIdValidation,
  milestoneListValidation,
  milestoneUpdateValidation,
} from "./validate";

const router = Router();
const controller = new MilestoneController();

router.get(
  "/list",
  authMiddleware,
  validate(milestoneListValidation),
  controller.fetchPagination,
);
router.get(
  "/find/:id",
  authMiddleware,
  validate(milestoneIdValidation),
  controller.findById,
);
router.post(
  "/create",
  authMiddleware,
  validate(milestoneCreateValidation),
  controller.create,
);
router.put(
  "/update/:id",
  authMiddleware,
  validate([...milestoneIdValidation, ...milestoneUpdateValidation]),
  controller.update,
);
router.delete(
  "/delete/:id",
  authMiddleware,
  validate(milestoneIdValidation),
  controller.delete,
);

export default router;