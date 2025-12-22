# Angular LMS - Learning Management System

A full-stack Learning Management System built with Angular 20 and Express.js, featuring course management, user enrollment, progress tracking, and automatic quiz grading.

## Features

### Frontend (Angular 20)
- **Modern Architecture**: 100% standalone components with OnPush change detection
- **Course Management**: Browse courses, view details, and track progress
- **Authentication**: Secure JWT-based login/register with functional interceptors
- **Course Player**: Interactive lesson viewer with progress tracking
- **Video Lessons**: Professional Video.js player with progress tracking, resume playback, and playback speed controls
- **Quiz System**: Auto-graded quizzes with instant feedback and attempt history
- **Analytics Dashboard**: Comprehensive progress tracking with performance metrics
- **Instructor Dashboard**: Advanced analytics and student performance tracking for instructors
- **Material Design**: Responsive UI with Angular Material components
- **Performance Optimized**: Smart caching, lazy loading, and efficient change detection

### Backend (Express.js + TypeORM)
- RESTful API architecture
- PostgreSQL database with TypeORM
- JWT-based authentication
- Role-based authorization (student, instructor, admin)
- Video file upload and streaming with range request support
- Automatic video progress tracking with resume functionality
- Automatic quiz grading system
- Progress calculation engine
- Instructor analytics with detailed student performance tracking and video analytics
- Comprehensive course and curriculum management
- Data export capabilities (CSV/JSON)
- Secure password hashing with bcrypt

## Tech Stack

**Frontend:**
- Angular 20.3.12 (Standalone Components Architecture)
- Angular Material 20.2.13
- RxJS 7.8.2
- TypeScript 5.8
- Modern Angular Features:
  - 100% Standalone Components
  - Functional Guards & Interceptors
  - OnPush Change Detection Strategy
  - Modern Control Flow (@if, @for, @switch)
  - Signal-based Reactivity

**Backend:**
- Node.js with Express 4.21.2
- TypeORM 0.3.27
- PostgreSQL
- JWT authentication
- bcrypt password hashing

## Modern Angular Architecture

This application has been fully modernized to Angular 20 with cutting-edge best practices:

### Standalone Components (100% Coverage)
- All 25 components are standalone with `standalone: true`
- No traditional NgModules - complete migration to standalone architecture
- Components directly declare their dependencies via `imports` array
- Cleaner, more maintainable code with better tree-shaking

### Application Bootstrap
- Modern `bootstrapApplication()` pattern in `main.ts`
- Centralized configuration in `app.config.ts` with:
  - `provideZoneChangeDetection()` for performance optimization
  - `provideRouter()` with preloading strategies
  - `provideHttpClient()` with functional interceptors
  - `provideAnimations()` for Material components

### Functional Guards & Interceptors
- **Guards:** Modern `CanActivateFn` patterns using `inject()`
  - `authGuard` - Protects authenticated routes
  - `adminGuard` - Restricts admin-only access
  - `blockitGuard` - Custom route protection
- **Interceptors:** Functional `HttpInterceptorFn` patterns
  - `authInterceptorFn` - JWT token injection
  - `cacheInterceptorFn` - Response caching

### OnPush Change Detection
- All components use `ChangeDetectionStrategy.OnPush`
- Significant performance improvements through reduced change detection cycles
- Smart use of `ChangeDetectorRef.markForCheck()` for async operations

### Modern Control Flow Syntax
Templates use Angular's new control flow (Angular 17+):
```html
@if (condition) {
  <div>Content</div>
} @else {
  <div>Alternative</div>
}

@for (item of items; track item.id) {
  <div>{{ item.name }}</div>
}

@switch (value) {
  @case ('option1') { <div>Option 1</div> }
  @case ('option2') { <div>Option 2</div> }
  @default { <div>Default</div> }
}
```

### Route-Based Architecture
- File-based routing with `app.routes.ts`, `course.routes.ts`, `customer.routes.ts`
- Lazy loading with selective preloading strategy
- Cleaner route definitions without module overhead

### Dependency Injection
- Modern `inject()` function instead of constructor injection
- Example:
```typescript
private authService = inject(AuthService);
private router = inject(Router);
private fb = inject(FormBuilder);
```

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm (v9 or higher)
- PostgreSQL (v14 or higher)
- Git

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd angular-sample-app
```

### 2. Install Dependencies

Install dependencies for both frontend and backend with a single command:

```bash
npm run install:all
```

Or install separately:

```bash
# Frontend dependencies
npm install

