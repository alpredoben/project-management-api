import { Router } from "express";
import { authController as controller } from "./controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { validationMiddleware as validate } from "../../middleware/validation.middleware";
import { loginValidation, refreshTokenValidation } from "./validate";

const router = Router();

router.post("/login", validate(loginValidation), controller.login);
router.post(
  "/refresh-token",
  validate(refreshTokenValidation),
  controller.refreshToken,
);
router.post("/logout", authMiddleware, controller.logout);
router.get("/me", authMiddleware, controller.getMe);

export default router;
