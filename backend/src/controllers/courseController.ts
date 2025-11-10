import { Request, Response, NextFunction } from 'express';
import { CourseService } from '../services/courseService';
import { AppError } from '../middleware/errorHandler';

const courseService = new CourseService();

export class CourseController {
  async getCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, level, published } = req.query;

      const filters: any = {};
      if (category) filters.category = category as string;
      if (level) filters.level = level as string;
      if (published !== undefined) filters.published = published === 'true';

      const courses = await courseService.getCourses(filters);
      res.json(courses);
    } catch (error) {
      next(error);
    }
  }

  async getCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const course = await courseService.getCourse(parseInt(id));
      res.json(course);
    } catch (error) {
      next(error);
    }
  }

  async createCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, description, instructor, duration, price, category, level, thumbnailUrl, bannerUrl, language, requirements, learningOutcomes, published } = req.body;

      if (!title) {
        throw new AppError('Title is required', 400);
      }

      const courseData = {
        title,
        description,
        instructor,
        duration,
        price,
        category,
        level,
        thumbnailUrl,
        bannerUrl,
        language,
        requirements,
        learningOutcomes,
        published: published || false
      };

      const course = await courseService.createCourse(courseData);
      res.status(201).json(course);
    } catch (error) {
      next(error);
    }
  }

  async updateCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const course = await courseService.updateCourse(parseInt(id), updateData);
      res.json(course);
    } catch (error) {
      next(error);
    }
  }

  async deleteCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await courseService.deleteCourse(parseInt(id));
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getCoursesByCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { category } = req.params;
      const courses = await courseService.getCoursesByCategory(category);
      res.json(courses);
    } catch (error) {
      next(error);
    }
  }

  async getCoursesByLevel(req: Request, res: Response, next: NextFunction) {
    try {
      const { level } = req.params;
      const courses = await courseService.getCoursesByLevel(level);
      res.json(courses);
    } catch (error) {
      next(error);
    }
  }
}
