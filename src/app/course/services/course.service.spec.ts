import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CourseService } from './course.service';
import { Course } from '../models/course.interface';
import { environment } from '../../../environments/environment';

describe('CourseService', () => {
  let service: CourseService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/courses`;

  const mockCourse: Course = {
    id: 1,
    title: 'Angular Fundamentals',
    description: 'Learn the basics of Angular',
    instructor: 'John Doe',
    duration: 10,
    price: 49.99,
    category: 'Web Development',
    level: 'Beginner',
    thumbnailUrl: 'https://example.com/thumb.jpg',
    bannerUrl: 'https://example.com/banner.jpg',
    enrollmentCount: 150,
    rating: 4.5,
    createdDate: new Date('2025-01-01'),
    language: 'English',
    requirements: ['Basic HTML', 'Basic JavaScript'],
    learningOutcomes: ['Build Angular apps', 'Understand components'],
    published: true
  };

  const mockCourses: Course[] = [
    mockCourse,
    {
      id: 2,
      title: 'Advanced TypeScript',
      description: 'Master TypeScript',
      instructor: 'Jane Smith',
      duration: 15,
      price: 79.99,
      category: 'Programming',
      level: 'Advanced',
      published: true
    } as Course
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CourseService]
    });
    service = TestBed.inject(CourseService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCourses', () => {
    it('should fetch all courses', (done) => {
      service.getCourses().subscribe(courses => {
        expect(courses.length).toBe(2);
        expect(courses).toEqual(mockCourses);
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockCourses);
    });

    it('should return empty array when no courses exist', (done) => {
      service.getCourses().subscribe(courses => {
        expect(courses.length).toBe(0);
        expect(courses).toEqual([]);
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush([]);
    });

    it('should handle error when fetching courses', (done) => {
      service.getCourses().subscribe(
        () => fail('should have failed'),
        error => {
          expect(error.status).toBe(500);
          done();
        }
      );

      const req = httpMock.expectOne(apiUrl);
      req.flush({ message: 'Server error' }, { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getCourse', () => {
    it('should fetch a single course by ID', (done) => {
      const courseId = 1;

      service.getCourse(courseId).subscribe(course => {
        expect(course).toEqual(mockCourse);
        expect(course.id).toBe(courseId);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/${courseId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCourse);
    });

    it('should handle 404 error when course not found', (done) => {
      const courseId = 999;

      service.getCourse(courseId).subscribe(
        () => fail('should have failed'),
        error => {
          expect(error.status).toBe(404);
          done();
        }
      );

      const req = httpMock.expectOne(`${apiUrl}/${courseId}`);
      req.flush({ message: 'Course not found' }, { status: 404, statusText: 'Not Found' });
    });

    it('should fetch course with minimal data', (done) => {
      const minimalCourse: Course = {
        id: 3,
        title: 'Test Course',
        description: 'Test Description',
        instructor: 'Test Instructor',
        duration: 5,
        price: 29.99,
        category: 'Test',
        level: 'Beginner'
      };

      service.getCourse(3).subscribe(course => {
        expect(course).toEqual(minimalCourse);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/3`);
      req.flush(minimalCourse);
    });
  });

  describe('createCourse', () => {
    it('should create a new course', (done) => {
      const newCourse: Course = {
        title: 'New Course',
        description: 'Brand new course',
        instructor: 'New Instructor',
        duration: 12,
        price: 59.99,
        category: 'Technology',
        level: 'Intermediate'
      };

      const createdCourse: Course = { ...newCourse, id: 10 };

      service.createCourse(newCourse).subscribe(course => {
        expect(course).toEqual(createdCourse);
        expect(course.id).toBe(10);
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newCourse);
      req.flush(createdCourse);
    });

    it('should create course with all optional fields', (done) => {
      const fullCourse: Course = {
        ...mockCourse,
        id: undefined
      };

      const createdCourse: Course = { ...fullCourse, id: 20 };

      service.createCourse(fullCourse).subscribe(course => {
        expect(course.id).toBe(20);
        expect(course.thumbnailUrl).toBe(fullCourse.thumbnailUrl);
        expect(course.requirements).toEqual(fullCourse.requirements);
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush(createdCourse);
    });

    it('should handle validation error when creating course', (done) => {
      const invalidCourse: Course = {
        title: '',
        description: '',
        instructor: '',
        duration: -1,
        price: -10,
        category: '',
        level: 'Beginner'
      };

      service.createCourse(invalidCourse).subscribe(
        () => fail('should have failed'),
        error => {
          expect(error.status).toBe(400);
          done();
        }
      );

      const req = httpMock.expectOne(apiUrl);
      req.flush({ message: 'Validation failed' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('updateCourse', () => {
    it('should update an existing course', (done) => {
      const courseId = 1;
      const updatedData: Course = {
        ...mockCourse,
        title: 'Updated Angular Fundamentals',
        price: 39.99
      };

      service.updateCourse(courseId, updatedData).subscribe(course => {
        expect(course).toEqual(updatedData);
        expect(course.title).toBe('Updated Angular Fundamentals');
        expect(course.price).toBe(39.99);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/${courseId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedData);
      req.flush(updatedData);
    });

    it('should handle 404 error when updating non-existent course', (done) => {
      const courseId = 999;

      service.updateCourse(courseId, mockCourse).subscribe(
        () => fail('should have failed'),
        error => {
          expect(error.status).toBe(404);
          done();
        }
      );

      const req = httpMock.expectOne(`${apiUrl}/${courseId}`);
      req.flush({ message: 'Course not found' }, { status: 404, statusText: 'Not Found' });
    });

    it('should handle unauthorized error when updating course', (done) => {
      const courseId = 1;

      service.updateCourse(courseId, mockCourse).subscribe(
        () => fail('should have failed'),
        error => {
          expect(error.status).toBe(403);
          done();
        }
      );

      const req = httpMock.expectOne(`${apiUrl}/${courseId}`);
      req.flush({ message: 'Not authorized' }, { status: 403, statusText: 'Forbidden' });
    });
  });

  describe('deleteCourse', () => {
    it('should delete a course', (done) => {
      const courseId = 5;

      service.deleteCourse(courseId).subscribe(() => {
        expect(true).toBeTruthy();
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/${courseId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should handle 404 error when deleting non-existent course', (done) => {
      const courseId = 999;

      service.deleteCourse(courseId).subscribe(
        () => fail('should have failed'),
        error => {
          expect(error.status).toBe(404);
          done();
        }
      );

      const req = httpMock.expectOne(`${apiUrl}/${courseId}`);
      req.flush({ message: 'Course not found' }, { status: 404, statusText: 'Not Found' });
    });

    it('should handle forbidden error when user lacks permission', (done) => {
      const courseId = 1;

      service.deleteCourse(courseId).subscribe(
        () => fail('should have failed'),
        error => {
          expect(error.status).toBe(403);
          done();
        }
      );

      const req = httpMock.expectOne(`${apiUrl}/${courseId}`);
      req.flush({ message: 'Not authorized to delete' }, { status: 403, statusText: 'Forbidden' });
    });
  });

  describe('getCoursesByCategory', () => {
    it('should fetch courses by category', (done) => {
      const category = 'Web Development';
      const filteredCourses = mockCourses.filter(c => c.category === category);

      service.getCoursesByCategory(category).subscribe(courses => {
        expect(courses.length).toBe(1);
        expect(courses[0].category).toBe(category);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/category/${category}`);
      expect(req.request.method).toBe('GET');
      req.flush(filteredCourses);
    });

    it('should return empty array when no courses in category', (done) => {
      const category = 'NonExistent';

      service.getCoursesByCategory(category).subscribe(courses => {
        expect(courses.length).toBe(0);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/category/${category}`);
      req.flush([]);
    });

    it('should handle URL encoding for category names with spaces', (done) => {
      const category = 'Web Development';

      service.getCoursesByCategory(category).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/category/${category}`);
      expect(req.request.urlWithParams).toContain('category/Web%20Development');
      req.flush([]);
    });
  });

  describe('getCoursesByLevel', () => {
    it('should fetch courses by level', (done) => {
      const level = 'Beginner';
      const beginnerCourses = mockCourses.filter(c => c.level === level);

      service.getCoursesByLevel(level).subscribe(courses => {
        expect(courses.length).toBe(1);
        expect(courses[0].level).toBe(level);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/level/${level}`);
      expect(req.request.method).toBe('GET');
      req.flush(beginnerCourses);
    });

    it('should fetch intermediate courses', (done) => {
      const level = 'Intermediate';

      service.getCoursesByLevel(level).subscribe(courses => {
        courses.forEach(course => {
          expect(course.level).toBe('Intermediate');
        });
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/level/${level}`);
      req.flush([]);
    });

    it('should fetch advanced courses', (done) => {
      const level = 'Advanced';
      const advancedCourses = mockCourses.filter(c => c.level === level);

      service.getCoursesByLevel(level).subscribe(courses => {
        expect(courses.length).toBe(1);
        expect(courses[0].level).toBe('Advanced');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/level/${level}`);
      req.flush(advancedCourses);
    });

    it('should return empty array when no courses at specified level', (done) => {
      const level = 'Beginner';

      service.getCoursesByLevel(level).subscribe(courses => {
        expect(courses.length).toBe(0);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/level/${level}`);
      req.flush([]);
    });
  });

  describe('API URL Configuration', () => {
    it('should use the correct API URL from environment', () => {
      expect(service['apiUrl']).toBe(`${environment.apiUrl}/courses`);
    });
  });

  describe('Error Handling', () => {
    it('should propagate network errors', (done) => {
      service.getCourses().subscribe(
        () => fail('should have failed'),
        error => {
          expect(error.error).toBeTruthy();
          done();
        }
      );

      const req = httpMock.expectOne(apiUrl);
      req.error(new ProgressEvent('Network error'));
    });

    it('should propagate timeout errors', (done) => {
      service.getCourse(1).subscribe(
        () => fail('should have failed'),
        error => {
          expect(error).toBeTruthy();
          done();
        }
      );

      const req = httpMock.expectOne(`${apiUrl}/1`);
      req.error(new ProgressEvent('timeout'));
    });
  });
});
