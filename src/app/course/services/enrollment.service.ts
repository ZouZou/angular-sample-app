import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Enrollment } from '../models/enrollment.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {
  private apiUrl = `${environment.apiUrl}/enrollments`;

  constructor(private http: HttpClient) { }

  /**
   * Enroll in a course
   */
  enrollInCourse(userId: number, courseId: number): Observable<Enrollment> {
    return this.http.post<Enrollment>(this.apiUrl, { courseId });
  }

  /**
   * Get enrollment for a specific course
   */
  getEnrollment(userId: number, courseId: number): Observable<Enrollment> {
    return this.http.get<Enrollment>(`${this.apiUrl}/course/${courseId}`);
  }

  /**
   * Get enrollment by ID
   */
  getEnrollmentById(id: number): Observable<Enrollment> {
    return this.http.get<Enrollment>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get all enrollments for the current user
   */
  getUserEnrollments(userId: number): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(`${this.apiUrl}/my-courses`);
  }

  /**
   * Get all students enrolled in a course (admin/instructor only)
   */
  getCourseEnrollments(courseId: number): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(`${this.apiUrl}/course/${courseId}/students`);
  }

  /**
   * Update enrollment status
   */
  updateEnrollmentStatus(id: number, status: 'active' | 'completed' | 'dropped'): Observable<Enrollment> {
    return this.http.put<Enrollment>(`${this.apiUrl}/${id}/status`, { status });
  }

  /**
   * Calculate and update progress for an enrollment
   */
  calculateProgress(id: number): Observable<{ enrollmentId: number; progress: number }> {
    return this.http.post<{ enrollmentId: number; progress: number }>(`${this.apiUrl}/${id}/calculate-progress`, {});
  }

  /**
   * Update progress for an enrollment manually
   */
  updateProgress(id: number, progress: number): Observable<Enrollment> {
    return this.http.put<Enrollment>(`${this.apiUrl}/${id}/progress`, { progress });
  }
}