# Backend dependencies
cd backend
npm install
cd ..
```

### 3. Database Setup

Create a PostgreSQL database:

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE lms_db;

# Exit psql
\q
```

### 4. Environment Configuration

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lms_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:4200
```

**Important:** Change the `JWT_SECRET` to a strong, random string in production.

## Running the Application

### Option 1: Run Both Servers with One Command (Recommended)

```bash
npm run start:all
```

This will start both the backend (port 3000) and frontend (port 4200) simultaneously with color-coded output.

### Option 2: Run Servers Separately

**Terminal 1 - Backend:**
```bash
npm run start:backend
# Backend will run on http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
npm run start:frontend
# Frontend will run on http://localhost:4200
```

### Accessing the Application

- Frontend: http://localhost:4200
- Backend API: http://localhost:3000/api

## Docker Deployment

The application can be deployed using Docker and Docker Compose, which provides a containerized environment with all dependencies included.

### Prerequisites for Docker

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

### Quick Start with Docker

1. **Build and start all services** (frontend, backend, and PostgreSQL):
   ```bash
   docker compose up -d
   ```

2. **Access the application**:
   - Frontend: http://localhost
   - Backend API: http://localhost:3000
   - Database: localhost:5432

3. **View logs**:
   ```bash
   docker compose logs -f
   ```

4. **Stop all services**:
   ```bash
   docker compose down
   ```

### Docker Architecture

The Docker setup includes three services:
- **Frontend**: Angular app served by Nginx (port 80)
- **Backend**: Node.js Express API (port 3000)
- **Database**: PostgreSQL 15 (port 5432)

All services are connected via a Docker bridge network with health checks enabled.

### Docker Commands

```bash
# Build services
docker compose build

# Start services in background
docker compose up -d

# Start with rebuild
docker compose up -d --build

# View service status
docker compose ps

# View logs for specific service
docker compose logs -f backend

# Restart a service
docker compose restart backend

# Stop and remove containers
docker compose down

# Stop and remove containers + volumes (deletes database data)
docker compose down -v

# Execute command in container
docker compose exec backend npm run seed
```

### Configuration

Environment variables are configured in `docker-compose.yml`. For production:

1. Update database password in `docker-compose.yml`
2. Change `JWT_SECRET` to a secure random string
3. Update `CORS_ORIGIN` to your production domain
4. Configure email settings (see Email Configuration below)
5. Review security settings in `nginx.conf`

#### Email Configuration

The platform supports email notifications for various events. To enable email functionality, add the following environment variables to your backend `.env` file:

```bash
# Email Configuration
EMAIL_HOST=smtp.gmail.com          # Your SMTP server (Gmail, SendGrid, etc.)
EMAIL_PORT=587                     # SMTP port (usually 587 for TLS or 465 for SSL)
EMAIL_SECURE=false                 # true for SSL (port 465), false for TLS (port 587)
EMAIL_USER=your-email@gmail.com    # SMTP username/email
EMAIL_PASSWORD=your-app-password   # SMTP password or app-specific password
EMAIL_FROM=noreply@lms.com        # From email address
EMAIL_FROM_NAME=LMS Platform       # From name displayed in emails
```

**Email Notifications Sent:**
- ✉️ **Enrollment Confirmation** - When a user enrolls in a course
- 🎓 **Course Completion** - When a user completes a course (includes certificate link)
- 📝 **Quiz Score Notification** - When a user completes a quiz (includes pass/fail status)
- 📚 **New Lesson Alert** - When a new lesson is added to an enrolled course
- 👋 **Welcome Email** - When a new user registers

**Note:** If email credentials are not configured, the platform will log email notifications to the console instead of sending them, allowing the system to function normally without email.

**Gmail Setup Example:**
1. Enable 2-factor authentication on your Google account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use your email and the generated app password in the configuration

For detailed Docker deployment instructions, see [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md).

## Available Scripts

### Root Level Scripts

- `npm run start:all` - Run both backend and frontend concurrently
- `npm run start:backend` - Run backend development server only
- `npm run start:frontend` - Run frontend development server only
- `npm run install:all` - Install dependencies for both projects
- `npm start` - Run Angular development server
- `npm run build` - Build Angular app for production
- `npm test` - Run frontend tests

### Backend Scripts

```bash
cd backend

# Development server with auto-reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Run production build
npm start

