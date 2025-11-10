import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CourseSection, Lesson } from '../models/curriculum.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CurriculumService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Get all sections for a course (with lessons)
   */
  getCourseSections(courseId: number): Observable<CourseSection[]> {
    return this.http.get<CourseSection[]>(`${this.apiUrl}/courses/${courseId}/sections`);
  }

  /**
   * Get a single section by ID
   */
  getSection(id: number): Observable<CourseSection> {
    return this.http.get<CourseSection>(`${this.apiUrl}/sections/${id}`);
  }

  /**
   * Create a new section
   */
  createSection(section: Partial<CourseSection>): Observable<CourseSection> {
    return this.http.post<CourseSection>(`${this.apiUrl}/sections`, section);
  }

  /**
   * Update a section
   */
  updateSection(id: number, section: Partial<CourseSection>): Observable<CourseSection> {
    return this.http.put<CourseSection>(`${this.apiUrl}/sections/${id}`, section);
  }

  /**
   * Delete a section
   */
  deleteSection(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/sections/${id}`);
  }

  /**
   * Reorder sections
   */
  reorderSections(courseId: number, sectionIds: number[]): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/sections/reorder`, { courseId, sectionIds });
  }

  /**
   * Get a single lesson by ID
   */
  getLesson(id: number): Observable<Lesson> {
    return this.http.get<Lesson>(`${this.apiUrl}/lessons/${id}`);
  }

  /**
   * Create a new lesson
   */
  createLesson(lesson: Partial<Lesson>): Observable<Lesson> {
    return this.http.post<Lesson>(`${this.apiUrl}/lessons`, lesson);
  }

  /**
   * Update a lesson
   */
  updateLesson(id: number, lesson: Partial<Lesson>): Observable<Lesson> {
    return this.http.put<Lesson>(`${this.apiUrl}/lessons/${id}`, lesson);
  }

  /**
   * Delete a lesson
   */
  deleteLesson(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/lessons/${id}`);
  }

  /**
   * Reorder lessons
   */
  reorderLessons(sectionId: number, lessonIds: number[]): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/lessons/reorder`, { sectionId, lessonIds });
  }
}
