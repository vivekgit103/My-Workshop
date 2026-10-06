import { Router } from 'express';
import { AdvisoryController } from '../controllers/AdvisoryController';
import { authenticateUser } from '../middleware/authMiddleware';
import { apiRateLimiter, aiActionLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(authenticateUser);

router.get('/', apiRateLimiter, AdvisoryController.getAdvisories);
router.get('/:id', apiRateLimiter, AdvisoryController.getAdvisoryById);
router.post('/generate', aiActionLimiter, AdvisoryController.generateAdvisory);

export default router;
