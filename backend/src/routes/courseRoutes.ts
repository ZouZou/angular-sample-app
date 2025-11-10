import { Router } from 'express';
import { CourseController } from '../controllers/courseController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const courseController = new CourseController();

// Public routes
router.get('/', (req, res, next) => courseController.getCourses(req, res, next));
router.get('/category/:category', (req, res, next) => courseController.getCoursesByCategory(req, res, next));
router.get('/level/:level', (req, res, next) => courseController.getCoursesByLevel(req, res, next));
router.get('/:id', (req, res, next) => courseController.getCourse(req, res, next));

// Protected routes (instructor/admin only)
router.post('/', authenticate, authorize('instructor', 'admin'), (req, res, next) => courseController.createCourse(req, res, next));
router.put('/:id', authenticate, authorize('instructor', 'admin'), (req, res, next) => courseController.updateCourse(req, res, next));
router.delete('/:id', authenticate, authorize('instructor', 'admin'), (req, res, next) => courseController.deleteCourse(req, res, next));

export default router;
