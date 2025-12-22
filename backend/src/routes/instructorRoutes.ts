import { Router } from 'express';
import { InstructorController } from '../controllers/instructorController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const instructorController = new InstructorController();

// All instructor analytics routes require authentication and instructor/admin role
router.get(
  '/analytics/course/:courseId/overview',
  authenticate,
  authorize('instructor', 'admin'),
  (req, res, next) => instructorController.getCourseAnalytics(req, res, next)
);

router.get(
  '/analytics/course/:courseId/students',
  authenticate,
  authorize('instructor', 'admin'),
  (req, res, next) => instructorController.getCourseStudents(req, res, next)
);

router.get(
  '/analytics/course/:courseId/quiz-performance',
  authenticate,
  authorize('instructor', 'admin'),
  (req, res, next) => instructorController.getQuizPerformance(req, res, next)
);

router.get(
  '/analytics/student/:studentId/detail',
  authenticate,
  authorize('instructor', 'admin'),
  (req, res, next) => instructorController.getStudentDetail(req, res, next)
);

router.get(
  '/analytics/course/:courseId/export',
  authenticate,
  authorize('instructor', 'admin'),
  (req, res, next) => instructorController.exportCourseData(req, res, next)
);

export default router;
