import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { validationMiddleware as validate } from "../../middleware/validation.middleware";
import { projectStatusController as controller } from "./controller";
import {
  createProjectStatusValidation,
  projectStatusIdValidation,
  projectStatusListValidation,
  updateProjectStatusValidation,
} from "./validate";

const router = Router().use(authMiddleware);

router
  .route("/")
  .get(validate(projectStatusListValidation), controller.fetchPagination)
  .post(validate(createProjectStatusValidation), controller.store);

router
  .route("/:id")
  .get(validate(projectStatusIdValidation), controller.fetchById)
  .put(validate(updateProjectStatusValidation), controller.update)
  .delete(validate(projectStatusIdValidation), controller.delete);

export default router;
