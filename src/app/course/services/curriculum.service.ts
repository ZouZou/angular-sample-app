import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { HttpService } from '../../http.service';
import { CourseSection, Lesson } from '../models/curriculum.interface';

@Injectable({
  providedIn: 'root'
})
export class CurriculumService {
  private apiUrl = '/api';

  // Mock curriculum data for the Angular course (id: 1)
  private mockSections: CourseSection[] = [
    {
      id: 1,
      courseId: 1,
      title: 'Getting Started with Angular',
      description: 'Learn the fundamentals and set up your development environment',
      order: 1,
      lessons: [
        {
          id: 1,
          sectionId: 1,
          title: 'Introduction to Angular',
          description: 'Overview of Angular framework and its key features',
          order: 1,
          type: 'video',
          duration: 15,
          videoUrl: 'https://www.youtube.com/embed/3qBXWUpoPHo',
          content: 'Welcome to the Complete Angular Developer Course!',
          completed: false
        },
        {
          id: 2,
          sectionId: 1,
          title: 'Setting Up Development Environment',
          description: 'Install Node.js, npm, and Angular CLI',
          order: 2,
          type: 'video',
          duration: 20,
          videoUrl: 'https://www.youtube.com/embed/AAu8bjj6-UI',
          content: 'Learn how to set up your development environment',
          completed: false
        },
        {
          id: 3,
          sectionId: 1,
          title: 'Creating Your First Angular App',
          description: 'Use Angular CLI to create a new project',
          order: 3,
          type: 'text',
          duration: 25,
          content: `# Creating Your First Angular App

In this lesson, we'll create our first Angular application using the Angular CLI.

## Prerequisites
- Node.js installed (v18 or higher)
- npm package manager
- Angular CLI installed globally

## Steps

### 1. Install Angular CLI
\`\`\`bash
npm install -g @angular/cli
\`\`\`

### 2. Create New Project
\`\`\`bash
ng new my-first-app
\`\`\`

### 3. Navigate to Project
\`\`\`bash
cd my-first-app
\`\`\`

### 4. Run Development Server
\`\`\`bash
ng serve
\`\`\`

### 5. Open in Browser
Navigate to http://localhost:4200

## Project Structure
- **src/app**: Application source code
- **src/assets**: Static assets
- **angular.json**: Angular configuration
- **package.json**: Dependencies

Congratulations! You've created your first Angular app!`,
          completed: false
        },
        {
          id: 4,
          sectionId: 1,
          title: 'Quiz: Getting Started',
          description: 'Test your knowledge of Angular basics',
          order: 4,
          type: 'quiz',
          duration: 10,
          quizId: 1,
          completed: false
        }
      ]
    },
    {
      id: 2,
      courseId: 1,
      title: 'Angular Components',
      description: 'Master the building blocks of Angular applications',
      order: 2,
      lessons: [
        {
          id: 5,
          sectionId: 2,
          title: 'Understanding Components',
          description: 'Learn what components are and why they matter',
          order: 1,
          type: 'video',
          duration: 18,
          videoUrl: 'https://www.youtube.com/embed/23o0evRtrFI',
          content: 'Components are the fundamental building blocks of Angular applications',
          completed: false
        },
        {
          id: 6,
          sectionId: 2,
          title: 'Component Decorators and Metadata',
          description: 'Deep dive into @Component decorator',
          order: 2,
          type: 'text',
          duration: 20,
          content: `# Component Decorators and Metadata

Angular components use decorators to define metadata.

## @Component Decorator

\`\`\`typescript
@Component({
  selector: 'app-my-component',
  templateUrl: './my-component.component.html',
  styleUrls: ['./my-component.component.css'],
  standalone: false
})
export class MyComponentComponent {
  // Component logic here
}
\`\`\`

## Key Properties
- **selector**: CSS selector for the component
- **templateUrl**: Path to HTML template
- **styleUrls**: Array of CSS files
- **standalone**: Whether component is standalone

## Creating a Component
\`\`\`bash
ng generate component my-component
\`\`\`

Or shorthand:
\`\`\`bash
ng g c my-component
\`\`\``,
          completed: false
        },
        {
          id: 7,
          sectionId: 2,
          title: 'Component Lifecycle Hooks',
          description: 'Master lifecycle methods like ngOnInit, ngOnDestroy',
          order: 3,
          type: 'video',
          duration: 22,
          videoUrl: 'https://www.youtube.com/embed/bY8O4yY57Pc',
          content: 'Learn about Angular lifecycle hooks',
          completed: false
        },
        {
          id: 8,
          sectionId: 2,
          title: 'Data Binding Techniques',
          description: 'Interpolation, property binding, event binding, and two-way binding',
          order: 4,
          type: 'video',
          duration: 25,
          videoUrl: 'https://www.youtube.com/embed/G0bBLvWXBvc',
          content: 'Master all types of data binding in Angular',
          completed: false
        },
        {
          id: 9,
          sectionId: 2,
          title: 'Quiz: Components',
          description: 'Test your understanding of Angular components',
          order: 5,
          type: 'quiz',
          duration: 15,
          quizId: 2,
          completed: false
        }
      ]
    },
    {
      id: 3,
      courseId: 1,
      title: 'Services and Dependency Injection',
      description: 'Learn to create reusable services and understand DI',
      order: 3,
      lessons: [
        {
          id: 10,
          sectionId: 3,
          title: 'Introduction to Services',
          description: 'What are services and why use them',
          order: 1,
          type: 'video',
          duration: 16,
          videoUrl: 'https://www.youtube.com/embed/BVTBFdN1Ni0',
          content: 'Services provide reusable functionality across your application',
          completed: false
        },
        {
          id: 11,
          sectionId: 3,
          title: 'Creating and Using Services',
          description: 'Build your first Angular service',
          order: 2,
          type: 'text',
          duration: 20,
          content: `# Creating and Using Services

Services are TypeScript classes that provide specific functionality.

## Creating a Service

\`\`\`bash
ng generate service data
\`\`\`

## Service Example

\`\`\`typescript
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private data: string[] = [];

  constructor() { }

  getData(): string[] {
    return this.data;
  }

  addData(item: string): void {
    this.data.push(item);
  }
}
\`\`\`

## Using a Service

\`\`\`typescript
export class MyComponent {
  constructor(private dataService: DataService) { }

  ngOnInit() {
    const data = this.dataService.getData();
  }
}
\`\`\`

## Benefits
- Code reusability
- Separation of concerns
- Easier testing
- Centralized logic`,
          completed: false
        },
        {
          id: 12,
          sectionId: 3,
          title: 'Dependency Injection Deep Dive',
          description: 'Understand Angular\'s DI system',
          order: 3,
          type: 'video',
          duration: 24,
          videoUrl: 'https://www.youtube.com/embed/G8zXugcYd7o',
          content: 'Master dependency injection in Angular',
          completed: false
        },
        {
          id: 13,
          sectionId: 3,
          title: 'Quiz: Services and DI',
          description: 'Test your knowledge of services',
          order: 4,
          type: 'quiz',
          duration: 12,
          quizId: 3,
          completed: false
        }
      ]
    },
    {
      id: 4,
      courseId: 1,
      title: 'Routing and Navigation',
      description: 'Build multi-page applications with Angular Router',
      order: 4,
      lessons: [
        {
          id: 14,
          sectionId: 4,
          title: 'Setting Up Routing',
          description: 'Configure routes in your application',
          order: 1,
          type: 'video',
          duration: 20,
          videoUrl: 'https://www.youtube.com/embed/Nehk4tBxD4o',
          content: 'Learn to set up routing in Angular',
          completed: false
        },
        {
          id: 15,
          sectionId: 4,
          title: 'Route Parameters and Query Params',
          description: 'Pass data through routes',
          order: 2,
          type: 'video',
          duration: 18,
          videoUrl: 'https://www.youtube.com/embed/atat_7i7iZI',
          content: 'Learn about route and query parameters',
          completed: false
        },
        {
          id: 16,
          sectionId: 4,
          title: 'Lazy Loading Modules',
          description: 'Optimize your app with lazy loading',
          order: 3,
          type: 'text',
          duration: 22,
          content: `# Lazy Loading Modules

Lazy loading helps optimize your application by loading modules only when needed.

## Benefits
- Faster initial load time
- Reduced bundle size
- Better performance

## Implementation

### 1. Create a Feature Module
\`\`\`bash
ng generate module feature --route feature --module app.module
\`\`\`

### 2. Configure Lazy Loading
\`\`\`typescript
const routes: Routes = [
  {
    path: 'feature',
    loadChildren: () => import('./feature/feature.module')
      .then(m => m.FeatureModule)
  }
];
\`\`\`

### 3. Navigate to Lazy Module
\`\`\`typescript
this.router.navigate(['/feature']);
\`\`\`

The module will only be loaded when the route is accessed!`,
          completed: false
        }
      ]
    },
    {
      id: 5,
      courseId: 1,
      title: 'Working with Forms',
      description: 'Build reactive and template-driven forms',
      order: 5,
      lessons: [
        {
          id: 17,
          sectionId: 5,
          title: 'Template-Driven Forms',
          description: 'Build forms using templates',
          order: 1,
          type: 'video',
          duration: 20,
          videoUrl: 'https://www.youtube.com/embed/JeeUY6WaXiA',
          content: 'Learn template-driven forms',
          completed: false
        },
        {
          id: 18,
          sectionId: 5,
          title: 'Reactive Forms',
          description: 'Build forms programmatically',
          order: 2,
          type: 'video',
          duration: 25,
          videoUrl: 'https://www.youtube.com/embed/pMhP7r1E1OU',
          content: 'Master reactive forms in Angular',
          completed: false
        },
        {
          id: 19,
          sectionId: 5,
          title: 'Form Validation',
          description: 'Add validation to your forms',
          order: 3,
          type: 'video',
          duration: 22,
          videoUrl: 'https://www.youtube.com/embed/LUCIVGVzNwE',
          content: 'Learn form validation techniques',
          completed: false
        },
        {
          id: 20,
          sectionId: 5,
          title: 'Quiz: Forms',
          description: 'Test your forms knowledge',
          order: 4,
          type: 'quiz',
          duration: 15,
          quizId: 4,
          completed: false
        }
      ]
    }
  ];

