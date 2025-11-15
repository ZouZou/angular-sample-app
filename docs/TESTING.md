# Testing Guide

## Table of Contents

- [Testing Strategy](#testing-strategy)
- [Unit Testing](#unit-testing)
- [Integration Testing](#integration-testing)
- [End-to-End Testing](#end-to-end-testing)
- [Test Coverage](#test-coverage)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Best Practices](#best-practices)

---

## Testing Strategy

The Angular LMS uses a comprehensive testing strategy across multiple layers:

```
┌─────────────────────────────────────────┐
│         E2E Tests (Playwright)          │
│  Full user workflows and scenarios      │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│     Integration Tests (Backend)         │
│  API endpoints with database            │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         Unit Tests                      │
│  Components, Services, Pure Functions   │
└─────────────────────────────────────────┘
```

### Testing Goals

- **Frontend**: 80%+ coverage on critical components and services
- **Backend**: 90%+ coverage on services and controllers
- **E2E**: Cover all critical user journeys
- **Fast feedback**: Unit tests run in < 30 seconds
- **Reliable**: Tests are deterministic and don't flake

---

## Unit Testing

### Frontend Unit Tests (Jasmine + Karma)

#### Testing Components

```typescript
// course-list.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CourseListComponent } from './course-list.component';
import { CourseService } from '../../services/course.service';
import { of } from 'rxjs';

describe('CourseListComponent', () => {
  let component: CourseListComponent;
  let fixture: ComponentFixture<CourseListComponent>;
  let courseService: jasmine.SpyObj<CourseService>;

  beforeEach(async () => {
    const courseServiceSpy = jasmine.createSpyObj('CourseService', ['getCourses']);

    await TestBed.configureTestingModule({
      declarations: [ CourseListComponent ],
      imports: [ HttpClientTestingModule ],
      providers: [
        { provide: CourseService, useValue: courseServiceSpy }
      ]
    }).compileComponents();

    courseService = TestBed.inject(CourseService) as jasmine.SpyObj<CourseService>;
    fixture = TestBed.createComponent(CourseListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load courses on init', () => {
    const mockCourses = [
      { id: 1, title: 'Angular Basics', price: 49.99 },
      { id: 2, title: 'TypeScript Advanced', price: 79.99 }
    ];

    courseService.getCourses.and.returnValue(of(mockCourses));

    component.ngOnInit();
    fixture.detectChanges();

    expect(courseService.getCourses).toHaveBeenCalled();
    expect(component.courses.length).toBe(2);
  });

  it('should display courses in template', () => {
    const mockCourses = [
      { id: 1, title: 'Angular Basics', price: 49.99 }
    ];

    courseService.getCourses.and.returnValue(of(mockCourses));
    component.ngOnInit();
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.course-title').textContent).toContain('Angular Basics');
  });

  it('should handle errors when loading courses', () => {
    const errorMessage = 'Failed to load courses';
    courseService.getCourses.and.returnValue(
      throwError(() => new Error(errorMessage))
    );

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.error).toBe(errorMessage);
  });
});
```

#### Testing Services

```typescript
// course.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CourseService } from './course.service';
import { Course } from '../models/course.model';

describe('CourseService', () => {
  let service: CourseService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CourseService]
    });

    service = TestBed.inject(CourseService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verify no outstanding HTTP requests
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch courses', () => {
    const mockCourses: Course[] = [
      { id: 1, title: 'Angular Basics', description: 'Learn Angular', price: 49.99 },
      { id: 2, title: 'TypeScript', description: 'Learn TypeScript', price: 39.99 }
    ];

    service.getCourses().subscribe(courses => {
      expect(courses.length).toBe(2);
      expect(courses).toEqual(mockCourses);
    });

    const req = httpMock.expectOne(`${service.apiUrl}/courses`);
    expect(req.request.method).toBe('GET');
    req.flush(mockCourses);
  });

  it('should fetch a single course by id', () => {
    const mockCourse: Course = {
      id: 1,
      title: 'Angular Basics',
      description: 'Learn Angular',
      price: 49.99
    };

    service.getCourse(1).subscribe(course => {
      expect(course).toEqual(mockCourse);
    });

    const req = httpMock.expectOne(`${service.apiUrl}/courses/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockCourse);
  });

  it('should create a course', () => {
    const newCourse = {
      title: 'New Course',
      description: 'New Description',
      price: 59.99
    };

    const createdCourse = { id: 3, ...newCourse };

    service.createCourse(newCourse).subscribe(course => {
      expect(course.id).toBe(3);
      expect(course.title).toBe(newCourse.title);
    });

    const req = httpMock.expectOne(`${service.apiUrl}/courses`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newCourse);
    req.flush(createdCourse);
  });

  it('should handle errors', () => {
    service.getCourses().subscribe(
      () => fail('should have failed'),
      (error) => {
        expect(error.status).toBe(500);
      }
    );

    const req = httpMock.expectOne(`${service.apiUrl}/courses`);
    req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
  });
});
```

#### Testing Guards

```typescript
// auth.guard.spec.ts
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../../course/services/auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    guard = TestBed.inject(AuthGuard);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should allow activation when authenticated', () => {
    authService.isAuthenticated.and.returnValue(true);

    expect(guard.canActivate()).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to login when not authenticated', () => {
    authService.isAuthenticated.and.returnValue(false);

    expect(guard.canActivate()).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