# Seed database with sample data
npm run seed
```

**Note:** The seed script populates the database with sample courses, users, quizzes, and other data for testing and development.

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /me` - Get current user profile (protected)
- `PUT /profile` - Update user profile (protected)
- `POST /change-password` - Change password (protected)

### Courses (`/api/courses`)
- `GET /` - Get all courses (public)
- `GET /:id` - Get course by ID (public)
- `POST /` - Create course (instructor/admin only)
- `PUT /:id` - Update course (instructor/admin only)
- `DELETE /:id` - Delete course (admin only)
- `GET /:id/curriculum` - Get course curriculum with sections and lessons

### Curriculum (`/api`)
- `POST /sections` - Create course section (instructor/admin only)
- `PUT /sections/:id` - Update section (instructor/admin only)
- `DELETE /sections/:id` - Delete section (instructor/admin only)
- `POST /lessons` - Create lesson (instructor/admin only)
- `PUT /lessons/:id` - Update lesson (instructor/admin only)
- `DELETE /lessons/:id` - Delete lesson (instructor/admin only)

### Enrollment (`/api/enrollments`)
- `GET /my` - Get current user's enrollments (protected)
- `POST /` - Enroll in a course (protected)
- `GET /:id` - Get enrollment details (protected)
- `PUT /:id/status` - Update enrollment status (protected)

### Progress (`/api/progress`)
- `GET /enrollment/:enrollmentId` - Get all progress for an enrollment
- `GET /lesson/:lessonId` - Get progress for a specific lesson
- `POST /lesson/complete` - Mark lesson as complete
- `PUT /:progressId/time` - Track time spent on lesson
- `GET /stats` - Get progress statistics for current user

### Quizzes (`/api/quizzes`)
- `GET /:id` - Get quiz by ID
- `GET /course/:courseId/quizzes` - Get all quizzes for a course
- `POST /` - Create quiz (instructor/admin only)
- `POST /attempts/start` - Start a quiz attempt
- `POST /attempts/:attemptId/submit` - Submit quiz with answers (auto-graded)
- `GET /attempts/quiz/:quizId/my` - Get user's attempts for a quiz
- `GET /attempts/:attemptId` - Get attempt details with answers
- `GET /attempts/quiz/:quizId/best` - Get best attempt for a quiz

### Quiz Attempts (`/api/quiz-attempts`)
- `GET /user/:userId` - Get all quiz attempts for a specific user (protected)
- `GET /course/:courseId` - Get all quiz attempts for a course (admin only)
- `GET /` - Get all quiz attempts across the system (admin only)

### Instructor Analytics (`/api/instructor/analytics`)
- `GET /course/:courseId/overview` - Get course analytics overview (instructor/admin only)
- `GET /course/:courseId/students` - Get all students enrolled in a course with progress (instructor/admin only)
- `GET /course/:courseId/quiz-performance` - Get quiz performance analytics for a course (instructor/admin only)
- `GET /student/:studentId/detail` - Get detailed performance for a specific student (instructor/admin only)
- `GET /course/:courseId/export` - Export course data in CSV or JSON format (instructor/admin only)

### Certificates (`/api/certificates`)
- `POST /:enrollmentId/generate` - Generate certificate for completed enrollment (protected)
- `GET /:enrollmentId` - View certificate (public)
- `GET /:enrollmentId/download` - Download certificate as PDF (public)
- `DELETE /:enrollmentId` - Delete certificate (admin/instructor only)

**Note:** Certificates are automatically generated when a course is completed (progress reaches 100%). Students can view and download their certificates from the user dashboard.

### Analytics (`/api/analytics`)
**System Analytics (Admin only):**
- `GET /system/overview` - Get system-wide statistics
- `GET /system/user-growth?days=30` - Get user growth trends
- `GET /system/enrollment-trends?days=30` - Get enrollment trends over time
- `GET /system/top-courses?limit=10` - Get top performing courses
- `GET /system/completion-rates` - Get course completion rates
- `GET /system/quiz-distribution` - Get quiz score distribution

**Student Analytics:**
- `GET /student/my-analytics` - Get personal learning analytics (protected)

## Project Structure

