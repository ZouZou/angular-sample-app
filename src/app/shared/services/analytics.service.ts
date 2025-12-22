import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SystemOverview {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  totalQuizAttempts: number;
  averageQuizScore: number;
}

export interface TimeSeriesData {
  date: string;
  count: number;
}

export interface CourseStats {
  courseId: number;
  courseTitle: string;
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  completionRate: number;
  averageProgress: number;
}

export interface StudentAnalytics {
  totalCoursesEnrolled: number;
  completedCourses: number;
  activeCourses: number;
  totalQuizzesTaken: number;
  averageQuizScore: number;
  totalLessonsCompleted: number;
  learningStreak: number;
  progressOverTime: TimeSeriesData[];
  quizPerformanceOverTime: TimeSeriesData[];
}

export interface QuizDistribution {
  range: string;
  count: number;
}

export interface CompletionRate {
  courseName: string;
  completionRate: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/analytics`;

  // System-wide analytics (Admin only)
  getSystemOverview(): Observable<SystemOverview> {
    return this.http.get<SystemOverview>(`${this.apiUrl}/system/overview`);
  }

  getUserGrowthTrends(days: number = 30): Observable<TimeSeriesData[]> {
    return this.http.get<TimeSeriesData[]>(`${this.apiUrl}/system/user-growth?days=${days}`);
  }

  getEnrollmentTrends(days: number = 30): Observable<TimeSeriesData[]> {
    return this.http.get<TimeSeriesData[]>(`${this.apiUrl}/system/enrollment-trends?days=${days}`);
  }

  getTopCourses(limit: number = 10): Observable<CourseStats[]> {
    return this.http.get<CourseStats[]>(`${this.apiUrl}/system/top-courses?limit=${limit}`);
  }

  getCourseCompletionRates(): Observable<CompletionRate[]> {
    return this.http.get<CompletionRate[]>(`${this.apiUrl}/system/completion-rates`);
  }

  getQuizPerformanceDistribution(): Observable<QuizDistribution[]> {
    return this.http.get<QuizDistribution[]>(`${this.apiUrl}/system/quiz-distribution`);
  }

  // Student personal analytics
  getStudentAnalytics(): Observable<StudentAnalytics> {
    return this.http.get<StudentAnalytics>(`${this.apiUrl}/student/my-analytics`);
  }
}
