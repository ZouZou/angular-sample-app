import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EnrollmentService } from './enrollment.service';
import { Enrollment } from '../models/enrollment.interface';
import { environment } from '../../../environments/environment';

describe('EnrollmentService', () => {
  let service: EnrollmentService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/enrollments`;

  const mockEnrollment: Enrollment = {
    id: 1,
    userId: 10,
    courseId: 5,
    enrolledDate: new Date('2025-01-01'),
    status: 'active',
    progress: 45,
    lastAccessedDate: new Date('2025-01-10')
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EnrollmentService]
    });
    service = TestBed.inject(EnrollmentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('enrollInCourse', () => {
    it('should enroll user in a course', (done) => {
      const userId = 10;
      const courseId = 5;

      service.enrollInCourse(userId, courseId).subscribe(enrollment => {
        expect(enrollment).toEqual(mockEnrollment);
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ courseId });
      req.flush(mockEnrollment);
    });

    it('should handle enrollment error when already enrolled', (done) => {
      service.enrollInCourse(10, 5).subscribe(
        () => fail('should have failed'),
        error => {
          expect(error.status).toBe(400);
          done();
        }
      );

      const req = httpMock.expectOne(apiUrl);
      req.flush({ message: 'Already enrolled' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('getEnrollment', () => {
    it('should get enrollment for a specific course', (done) => {
      const userId = 10;
      const courseId = 5;

      service.getEnrollment(userId, courseId).subscribe(enrollment => {
        expect(enrollment).toEqual(mockEnrollment);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/course/${courseId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockEnrollment);
    });

    it('should handle 404 when enrollment not found', (done) => {
      service.getEnrollment(10, 999).subscribe(
        () => fail('should have failed'),
        error => {
          expect(error.status).toBe(404);
          done();
        }
      );

      const req = httpMock.expectOne(`${apiUrl}/course/999`);
      req.flush({ message: 'Enrollment not found' }, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('getEnrollmentById', () => {
    it('should get enrollment by ID', (done) => {
      const enrollmentId = 1;

      service.getEnrollmentById(enrollmentId).subscribe(enrollment => {
        expect(enrollment).toEqual(mockEnrollment);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/${enrollmentId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockEnrollment);
    });
  });

  describe('getUserEnrollments', () => {
    it('should get all user enrollments', (done) => {
      const mockEnrollments: Enrollment[] = [mockEnrollment, { ...mockEnrollment, id: 2, courseId: 10 }];

      service.getUserEnrollments(10).subscribe(enrollments => {
        expect(enrollments.length).toBe(2);
        expect(enrollments).toEqual(mockEnrollments);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/my-courses`);
      expect(req.request.method).toBe('GET');
      req.flush(mockEnrollments);
    });

    it('should return empty array when user has no enrollments', (done) => {
      service.getUserEnrollments(10).subscribe(enrollments => {
        expect(enrollments.length).toBe(0);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/my-courses`);
      req.flush([]);
    });
  });

  describe('getCourseEnrollments', () => {
    it('should get all students enrolled in a course', (done) => {
      const courseId = 5;
      const mockEnrollments: Enrollment[] = [
        mockEnrollment,
        { ...mockEnrollment, id: 2, userId: 11 }
      ];

      service.getCourseEnrollments(courseId).subscribe(enrollments => {
        expect(enrollments.length).toBe(2);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/course/${courseId}/students`);
      expect(req.request.method).toBe('GET');
      req.flush(mockEnrollments);
    });
  });

  describe('updateEnrollmentStatus', () => {
    it('should update enrollment status to completed', (done) => {
      const enrollmentId = 1;
      const updatedEnrollment = { ...mockEnrollment, status: 'completed' };

      service.updateEnrollmentStatus(enrollmentId, 'completed').subscribe(enrollment => {
        expect(enrollment.status).toBe('completed');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/${enrollmentId}/status`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ status: 'completed' });
      req.flush(updatedEnrollment);
    });

    it('should update enrollment status to dropped', (done) => {
      const enrollmentId = 1;
      const updatedEnrollment = { ...mockEnrollment, status: 'dropped' };

      service.updateEnrollmentStatus(enrollmentId, 'dropped').subscribe(enrollment => {
        expect(enrollment.status).toBe('dropped');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/${enrollmentId}/status`);
      expect(req.request.body).toEqual({ status: 'dropped' });
      req.flush(updatedEnrollment);
    });
  });

  describe('calculateProgress', () => {
    it('should calculate progress for an enrollment', (done) => {
      const enrollmentId = 1;
      const mockResponse = { enrollmentId: 1, progress: 75 };

      service.calculateProgress(enrollmentId).subscribe(result => {
        expect(result.progress).toBe(75);
        expect(result.enrollmentId).toBe(enrollmentId);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/${enrollmentId}/calculate-progress`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(mockResponse);
    });
  });

  describe('updateProgress', () => {
    it('should update progress manually', (done) => {
      const enrollmentId = 1;
      const progress = 60;
      const updatedEnrollment = { ...mockEnrollment, progress };

      service.updateProgress(enrollmentId, progress).subscribe(enrollment => {
        expect(enrollment.progress).toBe(progress);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/${enrollmentId}/progress`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ progress });
      req.flush(updatedEnrollment);
    });

    it('should handle invalid progress values', (done) => {
      service.updateProgress(1, 150).subscribe(
        () => fail('should have failed'),
        error => {
          expect(error.status).toBe(400);
          done();
        }
      );

      const req = httpMock.expectOne(`${apiUrl}/1/progress`);
      req.flush({ message: 'Invalid progress value' }, { status: 400, statusText: 'Bad Request' });
    });
  });
});
