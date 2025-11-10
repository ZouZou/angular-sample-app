import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Quiz, QuizAttempt, UserAnswer } from '../models/quiz.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private apiUrl = `${environment.apiUrl}/quizzes`;

  constructor(private http: HttpClient) { }

  /**
   * Get quiz by ID
   */
  getQuiz(id: number): Observable<Quiz> {
    return this.http.get<Quiz>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get all quizzes for a course
   */
  getCourseQuizzes(courseId: number): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(`${this.apiUrl}/course/${courseId}/quizzes`);
  }

  /**
   * Create a new quiz (instructor/admin only)
   */
  createQuiz(quiz: any): Observable<Quiz> {
    return this.http.post<Quiz>(this.apiUrl, quiz);
  }

  /**
   * Start a quiz attempt
   */
  startQuizAttempt(userId: number, enrollmentId: number, quizId: number): Observable<QuizAttempt> {
    return this.http.post<QuizAttempt>(`${this.apiUrl}/attempts/start`, {
      quizId,
      enrollmentId
    });
  }

  /**
   * Submit quiz attempt with answers
   */
  submitQuizAttempt(attemptId: number, answers: Array<{ questionId: number; selectedOptionIds: number[] }>): Observable<QuizAttempt> {
    return this.http.post<QuizAttempt>(`${this.apiUrl}/attempts/${attemptId}/submit`, { answers });
  }

  /**
   * Get user's attempts for a quiz
   */
  getUserQuizAttempts(userId: number, quizId: number): Observable<QuizAttempt[]> {
    return this.http.get<QuizAttempt[]>(`${this.apiUrl}/attempts/quiz/${quizId}/my`);
  }

  /**
   * Get attempt details with answers
   */
  getAttemptDetails(attemptId: number): Observable<QuizAttempt> {
    return this.http.get<QuizAttempt>(`${this.apiUrl}/attempts/${attemptId}`);
  }

  /**
   * Get best attempt for a quiz
   */
  getBestAttempt(userId: number, quizId: number): Observable<QuizAttempt | null> {
    return this.http.get<QuizAttempt>(`${this.apiUrl}/attempts/quiz/${quizId}/best`);
  }

  /**
   * Get a specific quiz attempt (alias for getAttemptDetails)
   */
  getAttempt(attemptId: number): Observable<QuizAttempt> {
    return this.getAttemptDetails(attemptId);
  }

  /**
   * Get all quiz attempts (admin only)
   */
  getAllAttempts(): Observable<QuizAttempt[]> {
    return of([...this.mockAttempts]).pipe(delay(300));
  }

  /**
   * Get all attempts for a specific course (admin only)
   */
  getCourseAttempts(courseId: number): Observable<QuizAttempt[]> {
    const courseQuizIds = this.mockQuizzes
      .filter(q => q.courseId === courseId)
      .map(q => q.id);

    const attempts = this.mockAttempts.filter(a => courseQuizIds.includes(a.quizId));
    return of(attempts).pipe(delay(300));
  }

  /**
   * Get all attempts for a specific user across all quizzes (admin only)
   */
  getUserAllAttempts(userId: number): Observable<QuizAttempt[]> {
    const attempts = this.mockAttempts.filter(a => a.userId === userId);
    return of(attempts).pipe(delay(300));
  }
}
