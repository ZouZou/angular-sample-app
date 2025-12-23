import { Router } from 'express';
import { recommendationController } from '../controllers/recommendationController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Personalized recommendations (requires authentication)
router.get('/for-me', authenticate, recommendationController.getPersonalizedRecommendations);

// Similar courses (public)
router.get('/similar/:courseId', recommendationController.getSimilarCourses);

// Next course after completion (requires authentication)
router.get('/next/:courseId', authenticate, recommendationController.getNextCourse);

// Popular/trending courses (public)
router.get('/popular', recommendationController.getPopularCourses);

// Clear cache (admin only)
router.delete('/cache', authenticate, recommendationController.clearCache);

export default router;
