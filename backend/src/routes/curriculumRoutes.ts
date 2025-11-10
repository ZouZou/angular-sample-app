import { Router } from 'express';
import { CurriculumController } from '../controllers/curriculumController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const curriculumController = new CurriculumController();

// Section routes
// Public routes
router.get('/courses/:courseId/sections', (req, res, next) => curriculumController.getCourseSections(req, res, next));
router.get('/sections/:id', (req, res, next) => curriculumController.getSection(req, res, next));

// Protected routes (instructor/admin only)
router.post('/sections', authenticate, authorize('instructor', 'admin'), (req, res, next) => curriculumController.createSection(req, res, next));
router.put('/sections/:id', authenticate, authorize('instructor', 'admin'), (req, res, next) => curriculumController.updateSection(req, res, next));
router.delete('/sections/:id', authenticate, authorize('instructor', 'admin'), (req, res, next) => curriculumController.deleteSection(req, res, next));
router.put('/sections/reorder', authenticate, authorize('instructor', 'admin'), (req, res, next) => curriculumController.reorderSections(req, res, next));

// Lesson routes
// Public routes
router.get('/lessons/:id', (req, res, next) => curriculumController.getLesson(req, res, next));

// Protected routes (instructor/admin only)
router.post('/lessons', authenticate, authorize('instructor', 'admin'), (req, res, next) => curriculumController.createLesson(req, res, next));
router.put('/lessons/:id', authenticate, authorize('instructor', 'admin'), (req, res, next) => curriculumController.updateLesson(req, res, next));
router.delete('/lessons/:id', authenticate, authorize('instructor', 'admin'), (req, res, next) => curriculumController.deleteLesson(req, res, next));
router.put('/lessons/reorder', authenticate, authorize('instructor', 'admin'), (req, res, next) => curriculumController.reorderLessons(req, res, next));

export default router;