```
angular-sample-app/
├── src/                          # Frontend source code
│   ├── app/
│   │   ├── core/                 # Core functionality
│   │   │   ├── guards/           # Route guards (functional)
│   │   │   │   ├── auth.guard.ts
│   │   │   │   ├── admin.guard.ts
│   │   │   │   ├── instructor.guard.ts
│   │   │   │   └── blockit.guard.ts
│   │   │   └── interceptors/     # HTTP interceptors (functional)
│   │   │       ├── auth.interceptor.ts
│   │   │       └── cache.interceptor.ts
│   │   ├── course/               # Course feature (standalone components)
│   │   │   ├── components/       # Course components
│   │   │   │   ├── course-list/
│   │   │   │   ├── course-detail/
│   │   │   │   ├── course-player/
│   │   │   │   ├── lesson-viewer/
│   │   │   │   ├── quiz-player/
│   │   │   │   └── ...
│   │   │   ├── models/           # TypeScript interfaces
│   │   │   │   ├── analytics.interface.ts
│   │   │   │   └── ...
│   │   │   ├── services/         # Frontend services
│   │   │   │   ├── instructor-analytics.service.ts
│   │   │   │   └── ...
│   │   │   └── course.routes.ts  # Route-based lazy loading
│   │   ├── customer/             # Customer feature (standalone components)
│   │   │   ├── components/       # Customer components
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   ├── user-dashboard/
│   │   │   │   └── ...
│   │   │   └── customer.routes.ts
│   │   ├── instructor/           # Instructor feature (standalone components)
│   │   │   ├── instructor-dashboard.component.ts
│   │   │   ├── course-analytics/  # Course analytics view
│   │   │   ├── student-detail/    # Student detail view
│   │   │   └── shared/            # Shared instructor components
│   │   │       ├── analytics-card/
│   │   │       └── performance-badge/
│   │   ├── shared/               # Shared services and utilities
│   │   │   ├── services/         # Shared services
│   │   │   │   ├── export.service.ts
│   │   │   │   └── ...
│   │   │   └── animations/       # Reusable animations
│   │   ├── app.component.ts      # Root component (standalone)
│   │   ├── app.config.ts         # Application configuration
│   │   └── app.routes.ts         # Root routing configuration
│   ├── environments/             # Environment configurations
│   ├── main.ts                   # Bootstrap with bootstrapApplication()
│   └── index.html
├── backend/                      # Backend source code
│   ├── src/
│   │   ├── entities/             # TypeORM entities
│   │   │   ├── User.ts
│   │   │   ├── Course.ts
│   │   │   ├── CourseSection.ts
│   │   │   ├── Lesson.ts
│   │   │   ├── Quiz.ts
│   │   │   ├── QuizQuestion.ts
│   │   │   ├── QuizOption.ts
│   │   │   ├── Enrollment.ts
│   │   │   ├── UserProgress.ts
│   │   │   ├── QuizAttempt.ts
│   │   │   └── UserAnswer.ts
│   │   ├── services/             # Business logic services
│   │   │   ├── instructorService.ts
│   │   │   └── ...
│   │   ├── controllers/          # Route controllers
│   │   │   ├── instructorController.ts
│   │   │   └── ...
│   │   ├── routes/               # API routes
│   │   │   ├── instructorRoutes.ts
│   │   │   └── ...
│   │   ├── middleware/           # Custom middleware
│   │   ├── config/               # Configuration files
│   │   ├── utils/                # Utility functions and seed data
│   │   └── app.ts                # Express app entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                      # Environment variables
└── package.json                  # Root package.json
```

**Key Architecture Changes:**
- ❌ Removed: `app.module.ts`, `app-routing.module.ts`, `course.module.ts`, `shared.module.ts`
- ✅ Added: `app.config.ts`, `app.routes.ts`, `course.routes.ts`, `customer.routes.ts`
- All components are standalone with direct imports
- Functional guards and interceptors instead of class-based

## Key Features Explained

### Automatic Quiz Grading

The backend automatically grades quizzes by:
1. Comparing selected options with correct options for each question
2. Calculating total points earned
3. Computing percentage score
4. Determining pass/fail based on quiz passing score (default 70%)
5. Storing detailed attempt history with all user answers

### Progress Tracking

Progress is calculated by:
1. Counting total lessons in a course
2. Tracking completed lessons per enrollment
3. Calculating percentage: (completed lessons / total lessons) × 100
4. Automatically updating enrollment progress
5. Allowing time tracking for analytics

### JWT Authentication Flow

1. User registers/logs in
2. Backend generates JWT token with user info
3. Frontend stores token in localStorage
4. HTTP interceptor automatically attaches token to all requests
5. Backend middleware validates token on protected routes
6. Auto-logout on token expiration (401 errors)

### Quiz Attempt Tracking & Analytics

