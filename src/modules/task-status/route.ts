import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { validationMiddleware as validate } from "../../middleware/validation.middleware";
import { taskStatusController as controller } from "./controller";
import {
  createValidation,
  primaryKeyValidation,
  queryListValidation,
  updateValidation,
} from "./validate";

const router = Router().use(authMiddleware);

router
  .route("/")
  .get(validate(queryListValidation), controller.fetchPagination)
  .post(validate(createValidation), controller.store);

router
  .route("/:id")
  .get(validate(primaryKeyValidation), controller.fetchById)
  .put(validate(updateValidation), controller.update)
  .delete(validate(primaryKeyValidation), controller.delete);

export default router;