  constructor(private http: HttpService) { }

  /**
   * Get all sections for a course
   */
  getCourseSections(courseId: number): Observable<CourseSection[]> {
    // Uncomment for real API:
    // return this.http.getRequest(`${this.apiUrl}/courses/${courseId}/sections`);

    const sections = this.mockSections.filter(s => s.courseId === courseId);
    return of(sections).pipe(delay(300));
  }

  /**
   * Create a new section
   */
  createSection(section: CourseSection): Observable<CourseSection> {
    // Uncomment for real API:
    // return this.http.postRequest(`${this.apiUrl}/sections`, section);

    const newSection: CourseSection = {
      ...section,
      id: Math.max(...this.mockSections.map(s => s.id || 0)) + 1,
      lessons: []
    };
    this.mockSections.push(newSection);
    return of(newSection).pipe(delay(300));
  }

  /**
   * Update a section
   */
  updateSection(id: number, section: CourseSection): Observable<CourseSection> {
    // Uncomment for real API:
    // return this.http.updateRequest(`${this.apiUrl}/sections/${id}`, section);

    const index = this.mockSections.findIndex(s => s.id === id);
    if (index !== -1) {
      this.mockSections[index] = { ...section, id };
      return of(this.mockSections[index]).pipe(delay(300));
    }
    throw new Error(`Section with ID ${id} not found`);
  }

