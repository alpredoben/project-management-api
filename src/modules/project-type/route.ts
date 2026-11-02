import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { validationMiddleware as validate } from "../../middleware/validation.middleware";
import { projectTypeController as controller } from "./controller";
import {
  createProjectTypeValidation,
  projectTypeIdValidation,
  projectTypeListValidation,
  updateProjectTypeValidation,
} from "./validate";

const router = Router().use(authMiddleware);

router
  .route("/")
  .get(validate(projectTypeListValidation), controller.fetchPagination)
  .post(validate(createProjectTypeValidation), controller.store);

router
  .route("/:id")
  .get(validate(projectTypeIdValidation), controller.fetchById)
  .put(validate(updateProjectTypeValidation), controller.update)
  .delete(validate(projectTypeIdValidation), controller.delete);

export default router;
