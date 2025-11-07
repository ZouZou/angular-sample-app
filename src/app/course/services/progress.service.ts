import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { HttpService } from '../../http.service';
import { UserProgress } from '../models/progress.interface';

@Injectable({
  providedIn: 'root'
})
export class ProgressService {
  private apiUrl = '/api/progress';

  // Mock progress data
  private mockProgress: UserProgress[] = [];
  private progressIdCounter = 1;

  constructor(private http: HttpService) { }

  /**
   * Get all progress records for an enrollment
   */
  getUserProgress(enrollmentId: number): Observable<UserProgress[]> {
    // Uncomment for real API:
    // return this.http.getRequest(`${this.apiUrl}/enrollment/${enrollmentId}`);

    const progress = this.mockProgress.filter(p => p.enrollmentId === enrollmentId);
    return of(progress).pipe(delay(200));
  }

  /**
   * Mark a lesson as complete
   */
  markLessonComplete(userId: number, enrollmentId: number, lessonId: number): Observable<UserProgress> {
    // Uncomment for real API:
    // return this.http.postRequest(this.apiUrl, { userId, enrollmentId, lessonId, completed: true });

    // Check if progress already exists
    let progress = this.mockProgress.find(
      p => p.userId === userId && p.enrollmentId === enrollmentId && p.lessonId === lessonId
    );

    if (progress) {
      // Update existing progress
      progress.completed = true;
      progress.completedDate = new Date();
    } else {
      // Create new progress record
      progress = {
        id: this.progressIdCounter++,
        userId,
        enrollmentId,
        lessonId,
        completed: true,
        completedDate: new Date(),
        timeSpent: 0
      };
      this.mockProgress.push(progress);
    }

    return of(progress).pipe(delay(200));
  }

  /**
   * Get progress for a specific lesson
   */
  getLessonProgress(userId: number, lessonId: number): Observable<UserProgress | null> {
    // Uncomment for real API:
    // return this.http.getRequest(`${this.apiUrl}/user/${userId}/lesson/${lessonId}`);

    const progress = this.mockProgress.find(
      p => p.userId === userId && p.lessonId === lessonId
    );

    return of(progress || null).pipe(delay(200));
  }

  /**
   * Track time spent on a lesson
   */
  trackTimeSpent(progressId: number, minutes: number): Observable<void> {
    // Uncomment for real API:
    // return this.http.putRequest(`${this.apiUrl}/${progressId}/time`, { minutes });

    const progress = this.mockProgress.find(p => p.id === progressId);
    if (progress) {
      progress.timeSpent = (progress.timeSpent || 0) + minutes;
    }

    return of(void 0).pipe(delay(100));
  }

  /**
   * Get completion percentage for an enrollment
   */
  getCompletionPercentage(enrollmentId: number, totalLessons: number): Observable<number> {
    return this.getUserProgress(enrollmentId).pipe(
      map(progressRecords => {
        if (totalLessons === 0) return 0;
        const completedCount = progressRecords.filter(p => p.completed).length;
        return Math.round((completedCount / totalLessons) * 100);
      })
    );
  }

  /**
   * Check if a lesson is completed
   */
  isLessonCompleted(userId: number, enrollmentId: number, lessonId: number): Observable<boolean> {
    const progress = this.mockProgress.find(
      p => p.userId === userId && p.enrollmentId === enrollmentId && p.lessonId === lessonId
    );

    return of(progress ? progress.completed : false).pipe(delay(100));
  }

  /**
   * Get completed lesson IDs for an enrollment
   */
  getCompletedLessonIds(enrollmentId: number): Observable<number[]> {
    return this.getUserProgress(enrollmentId).pipe(
      map(progressRecords =>
        progressRecords
          .filter(p => p.completed)
          .map(p => p.lessonId)
      )
    );
  }

  /**
   * Reset progress for a lesson (mark as incomplete)
   */
  resetLessonProgress(userId: number, enrollmentId: number, lessonId: number): Observable<void> {
    const progress = this.mockProgress.find(
      p => p.userId === userId && p.enrollmentId === enrollmentId && p.lessonId === lessonId
    );

    if (progress) {
      progress.completed = false;
      progress.completedDate = undefined;
    }

    return of(void 0).pipe(delay(200));
  }
}
