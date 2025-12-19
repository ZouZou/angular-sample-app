import { Router } from 'express';
import { QuizController } from '../controllers/quizController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const quizController = new QuizController();

// Get all attempts for all users (admin only)
router.get('/', authenticate, authorize('admin'), (req, res, next) => quizController.getAllAttempts(req, res, next));

// Get all attempts for a specific user (admin only or own user)
router.get('/user/:userId', authenticate, (req, res, next) => quizController.getUserAllAttempts(req, res, next));

// Get all attempts for a specific course (admin only)
router.get('/course/:courseId', authenticate, authorize('admin'), (req, res, next) => quizController.getCourseAttempts(req, res, next));

export default router;
