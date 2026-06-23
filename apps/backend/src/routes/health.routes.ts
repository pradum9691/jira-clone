import { Router } from 'express';
import { sendResponse } from '../shared/utils/api-response';

const router = Router();

/**
 * GET /api/v1/health
 *
 * Used by Render (and any uptime monitor) to verify the service is
 * alive. Returns 200 with a simple status payload — no DB check here
 * intentionally, so this stays fast even if the DB is briefly down.
 */
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
