import { Router } from 'express';
import { PlotController } from '../controllers/PlotController';
import { authenticateUser } from '../middleware/authMiddleware';
import { apiRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(authenticateUser);
router.use(apiRateLimiter);

router.post('/', PlotController.createPlot);
router.get('/', PlotController.getPlots);
router.get('/:id', PlotController.getPlotById);

export default router;
