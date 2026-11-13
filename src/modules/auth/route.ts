import { Router } from "express";
import { OpenDataSource } from "../../database/data-source";
import { authMiddleware } from "../../middleware/auth.middleware";
import { validationMiddleware as validate } from "../../middleware/validation.middleware";
import { AuthRepository } from "./repository";
import { AuthService } from "./service";
import { AuthController } from "./controller";
import {
  forgotPasswordValidation,
  loginValidation,
  refreshTokenValidation,
  registerValidation,
  resetPasswordValidation,
  verifiedEmailValidation,
} from "./validate";

const router = Router();
const controller = new AuthController();

router.post(
  "/register",
  validate(registerValidation),
  controller.register,
);
router.get(
  "/verified-email",
  validate(verifiedEmailValidation),
  controller.verifyEmail,
);
router.post("/login", validate(loginValidation), controller.login);
router.post(
  "/forgot-password",
  validate(forgotPasswordValidation),
  controller.forgotPassword,
);
router.post(
  "/reset-password",
  validate(resetPasswordValidation),
  controller.resetPassword,
);
router.post(
  "/refersh-token",
  validate(refreshTokenValidation),
  controller.refreshToken,
);
router.post(
  "/refresh-token",
  validate(refreshTokenValidation),
  controller.refreshToken,
);
router.post("/logout", authMiddleware, controller.logout);
router.get("/me", authMiddleware, controller.me);

export default router;