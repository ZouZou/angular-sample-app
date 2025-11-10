import { AppDataSource } from '../config/database';
import { Course } from '../entities/Course';
import { AppError } from '../middleware/errorHandler';

export class CourseService {
  private courseRepository = AppDataSource.getRepository(Course);

  async getCourses(filters?: { category?: string; level?: string; published?: boolean }) {
    const queryBuilder = this.courseRepository.createQueryBuilder('course');

    if (filters?.category) {
      queryBuilder.andWhere('course.category = :category', { category: filters.category });
    }

    if (filters?.level) {
      queryBuilder.andWhere('course.level = :level', { level: filters.level });
    }

    if (filters?.published !== undefined) {
      queryBuilder.andWhere('course.published = :published', { published: filters.published });
    }

    queryBuilder.orderBy('course.createdAt', 'DESC');

    const courses = await queryBuilder.getMany();
    return courses;
  }

  async getCourse(id: number) {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['sections', 'sections.lessons']
    });

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    // Sort sections and lessons by order
    if (course.sections) {
      course.sections.sort((a, b) => a.order - b.order);
      course.sections.forEach(section => {
        if (section.lessons) {
          section.lessons.sort((a, b) => a.order - b.order);
        }
      });
    }

    return course;
  }

  async createCourse(data: Partial<Course>) {
    const course = this.courseRepository.create(data);
    await this.courseRepository.save(course);
    return course;
  }

  async updateCourse(id: number, data: Partial<Course>) {
    const course = await this.courseRepository.findOne({ where: { id } });

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    // Update fields
    Object.assign(course, data);
    await this.courseRepository.save(course);

    return course;
  }

  async deleteCourse(id: number) {
    const course = await this.courseRepository.findOne({ where: { id } });

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    await this.courseRepository.remove(course);
    return { message: 'Course deleted successfully' };
  }

  async getCoursesByCategory(category: string) {
    return this.getCourses({ category });
  }

  async getCoursesByLevel(level: string) {
    return this.getCourses({ level: level as any });
  }

  async incrementEnrollmentCount(courseId: number) {
    const course = await this.courseRepository.findOne({ where: { id: courseId } });

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    course.enrollmentCount = (course.enrollmentCount || 0) + 1;
    await this.courseRepository.save(course);

    return course;
  }

  async updateRating(courseId: number, newRating: number) {
    const course = await this.courseRepository.findOne({ where: { id: courseId } });

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    course.rating = newRating;
    await this.courseRepository.save(course);

    return course;
  }
}
