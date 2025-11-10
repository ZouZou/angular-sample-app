import { Request, Response, NextFunction } from 'express';
import { QuizService } from '../services/quizService';
import { AppError } from '../middleware/errorHandler';

const quizService = new QuizService();

export class QuizController {
  async getQuiz(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { includeCorrectAnswers } = req.query;

      const quiz = await quizService.getQuiz(parseInt(id), includeCorrectAnswers === 'true');
      res.json(quiz);
    } catch (error) {
      next(error);
    }
  }

  async getCourseQuizzes(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.params;
      const quizzes = await quizService.getCourseQuizzes(parseInt(courseId));
      res.json(quizzes);
    } catch (error) {
      next(error);
    }
  }

  async createQuiz(req: Request, res: Response, next: NextFunction) {
    try {
      const quizData = req.body;

      if (!quizData.courseId || !quizData.title || !quizData.questions || quizData.questions.length === 0) {
        throw new AppError('Course ID, title, and at least one question are required', 400);
      }

      const quiz = await quizService.createQuiz(quizData);
      res.status(201).json(quiz);
    } catch (error) {
      next(error);
    }
  }

  async startQuizAttempt(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { quizId, enrollmentId } = req.body;

      if (!quizId || !enrollmentId) {
        throw new AppError('Quiz ID and Enrollment ID are required', 400);
      }

      const attempt = await quizService.startQuizAttempt(req.user.userId, enrollmentId, quizId);
      res.status(201).json(attempt);
    } catch (error) {
      next(error);
    }
  }

  async submitQuizAttempt(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { answers } = req.body;

      if (!answers || !Array.isArray(answers)) {
        throw new AppError('Answers array is required', 400);
      }

      const attempt = await quizService.submitQuizAttempt(parseInt(id), answers);
      res.json(attempt);
    } catch (error) {
      next(error);
    }
  }

  async getUserQuizAttempts(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { quizId } = req.params;
      const attempts = await quizService.getUserQuizAttempts(req.user.userId, parseInt(quizId));
      res.json(attempts);
    } catch (error) {
      next(error);
    }
  }

  async getAttemptDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const attempt = await quizService.getAttemptDetails(parseInt(id));
      res.json(attempt);
    } catch (error) {
      next(error);
    }
  }

  async getBestAttempt(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { quizId } = req.params;
      const attempt = await quizService.getBestAttempt(req.user.userId, parseInt(quizId));
      res.json(attempt);
    } catch (error) {
      next(error);
    }
  }
}
