import { Router } from 'express';
import { ProgressController } from '../controllers/progressController';
import { authenticate } from '../middleware/auth';

const router = Router();
const progressController = new ProgressController();

// All progress routes require authentication
router.get('/enrollment/:enrollmentId', authenticate, (req, res, next) => progressController.getUserProgress(req, res, next));
router.get('/lesson/:lessonId', authenticate, (req, res, next) => progressController.getLessonProgress(req, res, next));
router.post('/lesson/complete', authenticate, (req, res, next) => progressController.markLessonComplete(req, res, next));
router.put('/:id/time', authenticate, (req, res, next) => progressController.trackTimeSpent(req, res, next));
router.get('/stats', authenticate, (req, res, next) => progressController.getProgressStats(req, res, next));

export default router;
