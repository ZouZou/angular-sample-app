import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { HttpService } from '../../http.service';
import { Course } from '../models/course.interface';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = '/api/courses';

  // Mock data for demonstration purposes
  private mockCourses: Course[] = [
    {
      id: 1,
      title: 'Complete Angular Developer Course',
      description: 'Master Angular from beginner to advanced. Build real-world applications with Angular 20, TypeScript, RxJS, and Material Design. Learn components, services, routing, forms, HTTP, state management, and deployment.',
      instructor: 'Sarah Anderson',
      duration: 40,
      price: 149.99,
      category: 'Web Development',
      level: 'Beginner',
      thumbnailUrl: 'https://source.unsplash.com/400x300/?angular,programming',
      bannerUrl: 'https://source.unsplash.com/1200x400/?angular,code',
      enrollmentCount: 3247,
      rating: 4.8,
      createdDate: new Date('2024-01-15'),
      language: 'English',
      requirements: [
        'Basic HTML, CSS, and JavaScript knowledge',
        'Understanding of TypeScript basics',
        'Node.js and npm installed'
      ],
      learningOutcomes: [
        'Build complete Angular applications from scratch',
        'Master Angular components, services, and dependency injection',
        'Implement routing and navigation',
        'Work with reactive forms and validation',
        'Use RxJS observables and operators',
        'Consume REST APIs with HttpClient',
        'Apply Angular Material Design',
        'Deploy Angular applications'
      ],
      published: true
    },
    {
      id: 2,
      title: 'Advanced TypeScript',
      description: 'Master TypeScript with advanced concepts like generics, decorators, and type guards. Build type-safe applications.',
      instructor: 'Jane Smith',
      duration: 15,
      price: 129.99,
      category: 'Programming',
      level: 'Advanced',
      thumbnailUrl: 'https://source.unsplash.com/400x300/?typescript,code',
      bannerUrl: 'https://source.unsplash.com/1200x400/?typescript,programming',
      enrollmentCount: 856,
      rating: 4.8,
      createdDate: new Date('2024-02-20'),
      language: 'English',
      requirements: [
        'Intermediate TypeScript knowledge',
        'Experience with JavaScript ES6+'
      ],
      learningOutcomes: [
        'Master advanced TypeScript features',
        'Write type-safe code',
        'Use generics effectively'
      ],
      published: true
    },
    {
      id: 3,
      title: 'RxJS in Practice',
      description: 'Learn reactive programming with RxJS operators and patterns in real-world scenarios.',
      instructor: 'Mike Johnson',
      duration: 12,
      price: 79.99,
      category: 'Web Development',
      level: 'Intermediate',
      thumbnailUrl: 'https://source.unsplash.com/400x300/?reactive,programming',
      bannerUrl: 'https://source.unsplash.com/1200x400/?streams,data',
      enrollmentCount: 642,
      rating: 4.6,
      createdDate: new Date('2024-03-10'),
      language: 'English',
      requirements: [
        'Basic Angular knowledge',
        'Understanding of asynchronous programming'
      ],
      learningOutcomes: [
        'Master RxJS operators',
        'Build reactive applications',
        'Handle async data streams'
      ],
      published: true
    }
  ];

  constructor(private http: HttpService) { }

  /**
   * Get all courses
   * For demonstration, this returns mock data. In production, it would call the API.
   */
  getCourses(): Observable<Course[]> {
    // Uncomment the line below to use real API:
    // return this.http.getRequest(this.apiUrl);

    // Using mock data with delay to simulate API call
    return of(this.mockCourses).pipe(delay(300));
  }

  /**
   * Get a course by ID
   */
  getCourse(id: number): Observable<Course> {
    // Uncomment the line below to use real API:
    // return this.http.getRequest(`${this.apiUrl}/${id}`);

    // Using mock data
    const course = this.mockCourses.find(c => c.id === id);
    if (course) {
      return of(course).pipe(delay(200));
    }
    throw new Error(`Course with ID ${id} not found`);
  }

  /**
   * Create a new course
   */
  createCourse(course: Course): Observable<Course> {
    // Uncomment the line below to use real API:
    // return this.http.postRequest(this.apiUrl, course);

    // Using mock data
    const newCourse: Course = {
      ...course,
      id: Math.max(...this.mockCourses.map(c => c.id || 0)) + 1,
      enrollmentCount: 0,
      rating: 0,
      createdDate: new Date()
    };
    this.mockCourses.push(newCourse);
    return of(newCourse).pipe(delay(300));
  }

  /**
   * Update an existing course
   */
  updateCourse(id: number, course: Course): Observable<Course> {
    // Uncomment the line below to use real API:
    // return this.http.updateRequest(`${this.apiUrl}/${id}`, course);

    // Using mock data
    const index = this.mockCourses.findIndex(c => c.id === id);
    if (index !== -1) {
      this.mockCourses[index] = { ...course, id };
      return of(this.mockCourses[index]).pipe(delay(300));
    }
    throw new Error(`Course with ID ${id} not found`);
  }

  /**
   * Delete a course
   */
  deleteCourse(id: number): Observable<void> {
    // Uncomment the line below to use real API:
    // return this.http.deleteRequest(`${this.apiUrl}/${id}`);

    // Using mock data
    const index = this.mockCourses.findIndex(c => c.id === id);
    if (index !== -1) {
      this.mockCourses.splice(index, 1);
      return of(void 0).pipe(delay(200));
    }
    throw new Error(`Course with ID ${id} not found`);
  }

  /**
   * Get courses by category
   */
  getCoursesByCategory(category: string): Observable<Course[]> {
    return this.getCourses().pipe(
      map(courses => courses.filter(c => c.category === category))
    );
  }

  /**
   * Get courses by level
   */
  getCoursesByLevel(level: string): Observable<Course[]> {
    return this.getCourses().pipe(
      map(courses => courses.filter(c => c.level === level))
    );
  }
}
