import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Course } from '../models/course.interface';

// Reason types for recommendations
export type ReasonType =
  | 'popular'
  | 'same_category'
  | 'next_level'
  | 'collaborative'
  | 'skill_match'
  | 'trending'
  | 'instructor';

// Recommendation interface matching backend
export interface Recommendation {
  course: Course;
  score: number;
  reason: string;
  reasonType: ReasonType;
  matchScore: number;
}

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/recommendations`;

  /**
   * Get personalized recommendations for the authenticated user
   * @param limit Maximum number of recommendations to return (default: 10)
   * @param excludeEnrolled Whether to exclude already enrolled courses (default: true)
   * @returns Observable of recommendation array
   */
  getPersonalizedRecommendations(
    limit: number = 10,
    excludeEnrolled: boolean = true
  ): Observable<Recommendation[]> {
    let params = new HttpParams()
      .set('limit', limit.toString())
      .set('excludeEnrolled', excludeEnrolled.toString());

    return this.http.get<Recommendation[]>(`${this.apiUrl}/for-me`, { params });
  }

  /**
   * Get courses similar to a specific course
   * @param courseId The ID of the course to find similar courses for
   * @param limit Maximum number of similar courses to return (default: 5)
   * @returns Observable of recommendation array
   */
  getSimilarCourses(courseId: number, limit: number = 5): Observable<Recommendation[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<Recommendation[]>(`${this.apiUrl}/similar/${courseId}`, { params });
  }

  /**
   * Get suggested next course after completing a course
   * @param courseId The ID of the completed course
   * @returns Observable of single recommendation or null
   */
  getNextCourse(courseId: number): Observable<Recommendation | null> {
    return this.http.get<Recommendation | null>(`${this.apiUrl}/next/${courseId}`);
  }

  /**
   * Get popular/trending courses
   * @param limit Maximum number of popular courses to return (default: 10)
   * @returns Observable of recommendation array
   */
  getPopularCourses(limit: number = 10): Observable<Recommendation[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<Recommendation[]>(`${this.apiUrl}/popular`, { params });
  }

  /**
   * Clear recommendation caches (admin only)
   * @returns Observable of success message
   */
  clearCache(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/cache`);
  }

  /**
   * Get icon name for a reason type
   * @param reasonType The type of recommendation reason
   * @returns Material icon name
   */
  getReasonIcon(reasonType: ReasonType): string {
    const iconMap: Record<ReasonType, string> = {
      popular: 'trending_up',
      same_category: 'category',
      next_level: 'arrow_upward',
      collaborative: 'people',
      skill_match: 'psychology',
      trending: 'whatshot',
      instructor: 'person'
    };
    return iconMap[reasonType] || 'recommend';
  }

  /**
   * Get color class for a reason type
   * @param reasonType The type of recommendation reason
   * @returns CSS color class name
   */
  getReasonColor(reasonType: ReasonType): string {
    const colorMap: Record<ReasonType, string> = {
      popular: 'accent',
      same_category: 'primary',
      next_level: 'warn',
      collaborative: 'success',
      skill_match: 'info',
      trending: 'warn',
      instructor: 'primary'
    };
    return colorMap[reasonType] || 'primary';
  }
}
