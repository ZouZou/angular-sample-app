import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { UserProgress } from '../models/progress.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProgressService {
  private apiUrl = `${environment.apiUrl}/progress`;

  constructor(private http: HttpClient) { }

  /**
   * Get all progress records for an enrollment
   */
  getUserProgress(enrollmentId: number): Observable<UserProgress[]> {
    return this.http.get<UserProgress[]>(`${this.apiUrl}/enrollment/${enrollmentId}`);
  }

  /**
   * Get progress for a specific lesson
   */
  getLessonProgress(userId: number, lessonId: number): Observable<UserProgress> {
    return this.http.get<UserProgress>(`${this.apiUrl}/lesson/${lessonId}`);
  }

  /**
   * Mark a lesson as complete
   */
  markLessonComplete(userId: number, enrollmentId: number, lessonId: number): Observable<UserProgress> {
    return this.http.post<UserProgress>(`${this.apiUrl}/lesson/complete`, {
      enrollmentId,
      lessonId
    });
  }

  /**
   * Update notes for a lesson
   */
  updateLessonNotes(enrollmentId: number, lessonId: number, notes: string): Observable<UserProgress> {
    return this.http.post<UserProgress>(`${this.apiUrl}/lesson/notes`, {
      enrollmentId,
      lessonId,
      notes
    });
  }

  /**
   * Track time spent on a lesson
   */
  trackTimeSpent(progressId: number, minutes: number): Observable<UserProgress> {
    return this.http.put<UserProgress>(`${this.apiUrl}/${progressId}/time`, { minutes });
  }

  /**
   * Get progress statistics for the current user
   */
  getProgressStats(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`);
  }

  /**
   * Get IDs of completed lessons for an enrollment
   */
  getCompletedLessonIds(enrollmentId: number): Observable<number[]> {
    return this.http.get<UserProgress[]>(`${this.apiUrl}/enrollment/${enrollmentId}`)
      .pipe(
        map(progressList =>
          progressList
            .filter(p => p.completed)
            .map(p => p.lessonId)
        )
      );
  }

  /**
   * Check if a specific lesson is completed
   */
  isLessonCompleted(userId: number, enrollmentId: number, lessonId: number): Observable<boolean> {
    return this.http.get<UserProgress>(`${this.apiUrl}/lesson/${lessonId}`)
      .pipe(
        map(progress => progress?.completed || false),
        catchError(() => of(false))
      );
  }
}
