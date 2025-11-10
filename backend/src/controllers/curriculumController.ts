import { Request, Response, NextFunction } from 'express';
import { CurriculumService } from '../services/curriculumService';
import { AppError } from '../middleware/errorHandler';

const curriculumService = new CurriculumService();

export class CurriculumController {
  // Section controllers
  async getCourseSections(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.params;
      const sections = await curriculumService.getCourseSections(parseInt(courseId));
      res.json(sections);
    } catch (error) {
      next(error);
    }
  }

  async getSection(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const section = await curriculumService.getSection(parseInt(id));
      res.json(section);
    } catch (error) {
      next(error);
    }
  }

  async createSection(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId, title, description, order } = req.body;

      if (!courseId || !title || order === undefined) {
        throw new AppError('Course ID, title, and order are required', 400);
      }

      const section = await curriculumService.createSection({ courseId, title, description, order });
      res.status(201).json(section);
    } catch (error) {
      next(error);
    }
  }

  async updateSection(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const section = await curriculumService.updateSection(parseInt(id), updateData);
      res.json(section);
    } catch (error) {
      next(error);
    }
  }

  async deleteSection(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await curriculumService.deleteSection(parseInt(id));
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async reorderSections(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId, sectionIds } = req.body;

      if (!courseId || !Array.isArray(sectionIds)) {
        throw new AppError('Course ID and section IDs array are required', 400);
      }

      const result = await curriculumService.reorderSections(courseId, sectionIds);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Lesson controllers
  async getLesson(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const lesson = await curriculumService.getLesson(parseInt(id));
      res.json(lesson);
    } catch (error) {
      next(error);
    }
  }

  async createLesson(req: Request, res: Response, next: NextFunction) {
    try {
      const { sectionId, title, description, type, order, duration, content, videoUrl, quizId } = req.body;

      if (!sectionId || !title || !type || order === undefined) {
        throw new AppError('Section ID, title, type, and order are required', 400);
      }

      const lesson = await curriculumService.createLesson({
        sectionId,
        title,
        description,
        type,
        order,
        duration,
        content,
        videoUrl,
        quizId
      });

      res.status(201).json(lesson);
    } catch (error) {
      next(error);
    }
  }

  async updateLesson(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const lesson = await curriculumService.updateLesson(parseInt(id), updateData);
      res.json(lesson);
    } catch (error) {
      next(error);
    }
  }

  async deleteLesson(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await curriculumService.deleteLesson(parseInt(id));
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async reorderLessons(req: Request, res: Response, next: NextFunction) {
    try {
      const { sectionId, lessonIds } = req.body;

      if (!sectionId || !Array.isArray(lessonIds)) {
        throw new AppError('Section ID and lesson IDs array are required', 400);
      }

      const result = await curriculumService.reorderLessons(sectionId, lessonIds);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
