import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { HttpService } from '../../http.service';
import { Enrollment } from '../models/enrollment.interface';

@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {
  private apiUrl = '/api/enrollments';

  // Mock enrollments - assuming user ID 1 for demo
  private mockEnrollments: Enrollment[] = [
    {
      id: 1,
      userId: 1,
      courseId: 1,
      enrolledDate: new Date('2024-11-01'),
      status: 'active',
      progress: 25,
      lastAccessedDate: new Date('2024-11-06')
    }
  ];

  private enrollmentIdCounter = 2;

  constructor(private http: HttpService) { }

  /**
   * Enroll a user in a course
   */
  enrollInCourse(userId: number, courseId: number): Observable<Enrollment> {
    // Uncomment for real API:
    // return this.http.postRequest(this.apiUrl, { userId, courseId });

    // Check if already enrolled
    const existing = this.mockEnrollments.find(
      e => e.userId === userId && e.courseId === courseId
    );

    if (existing) {
      throw new Error('Already enrolled in this course');
    }

    const newEnrollment: Enrollment = {
      id: this.enrollmentIdCounter++,
      userId,
      courseId,
      enrolledDate: new Date(),
      status: 'active',
      progress: 0,
      lastAccessedDate: new Date()
    };

    this.mockEnrollments.push(newEnrollment);
    return of(newEnrollment).pipe(delay(300));
  }

  /**
   * Get enrollment for a specific user and course
   */
  getEnrollment(userId: number, courseId: number): Observable<Enrollment | null> {
    // Uncomment for real API:
    // return this.http.getRequest(`${this.apiUrl}/user/${userId}/course/${courseId}`);

    const enrollment = this.mockEnrollments.find(
      e => e.userId === userId && e.courseId === courseId
    );

    return of(enrollment || null).pipe(delay(200));
  }

  /**
   * Get all enrollments for a user
   */
  getUserEnrollments(userId: number): Observable<Enrollment[]> {
    // Uncomment for real API:
    // return this.http.getRequest(`${this.apiUrl}/user/${userId}`);

    const enrollments = this.mockEnrollments.filter(e => e.userId === userId);
    return of(enrollments).pipe(delay(300));
  }

  /**
   * Get all enrollments for a course
   */
  getCourseEnrollments(courseId: number): Observable<Enrollment[]> {
    // Uncomment for real API:
    // return this.http.getRequest(`${this.apiUrl}/course/${courseId}`);

    const enrollments = this.mockEnrollments.filter(e => e.courseId === courseId);
    return of(enrollments).pipe(delay(300));
  }

  /**
   * Update enrollment status
   */
  updateEnrollmentStatus(id: number, status: 'active' | 'completed' | 'dropped'): Observable<Enrollment> {
    // Uncomment for real API:
    // return this.http.putRequest(`${this.apiUrl}/${id}`, { status });

    const enrollment = this.mockEnrollments.find(e => e.id === id);
    if (enrollment) {
      enrollment.status = status;
      if (status === 'completed') {
        enrollment.completedDate = new Date();
        enrollment.progress = 100;
      }
      return of(enrollment).pipe(delay(200));
    }
    throw new Error(`Enrollment with ID ${id} not found`);
  }

  /**
   * Update enrollment progress
   */
  updateProgress(id: number, progress: number): Observable<Enrollment> {
    const enrollment = this.mockEnrollments.find(e => e.id === id);
    if (enrollment) {
      enrollment.progress = Math.min(100, Math.max(0, progress));
      enrollment.lastAccessedDate = new Date();

      if (enrollment.progress >= 100) {
        enrollment.status = 'completed';
        enrollment.completedDate = new Date();
      }

      return of(enrollment).pipe(delay(200));
    }
    throw new Error(`Enrollment with ID ${id} not found`);
  }

  /**
   * Calculate progress based on completed lessons
   */
  calculateProgress(enrollmentId: number, totalLessons: number, completedLessons: number): Observable<number> {
    if (totalLessons === 0) {
      return of(0).pipe(delay(100));
    }

    const progress = Math.round((completedLessons / totalLessons) * 100);
    return this.updateProgress(enrollmentId, progress).pipe(
      map(enrollment => enrollment.progress)
    );
  }

  /**
   * Check if user is enrolled in a course
   */
  isEnrolled(userId: number, courseId: number): Observable<boolean> {
    return this.getEnrollment(userId, courseId).pipe(
      map(enrollment => enrollment !== null)
    );
  }
}
