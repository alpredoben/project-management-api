import { Router, Request, Response } from 'express';

const router = Router();

/**
 * @route   GET /api/v1/health
 * @desc    Check health of api communication
 * @access  Public
 */
router.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is up and running!',
    timestamp: new Date().toISOString(),
    request_ip: req.ip,
    request_agent: req.get('User-Agent'),
  });
});
export default router;
