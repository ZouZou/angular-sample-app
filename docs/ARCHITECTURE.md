# System Architecture

## Table of Contents

- [High-Level Architecture](#high-level-architecture)
- [Technology Stack](#technology-stack)
- [Application Architecture](#application-architecture)
- [Database Schema](#database-schema)
- [Data Flow](#data-flow)
- [Security Architecture](#security-architecture)
- [Performance Optimizations](#performance-optimizations)

---

## High-Level Architecture

The Angular LMS is built as a modern full-stack web application using a client-server architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer (Browser)                    │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         Angular 20 Single Page Application             │ │
│  │                                                          │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │ │
│  │  │  Course  │  │   Quiz   │  │   Auth   │  │ Shared │ │ │
│  │  │  Module  │  │  Module  │  │  Module  │  │ Module │ │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └────────┘ │ │
│  │                                                          │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │         RxJS State Management Layer              │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │                                                          │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │     Services & HTTP Interceptors                 │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS / REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Server Layer (Node.js)                    │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Express.js API Server                      │ │
│  │                                                          │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │  Authentication & Authorization Middleware        │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │                                                          │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │ │
│  │  │  Course  │  │   Quiz   │  │   Auth   │  │Progress│ │ │
│  │  │Controller│  │Controller│  │Controller│  │Controller│││
│  │  └──────────┘  └──────────┘  └──────────┘  └────────┘ │ │
│  │                                                          │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │ │
│  │  │  Course  │  │   Quiz   │  │   Auth   │  │Progress│ │ │
│  │  │ Service  │  │ Service  │  │ Service  │  │ Service│ │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └────────┘ │ │
│  │                                                          │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │           TypeORM Data Access Layer              │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ SQL Queries
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Database Layer (PostgreSQL)                │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │            PostgreSQL 15 Relational Database           │ │
│  │                                                          │ │
│  │  Tables: users, courses, sections, lessons,            │ │
│  │          enrollments, quizzes, quiz_attempts,          │ │
│  │          user_progress, user_answers                   │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Angular** | 20.3.12 | Core framework for building the SPA |
| **Angular Material** | 20.2.13 | UI component library for consistent design |
| **Angular CDK** | 20.2.13 | Component development kit for advanced components |
| **RxJS** | 7.8.2 | Reactive programming for async operations |
| **TypeScript** | 5.8.0 | Type-safe development |
| **Jasmine** | 5.5.0 | Unit testing framework |
| **Karma** | 6.4.4 | Test runner |
| **Playwright** | 1.56.1 | E2E testing framework |

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | JavaScript runtime |
| **Express.js** | 4.21.2 | Web application framework |
| **TypeORM** | 0.3.27 | ORM for database operations |
| **PostgreSQL** | 15+ | Relational database |
| **JWT** | 9.0.2 | Authentication tokens |
| **bcrypt** | 6.0.0 | Password hashing |
| **class-validator** | 0.14.2 | Request validation |
| **Jest** | 29.7.0 | Testing framework |

### DevOps & Tooling

| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Multi-container orchestration |
| **Nginx** | Reverse proxy and static file serving |
| **Git** | Version control |
| **concurrently** | Running multiple dev servers |

---

## Application Architecture

### Frontend Architecture (Angular)

#### Module Organization

```
src/app/
├── core/                          # Singleton services and guards
│   ├── guards/
│   │   ├── auth.guard.ts         # Authentication guard
│   │   └── admin.guard.ts        # Role-based authorization
│   ├── interceptors/
│   │   └── auth.interceptor.ts   # JWT token injection
│   └── strategies/
│       └── selective-preload-strategy.ts  # Module preloading
│
├── shared/                        # Reusable components/services
│   ├── components/
│   │   ├── loading-spinner/
│   │   ├── confirmation-dialog/
│   │   ├── file-upload/
│   │   ├── skeleton-course-card/
│   │   └── pwa-install-prompt/
│   └── services/
│       ├── notification.service.ts
│       ├── logger.service.ts
│       ├── pwa.service.ts
│       └── form-state.service.ts
│
├── course/                        # Course feature module (lazy-loaded)
│   ├── components/
│   │   ├── course-list/
│   │   ├── course-detail/
│   │   ├── course-form/
│   │   │   ├── curriculum-manager/
│   │   │   ├── section-form/
│   │   │   └── lesson-form/
│   │   ├── player/
│   │   │   ├── course-player/
│   │   │   └── lesson-viewer/
│   │   └── quiz/
│   │       ├── quiz-player/
│   │       └── quiz-result/
│   ├── services/
│   │   ├── course.service.ts
│   │   ├── curriculum.service.ts
│   │   ├── enrollment.service.ts
│   │   ├── progress.service.ts
│   │   ├── quiz.service.ts
│   │   └── auth.service.ts
│   └── models/
│       └── course.model.ts        # TypeScript interfaces
│
├── auth/                          # Authentication module
│   └── login/
│       └── login.component.ts
│
└── app-routing.module.ts          # Application routing
```

#### Component Architecture Pattern

The application follows a **Smart/Dumb Component** pattern:

- **Smart Components** (Containers): Handle business logic, API calls, and state management
  - `course-list.component.ts`
  - `course-player.component.ts`
  - `quiz-player.component.ts`

- **Dumb Components** (Presentational): Receive data via `@Input()`, emit events via `@Output()`
  - `lesson-viewer.component.ts`
  - `quiz-result.component.ts`
  - `skeleton-course-card.component.ts`

#### State Management Strategy

The application uses **RxJS and Services** for state management:

1. **Service-based State**: Each feature has dedicated services that maintain state
2. **BehaviorSubjects**: Used for managing and broadcasting state changes
3. **Async Pipe**: Preferred for automatic subscription management in templates
4. **Local Component State**: For UI-specific state

Example:
```typescript
// course.service.ts
private coursesSubject = new BehaviorSubject<Course[]>([]);
public courses$ = this.coursesSubject.asObservable();

loadCourses() {
  this.http.get<Course[]>('/api/courses')
    .subscribe(courses => this.coursesSubject.next(courses));
}
```

#### Routing Strategy

- **Lazy Loading**: Feature modules loaded on-demand
- **Route Guards**: Authentication and authorization enforcement
- **Preloading Strategy**: Selective preloading for critical modules
- **Scroll Restoration**: Automatic scroll position management

---

### Backend Architecture (Express.js + TypeORM)

#### Layered Architecture

```
backend/src/
├── app.ts                         # Application entry point
├── config/
│   ├── database.ts               # TypeORM configuration
│   └── jwt.ts                    # JWT configuration
│
├── entities/                      # TypeORM entities (Models)
│   ├── User.ts
│   ├── Course.ts
│   ├── CourseSection.ts
│   ├── Lesson.ts
│   ├── Enrollment.ts
│   ├── UserProgress.ts
│   ├── Quiz.ts
│   ├── QuizQuestion.ts
│   ├── QuizOption.ts
│   ├── QuizAttempt.ts
│   └── UserAnswer.ts
│
├── controllers/                   # Request handlers
│   ├── authController.ts
│   ├── courseController.ts
│   ├── curriculumController.ts
│   ├── enrollmentController.ts
│   ├── progressController.ts
│   └── quizController.ts
│
├── services/                      # Business logic
│   ├── authService.ts
│   ├── courseService.ts
│   ├── curriculumService.ts
│   ├── enrollmentService.ts
│   ├── progressService.ts
│   └── quizService.ts
│
├── routes/                        # API route definitions
│   ├── authRoutes.ts
│   ├── courseRoutes.ts
│   ├── curriculumRoutes.ts
│   ├── enrollmentRoutes.ts
│   ├── progressRoutes.ts
│   └── quizRoutes.ts
│
├── middleware/                    # Custom middleware
│   ├── auth.ts                   # JWT authentication
│   └── errorHandler.ts           # Global error handling
│
└── utils/
    ├── logger.ts                 # Logging utility
    └── seedData.ts               # Database seeding
```

#### Request Flow

```
Incoming Request
    ↓
Express Router
    ↓
Authentication Middleware (if protected route)
    ↓
Authorization Middleware (if role-restricted)
    ↓
Controller (request validation & routing)
    ↓
Service Layer (business logic)
    ↓
TypeORM Repository (data access)
    ↓
PostgreSQL Database
    ↓
Response sent back through layers
```

#### Service Layer Pattern

Services contain all business logic and are reusable across controllers:

```typescript
// quizService.ts
export class QuizService {
  private quizRepository = AppDataSource.getRepository(Quiz);

  async gradeQuizAttempt(attemptId: number, answers: UserAnswer[]): Promise<QuizResult> {
    // Business logic for automatic grading
    // 1. Fetch quiz with questions and correct options
    // 2. Compare user answers with correct answers
    // 3. Calculate score
    // 4. Determine pass/fail
    // 5. Save results
  }
}
```

---

## Database Schema

### Entity Relationship Diagram

```
┌──────────────┐
│    users     │
│──────────────│
│ id           │─┐
│ email        │ │
│ password_hash│ │
│ name         │ │
│ role         │ │
│ avatar_url   │ │
└──────────────┘ │
                 │
                 │ 1:N
                 │
    ┌────────────┴─────────────┬──────────────────┐
    │                          │                  │
    ▼                          ▼                  ▼
┌──────────────┐       ┌──────────────┐   ┌──────────────┐
│ enrollments  │       │ quiz_attempts│   │user_progress │
│──────────────│       │──────────────│   │──────────────│
│ id           │       │ id           │   │ id           │
│ user_id      │───┐   │ user_id      │   │ user_id      │
│ course_id    │   │   │ quiz_id      │   │ enrollment_id│
│ status       │   │   │ score        │   │ lesson_id    │
│ progress     │   │   │ passed       │   │ completed    │
└──────────────┘   │   └──────────────┘   └──────────────┘
                   │
                   │ N:1
                   │
                   ▼
            ┌──────────────┐
            │   courses    │
            │──────────────│
            │ id           │─┬─────────────┐
            │ title        │ │             │
            │ description  │ │             │
            │ instructor   │ │ 1:N         │ 1:N
            │ price        │ │             │
            │ category     │ │             │
            │ level        │ │             │
            │ published    │ │             │
            └──────────────┘ │             │
                             │             │
                    ┌────────┴────┐        │
                    ▼              ▼        ▼
            ┌──────────────┐  ┌──────────────┐
            │course_sections│  │   quizzes    │
            │──────────────│  │──────────────│
            │ id           │─┐│ id           │
            │ course_id    │ ││ course_id    │─┐
            │ title        │ ││ title        │ │
            │ order_index  │ ││ passing_score│ │
            └──────────────┘ │└──────────────┘ │
                             │                 │
                    1:N      │       1:N       │
                             │                 │
                    ┌────────┴───┐    ┌────────┴────┐
                    ▼            │    ▼             │
            ┌──────────────┐     │ ┌──────────────┐ │
            │   lessons    │     │ │quiz_questions│ │
            │──────────────│     │ │──────────────│ │
            │ id           │     │ │ id           │ │
            │ section_id   │     │ │ quiz_id      │─┘
            │ title        │     │ │ question_text│
            │ content      │     │ │ points       │
            │ type         │     │ └──────────────┘
            │ video_url    │     │         │
            │ order_index  │     │         │ 1:N
            └──────────────┘     │         │
                                 │ ┌───────▼──────┐
                                 │ │ quiz_options │
                                 │ │──────────────│
                                 │ │ id           │
                                 │ │ question_id  │
                                 │ │ option_text  │
                                 └─│ is_correct   │
                                   └──────────────┘
```

### Key Database Tables

**users**
- Stores user account information
- Passwords hashed with bcrypt
- Roles: student, instructor, admin

**courses**
- Course metadata and details
- Supports categories, levels, pricing
- Tracks enrollment count and ratings

**course_sections**
- Organizes course content into sections
- Ordered by `order_index`

**lessons**
- Individual learning units
- Types: video, article, quiz
- Contains content and resources

**enrollments**
- Links users to courses
- Tracks progress percentage
- Status: active, completed, dropped

**user_progress**
- Tracks lesson completion
- Records time spent and notes
- Links to enrollment and lesson

**quizzes**
- Quiz metadata
- Passing score and time limits
- Belongs to a course

**quiz_questions**
- Individual quiz questions
- Point values
- Ordered by `order_index`

**quiz_options**
- Answer options for questions
- Marks correct answers (`is_correct`)

**quiz_attempts**
- Records of quiz submissions
- Stores calculated scores
- Pass/fail status

**user_answers**
- Individual answers for each question
- Links selected options
- Stores correctness and points earned

---

## Data Flow

### Course Enrollment Flow

```
User clicks "Enroll" button
    ↓
Frontend: EnrollmentService.enroll(courseId)
    ↓
HTTP POST /api/enrollments with courseId
    ↓
Backend: EnrollmentController.enrollInCourse()
    ↓
EnrollmentService checks:
  - User is authenticated
  - Course exists
  - User not already enrolled
    ↓
Create Enrollment record with:
  - userId, courseId
  - status: 'active'
  - progress: 0
    ↓
Increment course.enrollmentCount
    ↓
Return enrollment data
    ↓
Frontend updates UI:
  - Show "Enrolled" badge
  - Navigate to course player
```

### Quiz Submission & Auto-Grading Flow

```
User completes quiz and clicks "Submit"
    ↓
Frontend: QuizService.submitQuizAttempt(attemptId, answers)
    ↓
HTTP POST /api/quizzes/attempts/:id/submit
    ↓
Backend: QuizController.submitQuizAttempt()
    ↓
QuizService.gradeQuizAttempt():
  1. Fetch quiz with all questions and options
  2. For each user answer:
     - Compare selected options with correct options
     - Calculate points earned
     - Mark answer as correct/incorrect
  3. Sum total points earned
  4. Calculate percentage: (earned / max) × 100
  5. Determine pass/fail based on passing score
  6. Save QuizAttempt with score and status
  7. Save all UserAnswer records
    ↓
Return graded attempt with:
  - score, maxScore
  - passed boolean
  - detailed answer breakdown
    ↓
Frontend displays:
  - Overall score and pass/fail
  - Question-by-question feedback
  - Option to retake quiz
```

### Progress Tracking Flow

```
User completes a lesson
    ↓
Frontend: ProgressService.markLessonComplete(enrollmentId, lessonId)
    ↓
HTTP POST /api/progress/lesson/complete
    ↓
Backend: ProgressController.markLessonComplete()
    ↓
ProgressService:
  1. Create/update UserProgress record
  2. Set completed: true
  3. Set completedAt timestamp
    ↓
EnrollmentService.calculateProgress(enrollmentId):
  1. Count total lessons in course
  2. Count completed lessons for user
  3. Calculate: (completed / total) × 100
  4. Update enrollment.progress
    ↓
Return updated progress
    ↓
Frontend updates:
  - Progress bar
  - Lesson completion checkmark
  - Course completion percentage
```

### Authentication Flow

```
User submits login credentials
    ↓
Frontend: AuthService.login(email, password)
    ↓
HTTP POST /api/auth/login
    ↓
Backend: AuthController.login()
    ↓
AuthService:
  1. Find user by email
  2. Compare password with bcrypt.compare()
  3. If valid:
     - Generate JWT with user payload (id, email, role)
     - Sign with secret key
     - Set expiration (7 days)
  4. Return user data + token
    ↓
Frontend:
  1. Store token in localStorage
  2. Store user data in AuthService
  3. Navigate to dashboard
    ↓
Subsequent API requests:
  1. AuthInterceptor adds Authorization header
  2. Backend auth middleware validates token
  3. Request proceeds if valid
  4. 401 error if invalid → auto-logout
```

---

## Security Architecture

### Authentication & Authorization

**JWT-Based Authentication:**
1. User logs in with email/password
2. Server validates credentials
3. Server generates JWT containing:
   - User ID
   - Email
   - Role
   - Expiration timestamp
4. Client stores JWT in localStorage
5. Client includes JWT in Authorization header for all requests
6. Server middleware validates JWT signature and expiration

**Role-Based Access Control (RBAC):**
- **Student**: Can enroll, view courses, take quizzes, track progress
- **Instructor**: All student permissions + create/edit/delete courses
- **Admin**: All permissions + user management, system configuration

Implementation in `backend/src/middleware/auth.ts`:
```typescript
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};
```

### Password Security

- **Hashing Algorithm**: bcrypt with 10 salt rounds
- **No plain-text storage**: Passwords immediately hashed on registration
- **Password validation**: Enforced on client and server
- **Change password**: Requires current password verification

### API Security

1. **CORS Protection**: Configured to accept requests only from trusted origins
2. **Input Validation**: class-validator decorators on all DTOs
3. **SQL Injection Prevention**: TypeORM parameterized queries
4. **XSS Protection**: Content sanitization on frontend
5. **CSRF Protection**: JWT tokens (stateless authentication)
6. **Rate Limiting**: (Recommended for production)

### Data Protection

- **Environment Variables**: Sensitive config in `.env` (not committed)
- **Database Credentials**: Never exposed to frontend
- **JWT Secret**: Strong random string, environment-specific
- **HTTPS**: Required for production deployment

---

## Performance Optimizations

### Frontend Performance

**1. Lazy Loading Modules**
- Course module loaded on-demand
- Reduces initial bundle size
- Faster Time to Interactive (TTI)

**2. Selective Preloading Strategy**
- Critical modules preloaded after initial load
- Configured in `app-routing.module.ts`:
  ```typescript
  data: { preload: true, preloadDelay: 1000 }
  ```

**3. OnPush Change Detection**
- Used in presentational components
- Reduces change detection cycles
- Improves rendering performance

**4. Async Pipe**
- Automatic subscription management
- Memory leak prevention
- Cleaner component code

**5. Skeleton Screens**
- Loading state indicators
- Better perceived performance
- `skeleton-course-card.component.ts`

**6. Image Optimization**
- Lazy loading images
- Responsive image sizing
- Optimized thumbnail formats

**7. PWA Support**
- Service Worker caching
- Offline functionality
- Install prompts

### Backend Performance

**1. Database Indexing**
- Indexes on foreign keys
- Indexes on frequently queried fields (email, courseId)
- Compound indexes for complex queries

**2. Query Optimization**
- TypeORM `relations` for eager loading
- Avoids N+1 query problems
- Pagination for large result sets

**3. Connection Pooling**
- PostgreSQL connection pool
- Configured in TypeORM data source
- Reuses database connections

**4. Caching Strategy** (Recommended)
- Redis for session storage
- Cache frequently accessed data (course lists)
- TTL-based invalidation

**5. Async Operations**
- Non-blocking I/O with async/await
- Parallel database queries where possible
- Background job processing for emails

### Database Performance

**1. Normalized Schema**
- Third Normal Form (3NF)
- Eliminates data redundancy
- Maintains data integrity

**2. Optimized Queries**
- Use of indexes
- Query planning and analysis
- Avoid SELECT *

**3. Transaction Management**
- ACID compliance
- Rollback on errors
- Batch operations

---

## Deployment Architecture

### Docker Deployment

```
┌─────────────────────────────────────────┐
│         Nginx Container                  │
│  - Serves Angular static files          │
│  - Reverse proxy to backend             │
│  - Port: 80                              │
└───────────────┬─────────────────────────┘
                │
                │ Proxy pass /api/*
                │
                ▼
┌─────────────────────────────────────────┐
│      Backend Container (Node.js)         │
│  - Express.js API                        │
│  - Port: 3000                            │
└───────────────┬─────────────────────────┘
                │
                │ Database connection
                │
                ▼
┌─────────────────────────────────────────┐
│    PostgreSQL Container                  │
│  - Data persistence with volumes         │
│  - Port: 5432                            │
└─────────────────────────────────────────┘
```

All containers connected via Docker bridge network with health checks enabled.

---

## Scalability Considerations

**Horizontal Scaling:**
- Stateless API design enables multiple backend instances
- Load balancer distributes requests
- Session stored in database, not server memory

**Vertical Scaling:**
- Database can be scaled independently
- Connection pooling handles increased load
- Caching reduces database pressure

**Future Enhancements:**
- Microservices architecture for large scale
- Separate quiz grading service
- CDN for static assets and videos
- Message queue for async tasks (emails, notifications)
- Read replicas for database

---

**Last Updated:** 2024-01-26
