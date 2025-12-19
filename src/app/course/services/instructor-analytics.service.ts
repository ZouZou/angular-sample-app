import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CourseAnalytics,
  StudentEnrollmentData,
  QuizPerformanceData,
  StudentDetailData
} from '../models/analytics.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InstructorAnalyticsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/instructor/analytics`;

  /**
   * Get course analytics overview
   */
  getCourseOverview(courseId: number): Observable<CourseAnalytics> {
    return this.http.get<CourseAnalytics>(`${this.apiUrl}/course/${courseId}/overview`);
  }

  /**
   * Get all students enrolled in a course with their progress
   */
  getCourseStudents(courseId: number): Observable<StudentEnrollmentData[]> {
    return this.http.get<StudentEnrollmentData[]>(`${this.apiUrl}/course/${courseId}/students`);
  }

  /**
   * Get quiz performance analytics for a course
   */
  getQuizPerformance(courseId: number): Observable<QuizPerformanceData[]> {
    return this.http.get<QuizPerformanceData[]>(`${this.apiUrl}/course/${courseId}/quiz-performance`);
  }

  /**
   * Get detailed performance for a specific student in a course
   */
  getStudentDetail(studentId: number, courseId: number): Observable<StudentDetailData> {
    return this.http.get<StudentDetailData>(
      `${this.apiUrl}/student/${studentId}/detail?courseId=${courseId}`
    );
  }

  /**
   * Export course data
   */
  exportCourseData(courseId: number, format: 'csv' | 'xlsx'): Observable<StudentEnrollmentData[]> {
    return this.http.get<StudentEnrollmentData[]>(
      `${this.apiUrl}/course/${courseId}/export?format=${format}`
    );
  }
}
