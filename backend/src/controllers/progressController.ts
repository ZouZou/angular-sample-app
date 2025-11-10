import { Request, Response, NextFunction } from 'express';
import { ProgressService } from '../services/progressService';
import { AppError } from '../middleware/errorHandler';

const progressService = new ProgressService();

export class ProgressController {
  async getUserProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const { enrollmentId } = req.params;
      const progress = await progressService.getUserProgress(parseInt(enrollmentId));
      res.json(progress);
    } catch (error) {
      next(error);
    }
  }

  async getLessonProgress(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { lessonId } = req.params;
      const progress = await progressService.getLessonProgress(req.user.userId, parseInt(lessonId));
      res.json(progress);
    } catch (error) {
      next(error);
    }
  }

  async markLessonComplete(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { enrollmentId, lessonId } = req.body;

      if (!enrollmentId || !lessonId) {
        throw new AppError('Enrollment ID and Lesson ID are required', 400);
      }

      const progress = await progressService.markLessonComplete(req.user.userId, enrollmentId, lessonId);
      res.json(progress);
    } catch (error) {
      next(error);
    }
  }

  async trackTimeSpent(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { minutes } = req.body;

      if (!minutes || minutes < 0) {
        throw new AppError('Valid minutes value is required', 400);
      }

      const progress = await progressService.trackTimeSpent(parseInt(id), minutes);
      res.json(progress);
    } catch (error) {
      next(error);
    }
  }

  async getProgressStats(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const stats = await progressService.getProgressStats(req.user.userId);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
}