  /**
   * Delete a section
   */
  deleteSection(id: number): Observable<void> {
    // Uncomment for real API:
    // return this.http.deleteRequest(`${this.apiUrl}/sections/${id}`);

    const index = this.mockSections.findIndex(s => s.id === id);
    if (index !== -1) {
      this.mockSections.splice(index, 1);
      return of(void 0).pipe(delay(200));
    }
    throw new Error(`Section with ID ${id} not found`);
  }

  /**
   * Create a new lesson
   */
  createLesson(lesson: Lesson): Observable<Lesson> {
    // Uncomment for real API:
    // return this.http.postRequest(`${this.apiUrl}/lessons`, lesson);

    const section = this.mockSections.find(s => s.id === lesson.sectionId);
    if (section) {
      const maxLessonId = Math.max(
        ...this.mockSections.flatMap(s => s.lessons).map(l => l.id || 0)
      );
      const newLesson: Lesson = {
        ...lesson,
        id: maxLessonId + 1,
        completed: false
      };
      section.lessons.push(newLesson);
      return of(newLesson).pipe(delay(300));
    }
    throw new Error(`Section with ID ${lesson.sectionId} not found`);
  }

  /**
   * Update a lesson
   */
  updateLesson(id: number, lesson: Lesson): Observable<Lesson> {
    // Uncomment for real API:
    // return this.http.updateRequest(`${this.apiUrl}/lessons/${id}`, lesson);

    for (const section of this.mockSections) {
      const lessonIndex = section.lessons.findIndex(l => l.id === id);
      if (lessonIndex !== -1) {
        section.lessons[lessonIndex] = { ...lesson, id };
        return of(section.lessons[lessonIndex]).pipe(delay(300));
      }
    }
    throw new Error(`Lesson with ID ${id} not found`);
  }

  /**
   * Delete a lesson
   */
  deleteLesson(id: number): Observable<void> {
    // Uncomment for real API:
    // return this.http.deleteRequest(`${this.apiUrl}/lessons/${id}`);

    for (const section of this.mockSections) {
      const lessonIndex = section.lessons.findIndex(l => l.id === id);
      if (lessonIndex !== -1) {
        section.lessons.splice(lessonIndex, 1);
        return of(void 0).pipe(delay(200));
      }
    }
    throw new Error(`Lesson with ID ${id} not found`);
  }

  /**
   * Get a specific lesson by ID
   */
  getLesson(lessonId: number): Observable<Lesson | undefined> {
    for (const section of this.mockSections) {
      const lesson = section.lessons.find(l => l.id === lessonId);
      if (lesson) {
        return of(lesson).pipe(delay(200));
      }
    }
    return of(undefined).pipe(delay(200));
  }

  /**
   * Reorder sections (for drag and drop)
   */
  reorderSections(courseId: number, sectionIds: number[]): Observable<void> {
    // Update order property based on new sequence
    sectionIds.forEach((id, index) => {
      const section = this.mockSections.find(s => s.id === id);
      if (section) {
        section.order = index + 1;
      }
    });
    return of(void 0).pipe(delay(200));
  }

  /**
   * Reorder lessons within a section
   */
  reorderLessons(sectionId: number, lessonIds: number[]): Observable<void> {
    const section = this.mockSections.find(s => s.id === sectionId);
    if (section) {
      lessonIds.forEach((id, index) => {
        const lesson = section.lessons.find(l => l.id === id);
        if (lesson) {
          lesson.order = index + 1;
        }
      });
    }
    return of(void 0).pipe(delay(200));
  }
}
