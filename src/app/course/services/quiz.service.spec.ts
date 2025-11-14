import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { QuizService } from './quiz.service';
import { Quiz, QuizAttempt } from '../models/quiz.interface';
import { environment } from '../../../environments/environment';

describe('QuizService', () => {
  let service: QuizService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/quizzes`;

  const mockQuiz: Quiz = {
    id: 1,
    title: 'Test Quiz',
    description: 'A test quiz',
    courseId: 5,
    passingScore: 70,
    timeLimit: 30,
    questions: []
  };

  const mockAttempt: QuizAttempt = {
    id: 1,
    quizId: 1,
    userId: 10,
    enrollmentId: 5,
    attemptNumber: 1,
    score: 85,
    totalPoints: 100,
    percentage: 85,
    passed: true,
    startedAt: new Date('2025-01-10T10:00:00'),
    completedAt: new Date('2025-01-10T10:25:00'),
    answers: []
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [QuizService]
    });
    service = TestBed.inject(QuizService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getQuiz', () => {
    it('should fetch quiz by ID', (done) => {
      service.getQuiz(1).subscribe(quiz => {
        expect(quiz).toEqual(mockQuiz);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockQuiz);
    });
  });

  describe('getCourseQuizzes', () => {
    it('should fetch all quizzes for a course', (done) => {
      const courseId = 5;
      const mockQuizzes = [mockQuiz, { ...mockQuiz, id: 2 }];

      service.getCourseQuizzes(courseId).subscribe(quizzes => {
        expect(quizzes.length).toBe(2);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/course/${courseId}/quizzes`);
      expect(req.request.method).toBe('GET');
      req.flush(mockQuizzes);
    });
  });

  describe('createQuiz', () => {
    it('should create a new quiz', (done) => {
      const newQuiz = { title: 'New Quiz', courseId: 5 };

      service.createQuiz(newQuiz).subscribe(quiz => {
        expect(quiz).toEqual(mockQuiz);
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newQuiz);
      req.flush(mockQuiz);
    });
  });

  describe('startQuizAttempt', () => {
    it('should start a quiz attempt', (done) => {
      const userId = 10;
      const enrollmentId = 5;
      const quizId = 1;

      service.startQuizAttempt(userId, enrollmentId, quizId).subscribe(attempt => {
        expect(attempt).toEqual(mockAttempt);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/attempts/start`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ quizId, enrollmentId });
      req.flush(mockAttempt);
    });
  });

  describe('submitQuizAttempt', () => {
    it('should submit quiz attempt with answers', (done) => {
      const attemptId = 1;
      const answers = [{ questionId: 1, selectedOptionIds: [1] }];

      service.submitQuizAttempt(attemptId, answers).subscribe(attempt => {
        expect(attempt.score).toBe(85);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/attempts/${attemptId}/submit`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ answers });
      req.flush(mockAttempt);
    });
  });

  describe('getUserQuizAttempts', () => {
    it('should fetch user attempts for a quiz', (done) => {
      const userId = 10;
      const quizId = 1;
      const mockAttempts = [mockAttempt, { ...mockAttempt, id: 2 }];

      service.getUserQuizAttempts(userId, quizId).subscribe(attempts => {
        expect(attempts.length).toBe(2);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/attempts/quiz/${quizId}/my`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAttempts);
    });
  });

  describe('getAttemptDetails', () => {
    it('should fetch attempt details', (done) => {
      const attemptId = 1;

      service.getAttemptDetails(attemptId).subscribe(attempt => {
        expect(attempt).toEqual(mockAttempt);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/attempts/${attemptId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAttempt);
    });
  });

  describe('getBestAttempt', () => {
    it('should fetch best attempt for a quiz', (done) => {
      const userId = 10;
      const quizId = 1;

      service.getBestAttempt(userId, quizId).subscribe(attempt => {
        expect(attempt).toEqual(mockAttempt);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/attempts/quiz/${quizId}/best`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAttempt);
    });
  });

  describe('getAttempt', () => {
    it('should call getAttemptDetails', (done) => {
      const attemptId = 1;

      service.getAttempt(attemptId).subscribe(attempt => {
        expect(attempt).toEqual(mockAttempt);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/attempts/${attemptId}`);
      req.flush(mockAttempt);
    });
  });

  describe('getAllAttempts', () => {
    it('should fetch all attempts (admin only)', (done) => {
      const mockAttempts = [mockAttempt, { ...mockAttempt, id: 2 }];

      service.getAllAttempts().subscribe(attempts => {
        expect(attempts.length).toBe(2);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/quiz-attempts`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAttempts);
    });
  });

  describe('getCourseAttempts', () => {
    it('should fetch all attempts for a course', (done) => {
      const courseId = 5;
      const mockAttempts = [mockAttempt];

      service.getCourseAttempts(courseId).subscribe(attempts => {
        expect(attempts.length).toBe(1);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/quiz-attempts/course/${courseId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAttempts);
    });
  });

  describe('getUserAllAttempts', () => {
    it('should fetch all attempts for a user', (done) => {
      const userId = 10;
      const mockAttempts = [mockAttempt];

      service.getUserAllAttempts(userId).subscribe(attempts => {
        expect(attempts.length).toBe(1);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/quiz-attempts/user/${userId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAttempts);
    });
  });
});
