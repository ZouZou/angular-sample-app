import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const analyticsController = new AnalyticsController();

// System-wide analytics (Admin only)
router.get('/system/overview', authenticate, authorize('admin'), (req, res, next) =>
  analyticsController.getSystemOverview(req, res, next)
);

router.get('/system/user-growth', authenticate, authorize('admin'), (req, res, next) =>
  analyticsController.getUserGrowthTrends(req, res, next)
);

router.get('/system/enrollment-trends', authenticate, authorize('admin'), (req, res, next) =>
  analyticsController.getEnrollmentTrends(req, res, next)
);

router.get('/system/top-courses', authenticate, authorize('admin'), (req, res, next) =>
  analyticsController.getTopCourses(req, res, next)
);

router.get('/system/completion-rates', authenticate, authorize('admin'), (req, res, next) =>
  analyticsController.getCourseCompletionRates(req, res, next)
);

router.get('/system/quiz-distribution', authenticate, authorize('admin'), (req, res, next) =>
  analyticsController.getQuizPerformanceDistribution(req, res, next)
);

// Student personal analytics
router.get('/student/my-analytics', authenticate, (req, res, next) =>
  analyticsController.getStudentAnalytics(req, res, next)
);

export default router;
