import { Request, Response, NextFunction } from 'express';
import { EnrollmentService } from '../services/enrollmentService';
import { AppError } from '../middleware/errorHandler';

const enrollmentService = new EnrollmentService();

export class EnrollmentController {
  async enrollInCourse(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { courseId } = req.body;

      if (!courseId) {
        throw new AppError('Course ID is required', 400);
      }

      const enrollment = await enrollmentService.enrollInCourse(req.user.userId, courseId);
      res.status(201).json(enrollment);
    } catch (error) {
      next(error);
    }
  }

  async getEnrollment(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { courseId } = req.params;
      const enrollment = await enrollmentService.getEnrollment(req.user.userId, parseInt(courseId));
      res.json(enrollment);
    } catch (error) {
      next(error);
    }
  }

  async getEnrollmentById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const enrollment = await enrollmentService.getEnrollmentById(parseInt(id));
      res.json(enrollment);
    } catch (error) {
      next(error);
    }
  }

  async getUserEnrollments(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const enrollments = await enrollmentService.getUserEnrollments(req.user.userId);
      res.json(enrollments);
    } catch (error) {
      next(error);
    }
  }

  async getCourseEnrollments(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.params;
      const enrollments = await enrollmentService.getCourseEnrollments(parseInt(courseId));
      res.json(enrollments);
    } catch (error) {
      next(error);
    }
  }

  async updateEnrollmentStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !['active', 'completed', 'dropped'].includes(status)) {
        throw new AppError('Valid status is required (active, completed, or dropped)', 400);
      }

      const enrollment = await enrollmentService.updateEnrollmentStatus(parseInt(id), status);
      res.json(enrollment);
    } catch (error) {
      next(error);
    }
  }

  async calculateProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const progress = await enrollmentService.calculateProgress(parseInt(id));
      res.json({ enrollmentId: parseInt(id), progress });
    } catch (error) {
      next(error);
    }
  }
}
