import { Router } from 'express';
import { DiagnosticsController } from '../controllers/DiagnosticsController';
import { authenticateUser } from '../middleware/authMiddleware';
import { apiRateLimiter, aiActionLimiter } from '../middleware/rateLimiter';
import { uploadMiddleware } from '../middleware/uploadMiddleware';

const router = Router();

router.use(authenticateUser);

router.get('/', apiRateLimiter, DiagnosticsController.getDiagnostics);
router.get('/:id', apiRateLimiter, DiagnosticsController.getDiagnosticById);
router.post('/analyze', aiActionLimiter, uploadMiddleware.single('image'), DiagnosticsController.analyzeDiagnostic);

export default router;
