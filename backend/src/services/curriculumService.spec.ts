import { CurriculumService } from './curriculumService';
import { AppDataSource } from '../config/database';
import { CourseSection } from '../entities/CourseSection';
import { Lesson } from '../entities/Lesson';
import { Course } from '../entities/Course';
import { AppError } from '../middleware/errorHandler';

jest.mock('../config/database');

describe('CurriculumService', () => {
  let curriculumService: CurriculumService;
  let mockSectionRepository: any;
  let mockLessonRepository: any;
  let mockCourseRepository: any;

  beforeEach(() => {
    mockSectionRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    mockLessonRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    mockCourseRepository = {
      findOne: jest.fn(),
    };

    (AppDataSource.getRepository as jest.Mock) = jest.fn((entity) => {
      if (entity === CourseSection) return mockSectionRepository;
      if (entity === Lesson) return mockLessonRepository;
      if (entity === Course) return mockCourseRepository;
      return {};
    });

    curriculumService = new CurriculumService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCourseSections', () => {
    it('should get course sections with sorted lessons', async () => {
      const mockSections = [
        {
          id: 1,
          order: 1,
          lessons: [
            { id: 2, order: 2 },
            { id: 1, order: 1 },
          ],
        },
        {
          id: 2,
          order: 2,
          lessons: [{ id: 3, order: 1 }],
        },
      ];

      mockSectionRepository.find.mockResolvedValue(mockSections);

      const result = await curriculumService.getCourseSections(1);

      expect(mockSectionRepository.find).toHaveBeenCalledWith({
        where: { courseId: 1 },
        relations: ['lessons'],
        order: { order: 'ASC' },
      });
      expect(result[0].lessons[0].order).toBe(1);
      expect(result[0].lessons[1].order).toBe(2);
    });
  });

  describe('getSection', () => {
    it('should get section with sorted lessons', async () => {
      const mockSection = {
        id: 1,
        title: 'Section 1',
        lessons: [
          { id: 2, order: 2 },
          { id: 1, order: 1 },
        ],
      };

      mockSectionRepository.findOne.mockResolvedValue(mockSection);

      const result = await curriculumService.getSection(1);

      expect(mockSectionRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['lessons'],
      });
      expect(result.lessons[0].order).toBe(1);
      expect(result.lessons[1].order).toBe(2);
    });

    it('should throw error if section not found', async () => {
      mockSectionRepository.findOne.mockResolvedValue(null);

      await expect(curriculumService.getSection(999)).rejects.toThrow(
        new AppError('Section not found', 404)
      );
    });
  });

  describe('createSection', () => {
    it('should create a new section', async () => {
      const sectionData = {
        courseId: 1,
        title: 'New Section',
        description: 'Section description',
        order: 1,
      };

      const mockCourse = { id: 1, title: 'Test Course' };
      const mockSection = { id: 1, ...sectionData };

      mockCourseRepository.findOne.mockResolvedValue(mockCourse);
      mockSectionRepository.create.mockReturnValue(mockSection);
      mockSectionRepository.save.mockResolvedValue(mockSection);

      const result = await curriculumService.createSection(sectionData);

      expect(mockCourseRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockSectionRepository.create).toHaveBeenCalledWith(sectionData);
      expect(mockSectionRepository.save).toHaveBeenCalledWith(mockSection);
      expect(result).toEqual(mockSection);
    });

    it('should throw error if course not found', async () => {
      mockCourseRepository.findOne.mockResolvedValue(null);

      await expect(
        curriculumService.createSection({
          courseId: 999,
          title: 'Section',
          order: 1,
        })
      ).rejects.toThrow(new AppError('Course not found', 404));
    });
  });

  describe('updateSection', () => {
    it('should update section successfully', async () => {
      const mockSection = {
        id: 1,
        title: 'Old Title',
        description: 'Old Description',
      };

      const updateData = {
        title: 'New Title',
        description: 'New Description',
      };

      mockSectionRepository.findOne.mockResolvedValue(mockSection);
      mockSectionRepository.save.mockResolvedValue({ ...mockSection, ...updateData });

      const result = await curriculumService.updateSection(1, updateData);

      expect(mockSectionRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockSectionRepository.save).toHaveBeenCalled();
      expect(result.title).toBe('New Title');
    });

    it('should throw error if section not found', async () => {
      mockSectionRepository.findOne.mockResolvedValue(null);

      await expect(
        curriculumService.updateSection(999, { title: 'New Title' })
      ).rejects.toThrow(new AppError('Section not found', 404));
    });
  });

  describe('deleteSection', () => {
    it('should delete section successfully', async () => {
      const mockSection = { id: 1, title: 'Section to Delete' };

      mockSectionRepository.findOne.mockResolvedValue(mockSection);
      mockSectionRepository.remove.mockResolvedValue(mockSection);

      const result = await curriculumService.deleteSection(1);

      expect(mockSectionRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockSectionRepository.remove).toHaveBeenCalledWith(mockSection);
      expect(result).toEqual({ message: 'Section deleted successfully' });
    });

    it('should throw error if section not found', async () => {
      mockSectionRepository.findOne.mockResolvedValue(null);

      await expect(curriculumService.deleteSection(999)).rejects.toThrow(
        new AppError('Section not found', 404)
      );
    });
  });

  describe('reorderSections', () => {
    it('should reorder sections successfully', async () => {
      const mockSections = [
        { id: 1, order: 0 },
        { id: 2, order: 1 },
        { id: 3, order: 2 },
      ];

      mockSectionRepository.find.mockResolvedValue(mockSections);
      mockSectionRepository.save.mockImplementation((section: any) => Promise.resolve(section));

      const result = await curriculumService.reorderSections(1, [3, 1, 2]);

      expect(mockSectionRepository.find).toHaveBeenCalledWith({ where: { courseId: 1 } });
      expect(mockSectionRepository.save).toHaveBeenCalledTimes(3);
      expect(result).toEqual({ message: 'Sections reordered successfully' });
    });

    it('should skip invalid section IDs', async () => {
      const mockSections = [
        { id: 1, order: 0 },
        { id: 2, order: 1 },
      ];

      mockSectionRepository.find.mockResolvedValue(mockSections);
      mockSectionRepository.save.mockImplementation((section: any) => Promise.resolve(section));

      await curriculumService.reorderSections(1, [1, 999, 2]);

      expect(mockSectionRepository.save).toHaveBeenCalledTimes(2);
    });
  });

  describe('getLesson', () => {
    it('should get lesson by id', async () => {
      const mockLesson = {
        id: 1,
        title: 'Test Lesson',
        type: 'video',
      };

      mockLessonRepository.findOne.mockResolvedValue(mockLesson);

      const result = await curriculumService.getLesson(1);

      expect(mockLessonRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockLesson);
    });

    it('should throw error if lesson not found', async () => {
      mockLessonRepository.findOne.mockResolvedValue(null);

      await expect(curriculumService.getLesson(999)).rejects.toThrow(
        new AppError('Lesson not found', 404)
      );
    });
  });

  describe('createLesson', () => {
    it('should create a new lesson', async () => {
      const lessonData = {
        sectionId: 1,
        title: 'New Lesson',
        description: 'Lesson description',
        type: 'video' as const,
        order: 1,
        duration: 600,
        videoUrl: 'https://example.com/video.mp4',
      };

      const mockSection = { id: 1, title: 'Test Section' };
      const mockLesson = { id: 1, ...lessonData };

      mockSectionRepository.findOne.mockResolvedValue(mockSection);
      mockLessonRepository.create.mockReturnValue(mockLesson);
      mockLessonRepository.save.mockResolvedValue(mockLesson);

      const result = await curriculumService.createLesson(lessonData);

      expect(mockSectionRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockLessonRepository.create).toHaveBeenCalledWith(lessonData);
      expect(mockLessonRepository.save).toHaveBeenCalledWith(mockLesson);
      expect(result).toEqual(mockLesson);
    });

    it('should throw error if section not found', async () => {
      mockSectionRepository.findOne.mockResolvedValue(null);

      await expect(
        curriculumService.createLesson({
          sectionId: 999,
          title: 'Lesson',
          type: 'video',
          order: 1,
        })
      ).rejects.toThrow(new AppError('Section not found', 404));
    });
  });

  describe('updateLesson', () => {
    it('should update lesson successfully', async () => {
      const mockLesson = {
        id: 1,
        title: 'Old Title',
        content: 'Old Content',
      };

      const updateData = {
        title: 'New Title',
        content: 'New Content',
      };

      mockLessonRepository.findOne.mockResolvedValue(mockLesson);
      mockLessonRepository.save.mockResolvedValue({ ...mockLesson, ...updateData });

      const result = await curriculumService.updateLesson(1, updateData);

      expect(mockLessonRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockLessonRepository.save).toHaveBeenCalled();
      expect(result.title).toBe('New Title');
    });

    it('should throw error if lesson not found', async () => {
      mockLessonRepository.findOne.mockResolvedValue(null);

      await expect(
        curriculumService.updateLesson(999, { title: 'New Title' })
      ).rejects.toThrow(new AppError('Lesson not found', 404));
    });
  });

  describe('deleteLesson', () => {
    it('should delete lesson successfully', async () => {
      const mockLesson = { id: 1, title: 'Lesson to Delete' };

      mockLessonRepository.findOne.mockResolvedValue(mockLesson);
      mockLessonRepository.remove.mockResolvedValue(mockLesson);

      const result = await curriculumService.deleteLesson(1);

      expect(mockLessonRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockLessonRepository.remove).toHaveBeenCalledWith(mockLesson);
      expect(result).toEqual({ message: 'Lesson deleted successfully' });
    });

    it('should throw error if lesson not found', async () => {
      mockLessonRepository.findOne.mockResolvedValue(null);

      await expect(curriculumService.deleteLesson(999)).rejects.toThrow(
        new AppError('Lesson not found', 404)
      );
    });
  });

  describe('reorderLessons', () => {
    it('should reorder lessons successfully', async () => {
      const mockLessons = [
        { id: 1, order: 0 },
        { id: 2, order: 1 },
        { id: 3, order: 2 },
      ];

      mockLessonRepository.find.mockResolvedValue(mockLessons);
      mockLessonRepository.save.mockImplementation((lesson: any) => Promise.resolve(lesson));

      const result = await curriculumService.reorderLessons(1, [3, 1, 2]);

      expect(mockLessonRepository.find).toHaveBeenCalledWith({ where: { sectionId: 1 } });
      expect(mockLessonRepository.save).toHaveBeenCalledTimes(3);
      expect(result).toEqual({ message: 'Lessons reordered successfully' });
    });

    it('should skip invalid lesson IDs', async () => {
      const mockLessons = [
        { id: 1, order: 0 },
        { id: 2, order: 1 },
      ];

      mockLessonRepository.find.mockResolvedValue(mockLessons);
      mockLessonRepository.save.mockImplementation((lesson: any) => Promise.resolve(lesson));

      await curriculumService.reorderLessons(1, [1, 999, 2]);

      expect(mockLessonRepository.save).toHaveBeenCalledTimes(2);
    });
  });
});
