import { Router } from 'express';
import { EnrollmentController } from '../controllers/enrollmentController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const enrollmentController = new EnrollmentController();

// All enrollment routes require authentication
router.post('/', authenticate, (req, res, next) => enrollmentController.enrollInCourse(req, res, next));
router.get('/my-courses', authenticate, (req, res, next) => enrollmentController.getUserEnrollments(req, res, next));
router.get('/course/:courseId', authenticate, (req, res, next) => enrollmentController.getEnrollment(req, res, next));
router.get('/:id', authenticate, (req, res, next) => enrollmentController.getEnrollmentById(req, res, next));
router.put('/:id/status', authenticate, (req, res, next) => enrollmentController.updateEnrollmentStatus(req, res, next));
router.post('/:id/calculate-progress', authenticate, (req, res, next) => enrollmentController.calculateProgress(req, res, next));

// Admin only
router.get('/course/:courseId/students', authenticate, authorize('admin', 'instructor'), (req, res, next) => enrollmentController.getCourseEnrollments(req, res, next));

export default router;
