import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Course } from '../models/course.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = `${environment.apiUrl}/courses`;

  constructor(private http: HttpClient) { }

  /**
   * Get all courses
   */
  getCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(this.apiUrl);
  }

  /**
   * Get a course by ID
   */
  getCourse(id: number): Observable<Course> {
    return this.http.get<Course>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new course
   */
  createCourse(course: Course): Observable<Course> {
    return this.http.post<Course>(this.apiUrl, course);
  }

  /**
   * Update an existing course
   */
  updateCourse(id: number, course: Course): Observable<Course> {
    return this.http.put<Course>(`${this.apiUrl}/${id}`, course);
  }

  /**
   * Delete a course
   */
  deleteCourse(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get courses by category
   */
  getCoursesByCategory(category: string): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/category/${category}`);
  }

  /**
   * Get courses by level
   */
  getCoursesByLevel(level: string): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/level/${level}`);
  }
}