```

### Backend Unit Tests (Jest)

#### Testing Services

```typescript
// backend/src/services/quizService.spec.ts
import { QuizService } from './quizService';
import { AppDataSource } from '../config/database';

describe('QuizService', () => {
  let quizService: QuizService;

  beforeAll(async () => {
    await AppDataSource.initialize();
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  beforeEach(() => {
    quizService = new QuizService();
  });

  describe('gradeQuizAttempt', () => {
    it('should calculate correct score for all correct answers', async () => {
      const quiz = {
        id: 1,
        passingScore: 70,
        questions: [
          {
            id: 1,
            points: 10,
            options: [
              { id: 1, isCorrect: false },
              { id: 2, isCorrect: true }
            ]
          },
          {
            id: 2,
            points: 10,
            options: [
              { id: 3, isCorrect: true },
              { id: 4, isCorrect: false }
            ]
          }
        ]
      };

      const userAnswers = [
        { questionId: 1, selectedOptionIds: [2] },
        { questionId: 2, selectedOptionIds: [3] }
      ];

      const result = await quizService.gradeQuizAttempt(quiz, userAnswers);

      expect(result.score).toBe(20);
      expect(result.maxScore).toBe(20);
      expect(result.percentage).toBe(100);
      expect(result.passed).toBe(true);
    });

    it('should calculate correct score for partial correct answers', async () => {
      const quiz = {
        id: 1,
        passingScore: 70,
        questions: [
          { id: 1, points: 10, options: [
            { id: 1, isCorrect: false },
            { id: 2, isCorrect: true }
          ]},
          { id: 2, points: 10, options: [
            { id: 3, isCorrect: true },
            { id: 4, isCorrect: false }
          ]}
        ]
      };

      const userAnswers = [
        { questionId: 1, selectedOptionIds: [2] }, // Correct
        { questionId: 2, selectedOptionIds: [4] }  // Wrong
      ];

      const result = await quizService.gradeQuizAttempt(quiz, userAnswers);

      expect(result.score).toBe(10);
      expect(result.maxScore).toBe(20);
      expect(result.percentage).toBe(50);
      expect(result.passed).toBe(false);
    });

    it('should handle multiple correct options', async () => {
      const quiz = {
        id: 1,
        passingScore: 70,
        questions: [
          {
            id: 1,
            points: 10,
            options: [
              { id: 1, isCorrect: true },
              { id: 2, isCorrect: true },
              { id: 3, isCorrect: false }
            ]
          }
        ]
      };

      const userAnswers = [
        { questionId: 1, selectedOptionIds: [1, 2] }
      ];

      const result = await quizService.gradeQuizAttempt(quiz, userAnswers);

      expect(result.score).toBe(10);
      expect(result.passed).toBe(true);
    });
  });
});
```

#### Testing Controllers

```typescript
// backend/src/controllers/courseController.spec.ts
import request from 'supertest';
import express from 'express';
import courseRoutes from '../routes/courseRoutes';

const app = express();
app.use(express.json());
app.use('/api/courses', courseRoutes);

describe('CourseController', () => {
  describe('GET /api/courses', () => {
    it('should return all courses', async () => {
      const response = await request(app)
        .get('/api/courses')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/courses/:id', () => {
    it('should return a course by id', async () => {
      const response = await request(app)
        .get('/api/courses/1')
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title');
    });

    it('should return 404 for non-existent course', async () => {
      await request(app)
        .get('/api/courses/99999')
        .expect(404);
    });
  });

  describe('POST /api/courses', () => {
    it('should create a new course with valid data', async () => {
      const newCourse = {
        title: 'Test Course',
        description: 'Test Description',
        price: 49.99,
        category: 'Programming'
      };

      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', 'Bearer ' + validToken)
        .send(newCourse)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(newCourse.title);
    });

    it('should return 400 for invalid data', async () => {
      const invalidCourse = {
        title: '' // Empty title
      };

      await request(app)
        .post('/api/courses')
        .set('Authorization', 'Bearer ' + validToken)
        .send(invalidCourse)
        .expect(400);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .post('/api/courses')
        .send({ title: 'Test' })
        .expect(401);
    });
  });
});
```

---

## Integration Testing

Integration tests verify that multiple components work together correctly.

### Backend Integration Tests

```typescript
// backend/src/integration/enrollment.spec.ts
describe('Enrollment Integration Tests', () => {
  let authToken: string;
  let courseId: number;
  let userId: number;

  beforeAll(async () => {
    // Setup test database
    await AppDataSource.initialize();

    // Create test user
    const user = await createTestUser();
    userId = user.id;
    authToken = generateToken(user);

    // Create test course
    const course = await createTestCourse();
    courseId = course.id;
  });

  afterAll(async () => {
    await cleanupTestData();
    await AppDataSource.destroy();
  });

  it('should complete full enrollment workflow', async () => {
    // 1. Enroll in course
    const enrollResponse = await request(app)
      .post('/api/enrollments')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ courseId })
      .expect(201);

    const enrollmentId = enrollResponse.body.id;
    expect(enrollResponse.body.progress).toBe(0);

    // 2. Get enrollment
    const getResponse = await request(app)
      .get(`/api/enrollments/${enrollmentId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(getResponse.body.id).toBe(enrollmentId);

    // 3. Complete a lesson
    await request(app)
      .post('/api/progress/lesson/complete')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ enrollmentId, lessonId: 1 })
      .expect(201);

    // 4. Verify progress updated
    const updatedEnrollment = await request(app)
      .get(`/api/enrollments/${enrollmentId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(updatedEnrollment.body.progress).toBeGreaterThan(0);
  });
});
```

---

## End-to-End Testing

E2E tests simulate real user interactions using Playwright.

### E2E Test Examples

```typescript
// e2e/course-enrollment.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Course Enrollment Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('http://localhost:4200/login');
    await page.fill('input[name="email"]', 'student@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/dashboard/);
  });

  test('user can browse and enroll in a course', async ({ page }) => {
    // Navigate to courses page
    await page.goto('http://localhost:4200/courses');

    // Wait for courses to load
    await page.waitForSelector('.course-card');

    // Click on first course
    await page.click('.course-card:first-child');

    // Verify course details page
    await expect(page.locator('h1')).toContainText('Angular');

    // Click enroll button
    await page.click('button:has-text("Enroll")');

    // Verify enrollment success
    await expect(page.locator('.enrollment-status')).toContainText('Enrolled');

    // Navigate to my courses
    await page.click('a:has-text("My Courses")');

    // Verify course appears in enrolled courses
    const enrolledCourses = page.locator('.enrolled-course');
    await expect(enrolledCourses).toHaveCount(1);
  });

  test('user can complete a lesson', async ({ page }) => {
    // Go to enrolled course
    await page.goto('http://localhost:4200/courses/1/play');

    // Click on first lesson
    await page.click('.lesson-item:first-child');

    // Mark as complete
    await page.click('button:has-text("Mark as Complete")');

    // Verify completion
    await expect(page.locator('.lesson-completed-icon')).toBeVisible();

    // Check progress updated
    const progressBar = page.locator('.progress-bar');
    const progressText = await progressBar.getAttribute('aria-valuenow');
    expect(parseInt(progressText!)).toBeGreaterThan(0);
  });

  test('user can take and submit a quiz', async ({ page }) => {
    // Navigate to quiz
    await page.goto('http://localhost:4200/quizzes/1');

    // Start quiz
    await page.click('button:has-text("Start Quiz")');

    // Answer questions
    await page.click('input[type="radio"][value="option1"]');
    await page.click('button:has-text("Next")');

    await page.click('input[type="radio"][value="option2"]');
    await page.click('button:has-text("Submit")');

    // Verify results page
    await expect(page.locator('.quiz-result')).toBeVisible();
    await expect(page.locator('.score')).toContainText(/\d+%/);
  });
});

test.describe('Admin Course Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('http://localhost:4200/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
  });

  test('admin can create a new course', async ({ page }) => {
    // Navigate to course creation
    await page.goto('http://localhost:4200/admin/courses/new');

    // Fill course details
    await page.fill('input[name="title"]', 'E2E Test Course');
    await page.fill('textarea[name="description"]', 'Course created by E2E test');
    await page.fill('input[name="price"]', '99.99');
    await page.selectOption('select[name="category"]', 'Programming');
    await page.selectOption('select[name="level"]', 'Beginner');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify course created
    await expect(page).toHaveURL(/courses\/\d+/);
    await expect(page.locator('h1')).toContainText('E2E Test Course');
  });
});
```

---

## Test Coverage

### Generating Coverage Reports

**Frontend:**
```bash
npm run test:coverage

