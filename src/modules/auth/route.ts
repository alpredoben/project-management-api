import { Router } from 'express';
import { authController } from './controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validationMiddleware } from '../../middleware/validation.middleware';
import { loginValidation, refreshTokenValidation } from './validate';

const router = Router();

/**
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
router.post(
  '/login',
  validationMiddleware(loginValidation),
  authController.login
);

/**
 * @route   POST /api/v1/auth/refresh-token
 * @access  Public
 */
router.post(
  '/refresh-token',
  validationMiddleware(refreshTokenValidation),
  authController.refreshToken
);

/**
 * @route   POST /api/v1/auth/logout
 * @access  Private (membutuhkan middleware auth)
 */
router.post(
  '/logout',
  authMiddleware,
  authController.logout
);

/**
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
router.get('/me', authMiddleware, authController.getMe);

export default router;
