import { AppDataSource } from '../config/database';
import { CourseSection } from '../entities/CourseSection';
import { Lesson } from '../entities/Lesson';
import { Course } from '../entities/Course';
import { AppError } from '../middleware/errorHandler';

export class CurriculumService {
  private sectionRepository = AppDataSource.getRepository(CourseSection);
  private lessonRepository = AppDataSource.getRepository(Lesson);
  private courseRepository = AppDataSource.getRepository(Course);

  // Section methods
  async getCourseSections(courseId: number) {
    const sections = await this.sectionRepository.find({
      where: { courseId },
      relations: ['lessons'],
      order: { order: 'ASC' }
    });

    // Sort lessons within each section
    sections.forEach(section => {
      if (section.lessons) {
        section.lessons.sort((a, b) => a.order - b.order);
      }
    });

    return sections;
  }

  async getSection(id: number) {
    const section = await this.sectionRepository.findOne({
      where: { id },
      relations: ['lessons']
    });

    if (!section) {
      throw new AppError('Section not found', 404);
    }

    if (section.lessons) {
      section.lessons.sort((a, b) => a.order - b.order);
    }

    return section;
  }

  async createSection(data: { courseId: number; title: string; description?: string; order: number }) {
    // Verify course exists
    const course = await this.courseRepository.findOne({ where: { id: data.courseId } });
    if (!course) {
      throw new AppError('Course not found', 404);
    }

    const section = this.sectionRepository.create(data);
    await this.sectionRepository.save(section);
    return section;
  }

  async updateSection(id: number, data: Partial<CourseSection>) {
    const section = await this.sectionRepository.findOne({ where: { id } });

    if (!section) {
      throw new AppError('Section not found', 404);
    }

    Object.assign(section, data);
    await this.sectionRepository.save(section);
    return section;
  }

  async deleteSection(id: number) {
    const section = await this.sectionRepository.findOne({ where: { id } });

    if (!section) {
      throw new AppError('Section not found', 404);
    }

    await this.sectionRepository.remove(section);
    return { message: 'Section deleted successfully' };
  }

  async reorderSections(courseId: number, sectionIds: number[]) {
    const sections = await this.sectionRepository.find({ where: { courseId } });

    // Update order for each section
    const updatePromises = sectionIds.map((sectionId, index) => {
      const section = sections.find(s => s.id === sectionId);
      if (section) {
        section.order = index;
        return this.sectionRepository.save(section);
      }
      return Promise.resolve();
    });

    await Promise.all(updatePromises);
    return { message: 'Sections reordered successfully' };
  }

  // Lesson methods
  async getLesson(id: number) {
    const lesson = await this.lessonRepository.findOne({ where: { id } });

    if (!lesson) {
      throw new AppError('Lesson not found', 404);
    }

    return lesson;
  }

  async createLesson(data: {
    sectionId: number;
    title: string;
    description?: string;
    type: 'video' | 'text' | 'quiz' | 'assignment';
    order: number;
    duration?: number;
    content?: string;
    videoUrl?: string;
    quizId?: number;
  }) {
    // Verify section exists
    const section = await this.sectionRepository.findOne({ where: { id: data.sectionId } });
    if (!section) {
      throw new AppError('Section not found', 404);
    }

    const lesson = this.lessonRepository.create(data);
    await this.lessonRepository.save(lesson);
    return lesson;
  }

  async updateLesson(id: number, data: Partial<Lesson>) {
    const lesson = await this.lessonRepository.findOne({ where: { id } });

    if (!lesson) {
      throw new AppError('Lesson not found', 404);
    }

    Object.assign(lesson, data);
    await this.lessonRepository.save(lesson);
    return lesson;
  }

  async deleteLesson(id: number) {
    const lesson = await this.lessonRepository.findOne({ where: { id } });

    if (!lesson) {
      throw new AppError('Lesson not found', 404);
    }

    await this.lessonRepository.remove(lesson);
    return { message: 'Lesson deleted successfully' };
  }

  async reorderLessons(sectionId: number, lessonIds: number[]) {
    const lessons = await this.lessonRepository.find({ where: { sectionId } });

    // Update order for each lesson
    const updatePromises = lessonIds.map((lessonId, index) => {
      const lesson = lessons.find(l => l.id === lessonId);
      if (lesson) {
        lesson.order = index;
        return this.lessonRepository.save(lesson);
      }
      return Promise.resolve();
    });

    await Promise.all(updatePromises);
    return { message: 'Lessons reordered successfully' };
  }
}
