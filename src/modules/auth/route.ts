import { Router } from 'express';
import { AuthController } from './controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validationMiddleware } from '../../middleware/validation.middleware';
import { loginValidation, refreshTokenValidation } from './validate';

const router = Router();

const controller = new AuthController();

/**
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
router.post(
  '/login',
  validationMiddleware(loginValidation),
  controller.login.bind(controller)
);

/**
 * @route   POST /api/v1/auth/refresh-token
 * @access  Public
 */
router.post(
  '/refresh-token',
  validationMiddleware(refreshTokenValidation),
  controller.refreshToken.bind(controller)
);

/**
 * @route   POST /api/v1/auth/logout
 * @access  Private (membutuhkan middleware auth)
 */
router.post(
  '/logout',
  authMiddleware,
  controller.logout.bind(controller)
);

/**
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
router.get('/me', authMiddleware, controller.getMe.bind(controller));

export default router;
