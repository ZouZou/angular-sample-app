import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProgressService } from './progress.service';
import { UserProgress } from '../models/progress.interface';
import { environment } from '../../../environments/environment';

describe('ProgressService', () => {
  let service: ProgressService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/progress`;

  const mockProgress: UserProgress = {
    id: 1,
    userId: 1,
    enrollmentId: 5,
    lessonId: 10,
    completed: true,
    completedDate: new Date('2025-01-10'),
    timeSpent: 45,
    notes: 'Great lesson!'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProgressService]
    });
    service = TestBed.inject(ProgressService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUserProgress', () => {
    it('should fetch all progress records for an enrollment', (done) => {
      const enrollmentId = 5;
      const mockProgressList: UserProgress[] = [
        mockProgress,
        { ...mockProgress, id: 2, lessonId: 11, completed: false }
      ];

      service.getUserProgress(enrollmentId).subscribe(progressList => {
        expect(progressList.length).toBe(2);
        expect(progressList).toEqual(mockProgressList);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/enrollment/${enrollmentId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProgressList);
    });
  });

  describe('getLessonProgress', () => {
    it('should fetch progress for a specific lesson', (done) => {
      const userId = 1;
      const lessonId = 10;

      service.getLessonProgress(userId, lessonId).subscribe(progress => {
        expect(progress).toEqual(mockProgress);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/lesson/${lessonId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProgress);
    });
  });

  describe('markLessonComplete', () => {
    it('should mark a lesson as complete', (done) => {
      const userId = 1;
      const enrollmentId = 5;
      const lessonId = 10;

      service.markLessonComplete(userId, enrollmentId, lessonId).subscribe(progress => {
        expect(progress.completed).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/lesson/complete`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ enrollmentId, lessonId });
      req.flush(mockProgress);
    });
  });

  describe('updateLessonNotes', () => {
    it('should update notes for a lesson', (done) => {
      const enrollmentId = 5;
      const lessonId = 10;
      const notes = 'Updated notes';

      service.updateLessonNotes(enrollmentId, lessonId, notes).subscribe(progress => {
        expect(progress.notes).toBe('Great lesson!');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/lesson/notes`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ enrollmentId, lessonId, notes });
      req.flush(mockProgress);
    });
  });

  describe('trackTimeSpent', () => {
    it('should track time spent on a lesson', (done) => {
      const progressId = 1;
      const minutes = 30;

      service.trackTimeSpent(progressId, minutes).subscribe(progress => {
        expect(progress.timeSpent).toBe(45);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/${progressId}/time`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ minutes });
      req.flush(mockProgress);
    });
  });

  describe('getProgressStats', () => {
    it('should fetch progress statistics', (done) => {
      const userId = 1;
      const mockStats = {
        totalCourses: 5,
        completedCourses: 2,
        inProgressCourses: 3,
        totalTimeSpent: 450
      };

      service.getProgressStats(userId).subscribe(stats => {
        expect(stats).toEqual(mockStats);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/stats`);
      expect(req.request.method).toBe('GET');
      req.flush(mockStats);
    });
  });

  describe('getCompletedLessonIds', () => {
    it('should return IDs of completed lessons', (done) => {
      const enrollmentId = 5;
      const mockProgressList: UserProgress[] = [
        { ...mockProgress, lessonId: 10, completed: true },
        { ...mockProgress, id: 2, lessonId: 11, completed: false },
        { ...mockProgress, id: 3, lessonId: 12, completed: true }
      ];

      service.getCompletedLessonIds(enrollmentId).subscribe(lessonIds => {
        expect(lessonIds.length).toBe(2);
        expect(lessonIds).toEqual([10, 12]);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/enrollment/${enrollmentId}`);
      req.flush(mockProgressList);
    });

    it('should return empty array when no lessons are completed', (done) => {
      const enrollmentId = 5;
      const mockProgressList: UserProgress[] = [
        { ...mockProgress, lessonId: 10, completed: false },
        { ...mockProgress, id: 2, lessonId: 11, completed: false }
      ];

      service.getCompletedLessonIds(enrollmentId).subscribe(lessonIds => {
        expect(lessonIds.length).toBe(0);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/enrollment/${enrollmentId}`);
      req.flush(mockProgressList);
    });
  });

  describe('isLessonCompleted', () => {
    it('should return true when lesson is completed', (done) => {
      const userId = 1;
      const enrollmentId = 5;
      const lessonId = 10;

      service.isLessonCompleted(userId, enrollmentId, lessonId).subscribe(isCompleted => {
        expect(isCompleted).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/lesson/${lessonId}`);
      req.flush(mockProgress);
    });

    it('should return false when lesson is not completed', (done) => {
      const userId = 1;
      const enrollmentId = 5;
      const lessonId = 11;
      const incompleteProgress = { ...mockProgress, completed: false };

      service.isLessonCompleted(userId, enrollmentId, lessonId).subscribe(isCompleted => {
        expect(isCompleted).toBe(false);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/lesson/${lessonId}`);
      req.flush(incompleteProgress);
    });

    it('should return false on error', (done) => {
      const userId = 1;
      const enrollmentId = 5;
      const lessonId = 999;

      service.isLessonCompleted(userId, enrollmentId, lessonId).subscribe(isCompleted => {
        expect(isCompleted).toBe(false);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/lesson/${lessonId}`);
      req.flush({ message: 'Not found' }, { status: 404, statusText: 'Not Found' });
    });
  });
});
