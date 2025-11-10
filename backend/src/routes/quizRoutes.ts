import { Router } from 'express';
import { QuizController } from '../controllers/quizController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const quizController = new QuizController();

// Quiz routes
router.get('/:id', authenticate, (req, res, next) => quizController.getQuiz(req, res, next));
router.get('/course/:courseId/quizzes', (req, res, next) => quizController.getCourseQuizzes(req, res, next));
router.post('/', authenticate, authorize('instructor', 'admin'), (req, res, next) => quizController.createQuiz(req, res, next));

// Quiz attempt routes
router.post('/attempts/start', authenticate, (req, res, next) => quizController.startQuizAttempt(req, res, next));
router.post('/attempts/:id/submit', authenticate, (req, res, next) => quizController.submitQuizAttempt(req, res, next));
router.get('/attempts/quiz/:quizId/my', authenticate, (req, res, next) => quizController.getUserQuizAttempts(req, res, next));
router.get('/attempts/:id', authenticate, (req, res, next) => quizController.getAttemptDetails(req, res, next));
router.get('/attempts/quiz/:quizId/best', authenticate, (req, res, next) => quizController.getBestAttempt(req, res, next));

export default router;
