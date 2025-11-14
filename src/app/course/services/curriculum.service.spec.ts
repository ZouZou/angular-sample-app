import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CurriculumService } from './curriculum.service';
import { CourseSection, Lesson } from '../models/curriculum.interface';
import { environment } from '../../../environments/environment';

describe('CurriculumService', () => {
  let service: CurriculumService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl;

  const mockLesson: Lesson = {
    id: 1,
    sectionId: 10,
    title: 'Introduction to Angular',
    description: 'Learn Angular basics',
    type: 'video',
    content: 'https://example.com/video.mp4',
    duration: 15,
    order: 1
  };

  const mockSection: CourseSection = {
    id: 10,
    courseId: 5,
    title: 'Getting Started',
    description: 'Introduction section',
    order: 1,
    lessons: [mockLesson]
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CurriculumService]
    });
    service = TestBed.inject(CurriculumService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCourseSections', () => {
    it('should fetch all sections for a course', (done) => {
      const courseId = 5;
      const mockSections = [mockSection, { ...mockSection, id: 11, order: 2 }];

      service.getCourseSections(courseId).subscribe(sections => {
        expect(sections.length).toBe(2);
        expect(sections).toEqual(mockSections);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/courses/${courseId}/sections`);
      expect(req.request.method).toBe('GET');
      req.flush(mockSections);
    });
  });

  describe('getSection', () => {
    it('should fetch a single section by ID', (done) => {
      const sectionId = 10;

      service.getSection(sectionId).subscribe(section => {
        expect(section).toEqual(mockSection);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/sections/${sectionId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockSection);
    });
  });

  describe('createSection', () => {
    it('should create a new section', (done) => {
      const newSection: Partial<CourseSection> = {
        courseId: 5,
        title: 'New Section',
        description: 'Test section',
        order: 1
      };

      service.createSection(newSection).subscribe(section => {
        expect(section).toEqual(mockSection);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/sections`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newSection);
      req.flush(mockSection);
    });
  });

  describe('updateSection', () => {
    it('should update a section', (done) => {
      const sectionId = 10;
      const updates: Partial<CourseSection> = { title: 'Updated Title' };
      const updatedSection = { ...mockSection, ...updates };

      service.updateSection(sectionId, updates).subscribe(section => {
        expect(section.title).toBe('Updated Title');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/sections/${sectionId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updates);
      req.flush(updatedSection);
    });
  });

  describe('deleteSection', () => {
    it('should delete a section', (done) => {
      const sectionId = 10;

      service.deleteSection(sectionId).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/sections/${sectionId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('reorderSections', () => {
    it('should reorder sections', (done) => {
      const courseId = 5;
      const sectionIds = [10, 11, 12];
      const mockResponse = { message: 'Sections reordered successfully' };

      service.reorderSections(courseId, sectionIds).subscribe(response => {
        expect(response.message).toBe('Sections reordered successfully');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/sections/reorder`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ courseId, sectionIds });
      req.flush(mockResponse);
    });
  });

  describe('getLesson', () => {
    it('should fetch a single lesson by ID', (done) => {
      const lessonId = 1;

      service.getLesson(lessonId).subscribe(lesson => {
        expect(lesson).toEqual(mockLesson);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/lessons/${lessonId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockLesson);
    });
  });

  describe('createLesson', () => {
    it('should create a new lesson', (done) => {
      const newLesson: Partial<Lesson> = {
        sectionId: 10,
        title: 'New Lesson',
        type: 'video',
        content: 'https://example.com/new-video.mp4',
        duration: 10,
        order: 2
      };

      service.createLesson(newLesson).subscribe(lesson => {
        expect(lesson).toEqual(mockLesson);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/lessons`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newLesson);
      req.flush(mockLesson);
    });
  });

  describe('updateLesson', () => {
    it('should update a lesson', (done) => {
      const lessonId = 1;
      const updates: Partial<Lesson> = { title: 'Updated Lesson Title' };
      const updatedLesson = { ...mockLesson, ...updates };

      service.updateLesson(lessonId, updates).subscribe(lesson => {
        expect(lesson.title).toBe('Updated Lesson Title');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/lessons/${lessonId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updates);
      req.flush(updatedLesson);
    });
  });

  describe('deleteLesson', () => {
    it('should delete a lesson', (done) => {
      const lessonId = 1;

      service.deleteLesson(lessonId).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/lessons/${lessonId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('reorderLessons', () => {
    it('should reorder lessons', (done) => {
      const sectionId = 10;
      const lessonIds = [1, 2, 3];
      const mockResponse = { message: 'Lessons reordered successfully' };

      service.reorderLessons(sectionId, lessonIds).subscribe(response => {
        expect(response.message).toBe('Lessons reordered successfully');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/lessons/reorder`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ sectionId, lessonIds });
      req.flush(mockResponse);
    });
  });
});