# View report
open coverage/index.html
```

**Backend:**
```bash
cd backend
npm run test:coverage

# View report
open coverage/lcov-report/index.html
```

### Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

---

## Running Tests

### Frontend Tests

```bash
# Run all tests once
npm test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- --include='**/course.service.spec.ts'

# Run in headless mode (CI)
npm test -- --watch=false --browsers=ChromeHeadless
```

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- quizService.spec.ts

# Run tests matching pattern
npm test -- --testNamePattern="grading"
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run specific test file
npx playwright test e2e/course-enrollment.spec.ts

# Debug mode
npm run test:e2e:debug

# View test report
npm run test:e2e:report
```

---

## Writing Tests

### Test Naming Convention

```typescript
describe('ComponentName/ServiceName', () => {
  describe('methodName', () => {
    it('should do something when condition', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

### AAA Pattern (Arrange-Act-Assert)

```typescript
it('should calculate total price correctly', () => {
  // Arrange: Set up test data
  const cart = new ShoppingCart();
  const item1 = { id: 1, price: 10, quantity: 2 };
  const item2 = { id: 2, price: 15, quantity: 1 };

  // Act: Execute the method being tested
  cart.addItem(item1);
  cart.addItem(item2);
  const total = cart.calculateTotal();

  // Assert: Verify the result
  expect(total).toBe(35); // (10 * 2) + (15 * 1)
});
```

---

## Best Practices

### 1. Keep Tests Fast

- Use mocks and spies instead of real HTTP calls
- Avoid unnecessary async operations
- Run expensive tests (E2E) separately

### 2. Make Tests Independent

```typescript
// ❌ Bad: Tests depend on each other
it('should create user', () => {
  user = service.create({ name: 'John' });
  expect(user.id).toBeDefined();
});

