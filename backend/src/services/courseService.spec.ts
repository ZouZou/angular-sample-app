import { CourseService } from './courseService';
import { AppDataSource } from '../config/database';
import { Course } from '../entities/Course';
import { AppError } from '../middleware/errorHandler';

jest.mock('../config/database');

describe('CourseService', () => {
  let courseService: CourseService;
  let mockCourseRepository: any;
  let mockQueryBuilder: any;

  beforeEach(() => {
    mockQueryBuilder = {
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    };

    mockCourseRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    };

    (AppDataSource.getRepository as jest.Mock) = jest.fn().mockReturnValue(mockCourseRepository);
    courseService = new CourseService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCourses', () => {
    it('should get all courses without filters', async () => {
      const mockCourses = [
        { id: 1, title: 'Course 1', category: 'Programming' },
        { id: 2, title: 'Course 2', category: 'Design' },
      ];

      mockQueryBuilder.getMany.mockResolvedValue(mockCourses);

      const result = await courseService.getCourses();

      expect(mockCourseRepository.createQueryBuilder).toHaveBeenCalledWith('course');
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('course.createdAt', 'DESC');
      expect(result).toEqual(mockCourses);
    });

    it('should filter courses by category', async () => {
      const mockCourses = [{ id: 1, title: 'Course 1', category: 'Programming' }];
      mockQueryBuilder.getMany.mockResolvedValue(mockCourses);

      await courseService.getCourses({ category: 'Programming' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('course.category = :category', { category: 'Programming' });
    });

    it('should filter courses by level', async () => {
      const mockCourses = [{ id: 1, title: 'Course 1', level: 'beginner' }];
      mockQueryBuilder.getMany.mockResolvedValue(mockCourses);

      await courseService.getCourses({ level: 'beginner' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('course.level = :level', { level: 'beginner' });
    });

    it('should filter courses by published status', async () => {
      const mockCourses = [{ id: 1, title: 'Course 1', published: true }];
      mockQueryBuilder.getMany.mockResolvedValue(mockCourses);

      await courseService.getCourses({ published: true });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('course.published = :published', { published: true });
    });

    it('should apply multiple filters', async () => {
      const mockCourses = [{ id: 1, title: 'Course 1' }];
      mockQueryBuilder.getMany.mockResolvedValue(mockCourses);

      await courseService.getCourses({
        category: 'Programming',
        level: 'beginner',
        published: true,
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(3);
    });
  });

  describe('getCourse', () => {
    it('should get course by id with relations', async () => {
      const mockCourse = {
        id: 1,
        title: 'Test Course',
        sections: [
          {
            id: 1,
            order: 2,
            lessons: [
              { id: 1, order: 2 },
              { id: 2, order: 1 },
            ],
          },
          {
            id: 2,
            order: 1,
            lessons: [{ id: 3, order: 1 }],
          },
        ],
      };

      mockCourseRepository.findOne.mockResolvedValue(mockCourse);

      const result = await courseService.getCourse(1);

      expect(mockCourseRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['sections', 'sections.lessons'],
      });

      // Verify sections are sorted by order
      expect(result.sections[0].order).toBe(1);
      expect(result.sections[1].order).toBe(2);

      // Verify lessons are sorted by order
      expect(result.sections[0].lessons[0].order).toBe(1);
      expect(result.sections[1].lessons[0].order).toBe(1);
      expect(result.sections[1].lessons[1].order).toBe(2);
    });

    it('should throw error if course not found', async () => {
      mockCourseRepository.findOne.mockResolvedValue(null);

      await expect(courseService.getCourse(999)).rejects.toThrow(new AppError('Course not found', 404));
    });

    it('should handle course without sections', async () => {
      const mockCourse = {
        id: 1,
        title: 'Test Course',
        sections: null,
      };

      mockCourseRepository.findOne.mockResolvedValue(mockCourse);

      const result = await courseService.getCourse(1);

      expect(result).toEqual(mockCourse);
    });
  });

  describe('createCourse', () => {
    it('should create a new course', async () => {
      const courseData = {
        title: 'New Course',
        description: 'Course description',
        instructor: 'John Doe',
        price: 99.99,
      };

      const mockCourse = { id: 1, ...courseData };

      mockCourseRepository.create.mockReturnValue(mockCourse);
      mockCourseRepository.save.mockResolvedValue(mockCourse);

      const result = await courseService.createCourse(courseData);

      expect(mockCourseRepository.create).toHaveBeenCalledWith(courseData);
      expect(mockCourseRepository.save).toHaveBeenCalledWith(mockCourse);
      expect(result).toEqual(mockCourse);
    });
  });

  describe('updateCourse', () => {
    it('should update course successfully', async () => {
      const mockCourse = {
        id: 1,
        title: 'Old Title',
        description: 'Old Description',
      };

      const updateData = {
        title: 'New Title',
        description: 'New Description',
      };

      mockCourseRepository.findOne.mockResolvedValue(mockCourse);
      mockCourseRepository.save.mockResolvedValue({ ...mockCourse, ...updateData });

      const result = await courseService.updateCourse(1, updateData);

      expect(mockCourseRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockCourseRepository.save).toHaveBeenCalled();
      expect(result.title).toBe('New Title');
    });

    it('should throw error if course not found', async () => {
      mockCourseRepository.findOne.mockResolvedValue(null);

      await expect(
        courseService.updateCourse(999, { title: 'New Title' })
      ).rejects.toThrow(new AppError('Course not found', 404));
    });
  });

  describe('deleteCourse', () => {
    it('should delete course successfully', async () => {
      const mockCourse = {
        id: 1,
        title: 'Course to Delete',
      };

      mockCourseRepository.findOne.mockResolvedValue(mockCourse);
      mockCourseRepository.remove.mockResolvedValue(mockCourse);

      const result = await courseService.deleteCourse(1);

      expect(mockCourseRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockCourseRepository.remove).toHaveBeenCalledWith(mockCourse);
      expect(result).toEqual({ message: 'Course deleted successfully' });
    });

    it('should throw error if course not found', async () => {
      mockCourseRepository.findOne.mockResolvedValue(null);

      await expect(courseService.deleteCourse(999)).rejects.toThrow(new AppError('Course not found', 404));
    });
  });

  describe('getCoursesByCategory', () => {
    it('should get courses by category', async () => {
      const mockCourses = [{ id: 1, category: 'Programming' }];
      mockQueryBuilder.getMany.mockResolvedValue(mockCourses);

      const result = await courseService.getCoursesByCategory('Programming');

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('course.category = :category', { category: 'Programming' });
      expect(result).toEqual(mockCourses);
    });
  });

  describe('getCoursesByLevel', () => {
    it('should get courses by level', async () => {
      const mockCourses = [{ id: 1, level: 'beginner' }];
      mockQueryBuilder.getMany.mockResolvedValue(mockCourses);

      const result = await courseService.getCoursesByLevel('beginner');

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('course.level = :level', { level: 'beginner' });
      expect(result).toEqual(mockCourses);
    });
  });

  describe('incrementEnrollmentCount', () => {
    it('should increment enrollment count', async () => {
      const mockCourse = {
        id: 1,
        enrollmentCount: 10,
      };

      mockCourseRepository.findOne.mockResolvedValue(mockCourse);
      mockCourseRepository.save.mockResolvedValue({ ...mockCourse, enrollmentCount: 11 });

      const result = await courseService.incrementEnrollmentCount(1);

      expect(mockCourse.enrollmentCount).toBe(11);
      expect(mockCourseRepository.save).toHaveBeenCalledWith(mockCourse);
    });

    it('should initialize enrollment count if null', async () => {
      const mockCourse = {
        id: 1,
        enrollmentCount: null,
      };

      mockCourseRepository.findOne.mockResolvedValue(mockCourse);
      mockCourseRepository.save.mockResolvedValue({ ...mockCourse, enrollmentCount: 1 });

      await courseService.incrementEnrollmentCount(1);

      expect(mockCourse.enrollmentCount).toBe(1);
    });

    it('should throw error if course not found', async () => {
      mockCourseRepository.findOne.mockResolvedValue(null);

      await expect(courseService.incrementEnrollmentCount(999)).rejects.toThrow(new AppError('Course not found', 404));
    });
  });

  describe('updateRating', () => {
    it('should update course rating', async () => {
      const mockCourse = {
        id: 1,
        rating: 4.0,
      };

      mockCourseRepository.findOne.mockResolvedValue(mockCourse);
      mockCourseRepository.save.mockResolvedValue({ ...mockCourse, rating: 4.5 });

      const result = await courseService.updateRating(1, 4.5);

      expect(mockCourse.rating).toBe(4.5);
      expect(mockCourseRepository.save).toHaveBeenCalledWith(mockCourse);
    });

    it('should throw error if course not found', async () => {
      mockCourseRepository.findOne.mockResolvedValue(null);

      await expect(courseService.updateRating(999, 4.5)).rejects.toThrow(new AppError('Course not found', 404));
    });
  });
});
