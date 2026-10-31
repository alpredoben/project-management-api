import { Router } from 'express';
import healthRoute from '../modules/health/health.route';
import authRouter from '../modules/auth/route';
import roleRouter from '../modules/roles/route';

const router = Router();

/** Health Route */
router.use('/health', healthRoute);

/** Auth Route */
router.use('/auth', authRouter);
router.use('/roles', roleRouter);

export default router;