it('should update user', () => {
  service.update(user.id, { name: 'Jane' }); // Depends on previous test
});

// ✅ Good: Each test is independent
beforeEach(() => {
  user = service.create({ name: 'John' });
});

it('should update user', () => {
  service.update(user.id, { name: 'Jane' });
  expect(user.name).toBe('Jane');
});
```

### 3. Test Behavior, Not Implementation

```typescript
// ❌ Bad: Testing implementation details
it('should call private method', () => {
  spyOn(component as any, 'privateMethod');
  component.publicMethod();
  expect(component['privateMethod']).toHaveBeenCalled();
});

// ✅ Good: Testing public behavior
it('should update display when data changes', () => {
  component.updateData(newData);
  expect(component.displayValue).toBe('Updated');
});
```

### 4. Use Descriptive Test Names

```typescript
// ❌ Bad
it('works', () => { ... });
it('test 1', () => { ... });

// ✅ Good
it('should display error message when login fails', () => { ... });
it('should calculate correct total for multiple items', () => { ... });
```

### 5. Clean Up After Tests

```typescript
afterEach(() => {
  // Clean up subscriptions
  component.ngOnDestroy();

  // Reset mocks
  jest.clearAllMocks();

  // Clear localStorage
  localStorage.clear();
});
```

---

**Last Updated:** 2024-01-26
