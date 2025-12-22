import { Request, Response, NextFunction } from 'express';
import { InstructorService } from '../services/instructorService';
import { AppError } from '../middleware/errorHandler';

const instructorService = new InstructorService();

export class InstructorController {
  async getCourseAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { courseId } = req.params;

      if (!courseId) {
        throw new AppError('Course ID is required', 400);
      }

      const analytics = await instructorService.getCourseAnalytics(parseInt(courseId));
      res.json(analytics);
    } catch (error) {
      next(error);
    }
  }

  async getCourseStudents(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { courseId } = req.params;

      if (!courseId) {
        throw new AppError('Course ID is required', 400);
      }

      const students = await instructorService.getCourseStudents(parseInt(courseId));
      res.json(students);
    } catch (error) {
      next(error);
    }
  }

  async getQuizPerformance(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { courseId } = req.params;

      if (!courseId) {
        throw new AppError('Course ID is required', 400);
      }

      const performance = await instructorService.getQuizPerformanceAnalytics(parseInt(courseId));
      res.json(performance);
    } catch (error) {
      next(error);
    }
  }

  async getStudentDetail(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { studentId } = req.params;
      const { courseId } = req.query;

      if (!studentId || !courseId) {
        throw new AppError('Student ID and Course ID are required', 400);
      }

      const detail = await instructorService.getStudentDetailedPerformance(
        parseInt(studentId),
        parseInt(courseId as string)
      );
      res.json(detail);
    } catch (error) {
      next(error);
    }
  }

  async exportCourseData(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { courseId } = req.params;
      const format = req.query.format as 'csv' | 'json' || 'json';

      if (!courseId) {
        throw new AppError('Course ID is required', 400);
      }

      const data = await instructorService.exportCourseData(parseInt(courseId), format);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
}
