import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analyticsService';
import { AppError } from '../middleware/errorHandler';

const analyticsService = new AnalyticsService();

export class AnalyticsController {
  /**
   * Get system-wide analytics overview (Admin only)
   */
  async getSystemOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const overview = await analyticsService.getSystemOverview();
      res.json(overview);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user growth trends (Admin only)
   */
  async getUserGrowthTrends(req: Request, res: Response, next: NextFunction) {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const trends = await analyticsService.getUserGrowthOverTime(days);
      res.json(trends);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get enrollment trends (Admin only)
   */
  async getEnrollmentTrends(req: Request, res: Response, next: NextFunction) {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const trends = await analyticsService.getEnrollmentTrends(days);
      res.json(trends);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get top performing courses (Admin only)
   */
  async getTopCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const courses = await analyticsService.getTopCourses(limit);
      res.json(courses);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get course completion rates (Admin only)
   */
  async getCourseCompletionRates(req: Request, res: Response, next: NextFunction) {
    try {
      const rates = await analyticsService.getCourseCompletionRates();
      res.json(rates);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get quiz performance distribution (Admin only)
   */
  async getQuizPerformanceDistribution(req: Request, res: Response, next: NextFunction) {
    try {
      const distribution = await analyticsService.getQuizPerformanceDistribution();
      res.json(distribution);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get student personal analytics
   */
  async getStudentAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const analytics = await analyticsService.getStudentAnalytics(req.user.userId);
      res.json(analytics);
    } catch (error) {
      next(error);
    }
  }
}