The dashboard provides comprehensive quiz performance analytics:
1. **Individual Attempt History**: View all quiz attempts with scores and timestamps
2. **Best Score Tracking**: Display best performance per quiz
3. **Course-Level Analytics**: Average quiz scores grouped by course
4. **Progress Visualization**: Color-coded performance indicators:
   - Green (≥ 80%): Excellent performance
   - Yellow (60-79%): Good performance
   - Red (< 60%): Needs improvement
5. **Completion Tracking**: Completed vs. total quizzes per course
6. **Admin Access**: Instructors can view all student attempts for analysis

### Instructor Dashboard with Student Analytics

The instructor dashboard provides comprehensive analytics and insights for course management:

#### Dashboard Overview
1. **Course Cards**: Visual overview of all courses with key metrics
2. **Enrollment Statistics**: Active, completed, and dropped student counts
3. **Average Progress**: Track overall student progress across the course
4. **Quiz Performance**: Average quiz scores and pass rates
5. **Data Export**: Export analytics as CSV or Excel files

#### Course Analytics Page
1. **Student Table**: Searchable and sortable table of all enrolled students
   - Student name, email, and profile information
   - Enrollment status (active, completed, dropped)
   - Progress percentage and completed lessons
   - Average quiz scores and attempts
   - Last access date tracking
2. **Filters**: Filter students by enrollment status
3. **Search**: Quick search by student name or email
4. **Bulk Export**: Export student data for reporting

#### Student Detail View
1. **Performance Overview**: Individual student metrics
   - Total time spent in course
   - Completion percentage
   - Detailed progress records
2. **Lesson Progress**: Track completion status for each lesson
3. **Quiz Attempts**: View all quiz attempts with scores and dates
4. **Export Options**: Export individual student performance data

#### Features
- **Real-time Analytics**: Live data from enrolled students
- **Question-Level Analytics**: Identify difficult quiz questions
- **Performance Metrics**: Track accuracy rates and common mistakes
- **Role-Based Access**: Protected routes for instructors and admins only
- **Data Export**: CSV and Excel export for further analysis

## Development

### Code Generation

Generate Angular components, services, etc.:

```bash
# Generate component
ng generate component component-name

# Generate service
ng generate service service-name

# Generate module
ng generate module module-name
```

### Database Migrations

TypeORM will automatically create tables on first run when `synchronize: true` is set in `backend/src/config/database.ts`.

**Warning:** In production, set `synchronize: false` and use proper migrations.

## Testing

### Frontend Unit Tests

Run Jasmine/Karma unit tests:

```bash
npm test
```

### End-to-End Tests (Playwright)

The application includes comprehensive E2E tests using Playwright:

```bash
# Run E2E tests
npm run test:e2e

# Run with UI mode
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug

# View test report
npm run test:e2e:report
```

### Backend Tests

Run Jest tests:

```bash
cd backend
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## Production Build

### Frontend

```bash
npm run build
```

Build artifacts will be in the `dist/` directory.

### Backend

```bash
cd backend
npm run build
npm start
```

## Security Considerations

- Passwords are hashed using bcrypt with 10 salt rounds
- JWT tokens expire after 7 days (configurable)
- HTTP-only cookies recommended for production
- CORS configured to accept requests from frontend only
- SQL injection prevented by TypeORM parameterized queries
- Input validation on all endpoints

## Troubleshooting

### Database Connection Issues

1. Ensure PostgreSQL is running:
   ```bash
   sudo systemctl status postgresql
   ```

2. Verify database exists:
   ```bash
   psql -U postgres -l
   ```

3. Check credentials in `backend/.env`

### Port Already in Use

If ports 3000 or 4200 are in use:

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 4200
lsof -ti:4200 | xargs kill -9
```

### Module Not Found Errors

Reinstall dependencies:

```bash
npm run install:all
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on the repository.

## Roadmap

### Recently Completed ✅
- [x] Migrate to Angular 20 standalone components (100% completion)
- [x] Implement OnPush change detection strategy
- [x] Add functional guards and interceptors
- [x] Modernize to new control flow syntax (@if, @for, @switch)
- [x] Add seed data script for sample courses
- [x] Implement quiz attempt tracking and analytics
- [x] Add comprehensive user dashboard with progress tracking
- [x] Implement instructor dashboard with student analytics
- [x] Add video lesson support with progress tracking
- [x] Implement course certificates upon completion
- [x] Email notifications for course updates and quiz scores
- [x] Advanced analytics dashboard with data visualization

### Planned Features 🚀
- [ ] Real-time collaboration features
- [ ] AI-powered course recommendations
