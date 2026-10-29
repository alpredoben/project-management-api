import { Router } from 'express';
import healthRoute from '../modules/health/health.route';
import authRouter from '../modules/auth/route';

const router = Router();

/** Health Route */
router.use('/health', healthRoute);

/** Auth Route */
router.use('/auth', authRouter);

export default router;
