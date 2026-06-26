import { Router } from 'express';
import { sendResponse } from '../shared/utils/api-response';

const router = Router();

 
router.get('/', (_req, res) => {
  sendResponse(res, {
    message: 'Server is healthy',
    data: {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
