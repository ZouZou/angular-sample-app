# Developer Guide

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Common Development Tasks](#common-development-tasks)
- [Testing](#testing)
- [Debugging](#debugging)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed on your development machine:

### Required Software

| Software | Minimum Version | Recommended | Installation |
|----------|----------------|-------------|--------------|
| **Node.js** | 18.0.0 | 18.19.0 | [nodejs.org](https://nodejs.org/) |
| **npm** | 9.0.0 | 10.2.0 | Comes with Node.js |
| **PostgreSQL** | 14.0 | 15.5 | [postgresql.org](https://www.postgresql.org/download/) |
| **Git** | 2.30.0 | Latest | [git-scm.com](https://git-scm.com/) |

### Optional but Recommended

- **Docker Desktop** (for containerized development): [docker.com](https://www.docker.com/)
- **VS Code** (recommended IDE): [code.visualstudio.com](https://code.visualstudio.com/)
- **Postman** or **Insomnia** (API testing): [postman.com](https://www.postman.com/)
- **pgAdmin** (database management): [pgadmin.org](https://www.pgadmin.org/)

### VS Code Extensions (Recommended)

```json
{
  "recommendations": [
    "angular.ng-template",
    "ms-vscode.vscode-typescript-next",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-azuretools.vscode-docker",
    "prisma.prisma",
    "formulahendry.auto-rename-tag"
  ]
}
```

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/angular-sample-app.git
cd angular-sample-app
```

### 2. Install Dependencies

**Option A: Install All at Once (Recommended)**

```bash
npm run install:all
```

This installs dependencies for both frontend and backend with a single command.

**Option B: Install Separately**

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 3. Database Setup

#### Create PostgreSQL Database

```bash
# Method 1: Using psql CLI
psql -U postgres

# In psql:
CREATE DATABASE lms_db;
CREATE USER lms_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE lms_db TO lms_user;
\q

# Method 2: Using createdb utility
createdb -U postgres lms_db
```

#### Verify Database Connection

```bash
psql -U postgres -d lms_db -c "SELECT version();"
```

### 4. Environment Configuration

#### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lms_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:4200
```

**Important Security Notes:**
- Change `JWT_SECRET` to a strong, random string (use a password generator)
- Never commit `.env` file to version control
- Use different secrets for development/staging/production

#### Frontend Environment Configuration (Optional)

The frontend uses `src/environments/environment.ts` for configuration. Default settings work for local development.

For custom API URLs, edit:

```typescript
// src/environments/environment.development.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

### 5. Database Migrations

TypeORM will automatically create tables on first run when `synchronize: true` is set.

**For Development:**
```typescript
// backend/src/config/database.ts
synchronize: process.env.NODE_ENV === 'development'
```

**Warning:** In production, set `synchronize: false` and use proper migrations.

### 6. Seed Sample Data (Optional)

Populate the database with sample courses and users:

```bash
cd backend
npm run seed
cd ..
```

This creates:
- Sample users (student, instructor, admin)
- Sample courses with sections and lessons
- Sample quizzes

---

## Project Structure

### Frontend Structure

```
angular-sample-app/
├── src/
│   ├── app/
│   │   ├── core/                 # Singleton services, guards, interceptors
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts
│   │   │   │   └── admin.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   └── auth.interceptor.ts
│   │   │   └── strategies/
│   │   │       └── selective-preload-strategy.ts
│   │   │
│   │   ├── shared/               # Reusable components and services
│   │   │   ├── components/
│   │   │   │   ├── loading-spinner/
│   │   │   │   ├── confirmation-dialog/
│   │   │   │   ├── file-upload/
│   │   │   │   └── skeleton-course-card/
│   │   │   └── services/
│   │   │       ├── notification.service.ts
│   │   │       └── logger.service.ts
│   │   │
│   │   ├── course/               # Course feature module (lazy-loaded)
│   │   │   ├── components/
│   │   │   │   ├── course-list/
│   │   │   │   ├── course-detail/
│   │   │   │   ├── course-form/
│   │   │   │   ├── player/
│   │   │   │   └── quiz/
│   │   │   ├── services/
│   │   │   │   ├── course.service.ts
│   │   │   │   ├── enrollment.service.ts
│   │   │   │   └── quiz.service.ts
│   │   │   ├── models/
│   │   │   └── course.module.ts
│   │   │
│   │   ├── auth/                 # Authentication module
│   │   │   └── login/
│   │   │
│   │   ├── app.component.ts
│   │   ├── app.module.ts
│   │   └── app-routing.module.ts
│   │
│   ├── assets/                   # Static assets
│   ├── environments/             # Environment configs
│   └── index.html
│
├── backend/                      # Backend source code
├── docs/                         # Documentation
├── angular.json                  # Angular CLI configuration
├── package.json                  # Frontend dependencies
└── tsconfig.json                 # TypeScript configuration
```

### Backend Structure

```
backend/
├── src/
│   ├── app.ts                    # Application entry point
│   │
│   ├── config/
│   │   ├── database.ts          # TypeORM data source
│   │   └── jwt.ts               # JWT configuration
│   │
│   ├── entities/                # TypeORM entities
│   │   ├── User.ts
│   │   ├── Course.ts
│   │   ├── CourseSection.ts
│   │   ├── Lesson.ts
│   │   ├── Enrollment.ts
│   │   ├── UserProgress.ts
│   │   ├── Quiz.ts
│   │   ├── QuizQuestion.ts
│   │   ├── QuizOption.ts
│   │   ├── QuizAttempt.ts
│   │   └── UserAnswer.ts
│   │
│   ├── controllers/             # Route handlers
│   │   ├── authController.ts
│   │   ├── courseController.ts
│   │   ├── curriculumController.ts
│   │   ├── enrollmentController.ts
│   │   ├── progressController.ts
│   │   └── quizController.ts
│   │
│   ├── services/                # Business logic
│   │   ├── authService.ts
│   │   ├── courseService.ts
│   │   ├── curriculumService.ts
│   │   ├── enrollmentService.ts
│   │   ├── progressService.ts
│   │   └── quizService.ts
│   │
│   ├── routes/                  # API route definitions
│   │   ├── authRoutes.ts
│   │   ├── courseRoutes.ts
│   │   ├── curriculumRoutes.ts
│   │   ├── enrollmentRoutes.ts
│   │   ├── progressRoutes.ts
│   │   └── quizRoutes.ts
│   │
│   ├── middleware/              # Custom middleware
│   │   ├── auth.ts             # JWT validation
│   │   └── errorHandler.ts     # Global error handling
│   │
│   └── utils/
│       ├── logger.ts
│       └── seedData.ts
│
├── package.json                 # Backend dependencies
├── tsconfig.json               # TypeScript configuration
└── .env                        # Environment variables (not committed)
```

---

## Development Workflow

### Starting Development Servers

#### Option 1: Start Both Servers Simultaneously (Recommended)

```bash
npm run start:all
```

This starts:
- **Frontend**: http://localhost:4200
- **Backend**: http://localhost:3000

Output is color-coded for easy identification.

#### Option 2: Start Servers Separately

**Terminal 1 - Backend:**
```bash
npm run start:backend
# or
cd backend && npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run start:frontend
# or
npm start
```

### Accessing the Application

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000/api
- **Database**: localhost:5432

### Default Login Credentials (After Seeding)

```
Student Account:
Email: student@example.com
Password: password123

Instructor Account:
Email: instructor@example.com
Password: password123

Admin Account:
Email: admin@example.com
Password: password123
```

---

## Code Standards

### TypeScript

**1. Strict Type Safety**
```typescript
// ✅ Good
function calculateProgress(completed: number, total: number): number {
  return (completed / total) * 100;
}

// ❌ Bad
function calculateProgress(completed: any, total: any): any {
  return (completed / total) * 100;
}
```

**2. Use Interfaces for Data Models**
```typescript
// ✅ Good
export interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
}

// ❌ Bad - Using type aliases for complex objects
export type Course = {
  id: number;
  title: string;
};
```

**3. Descriptive Variable Names**
```typescript
// ✅ Good
const enrolledCourses = userEnrollments.filter(e => e.status === 'active');

// ❌ Bad
const ec = ue.filter(e => e.s === 'a');
```

### Angular Best Practices

**1. Use OnPush Change Detection**
```typescript
@Component({
  selector: 'app-course-card',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CourseCardComponent {
  @Input() course!: Course;
}
```

**2. Unsubscribe from Observables**
```typescript
// ✅ Good - Use async pipe
<div *ngIf="courses$ | async as courses">
  <app-course-card *ngFor="let course of courses" [course]="course"></app-course-card>
</div>

// ✅ Good - Manual unsubscribe
private destroy$ = new Subject<void>();

ngOnInit() {
  this.courseService.courses$
    .pipe(takeUntil(this.destroy$))
    .subscribe(courses => this.courses = courses);
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

**3. Smart/Dumb Component Pattern**
```typescript
// Smart Component (Container)
@Component({
  selector: 'app-course-list',
  template: `<app-course-card
               *ngFor="let course of courses$ | async"
               [course]="course"
               (enroll)="onEnroll($event)">
             </app-course-card>`
})
export class CourseListComponent {
  courses$ = this.courseService.courses$;

  constructor(private courseService: CourseService) {}

  onEnroll(courseId: number) {
    this.enrollmentService.enroll(courseId).subscribe();
  }
}

// Dumb Component (Presentational)
@Component({
  selector: 'app-course-card',
  template: `...`
})
export class CourseCardComponent {
  @Input() course!: Course;
  @Output() enroll = new EventEmitter<number>();
}
```

**4. Use Reactive Forms**
```typescript
// ✅ Good
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe();
    }
  }
}
```

### Backend Best Practices

**1. Layered Architecture**
```
Controller → Service → Repository → Database
```

Each layer has a single responsibility.

**2. Use DTOs for Validation**
```typescript
// dto/create-course.dto.ts
export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  description!: string;

  @IsNumber()
  @Min(0)
  price!: number;
}

// controller
async createCourse(req: Request, res: Response) {
  const dto = plainToClass(CreateCourseDto, req.body);
  const errors = await validate(dto);

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const course = await this.courseService.create(dto);
  res.status(201).json(course);
}
```

**3. Error Handling**
```typescript
// ✅ Good
try {
  const course = await this.courseService.getCourse(id);
  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }
  res.json(course);
} catch (error) {
  next(error); // Pass to error handler middleware
}
```

**4. Async/Await Over Callbacks**
```typescript
// ✅ Good
async getCourse(id: number): Promise<Course> {
  const course = await this.courseRepository.findOne({ where: { id } });
  return course;
}

// ❌ Bad
getCourse(id: number, callback: Function) {
  this.courseRepository.findOne({ where: { id } }, (err, course) => {
    callback(err, course);
  });
}
```

### Git Commit Convention

Follow the **Conventional Commits** specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting (no logic changes)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
git commit -m "feat(course): add course filtering by category"
git commit -m "fix(auth): resolve token expiration issue"
git commit -m "docs(api): update API endpoint documentation"
git commit -m "refactor(quiz): optimize grading algorithm"
```

---

## Common Development Tasks

### 1. Generate Angular Components

```bash
# Generate component
ng generate component course/components/course-card
ng g c course/components/course-card  # shorthand

# Generate service
ng generate service course/services/course-form
ng g s course/services/course-form

# Generate module
ng generate module feature/my-feature --routing
ng g m feature/my-feature --routing

# Generate guard
ng generate guard core/guards/instructor
ng g g core/guards/instructor

# Generate pipe
ng generate pipe shared/pipes/duration
ng g p shared/pipes/duration
```

### 2. Add a New API Endpoint

**Step 1: Create/Update Entity**
```typescript
// backend/src/entities/Rating.ts
@Entity('ratings')
export class Rating {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  courseId!: number;

  @Column()
  userId!: number;

  @Column('int')
  rating!: number;

  @Column('text', { nullable: true })
  review?: string;
}
```

**Step 2: Create Service**
```typescript
// backend/src/services/ratingService.ts
export class RatingService {
  private ratingRepository = AppDataSource.getRepository(Rating);

  async createRating(data: CreateRatingDto): Promise<Rating> {
    const rating = this.ratingRepository.create(data);
    return await this.ratingRepository.save(rating);
  }

  async getCourseRatings(courseId: number): Promise<Rating[]> {
    return await this.ratingRepository.find({ where: { courseId } });
  }
}
```

**Step 3: Create Controller**
```typescript
// backend/src/controllers/ratingController.ts
export class RatingController {
  private ratingService = new RatingService();

  async createRating(req: Request, res: Response, next: NextFunction) {
    try {
      const rating = await this.ratingService.createRating(req.body);
      res.status(201).json(rating);
    } catch (error) {
      next(error);
    }
  }
}
```

**Step 4: Create Routes**
```typescript
// backend/src/routes/ratingRoutes.ts
const router = Router();
const ratingController = new RatingController();

router.post('/', authenticate, (req, res, next) =>
  ratingController.createRating(req, res, next)
);

router.get('/course/:courseId', (req, res, next) =>
  ratingController.getCourseRatings(req, res, next)
);

export default router;
```

**Step 5: Register Routes in app.ts**
```typescript
// backend/src/app.ts
import ratingRoutes from './routes/ratingRoutes';

app.use('/api/ratings', ratingRoutes);
```

### 3. Add New Course Feature to Frontend

**Step 1: Create Model**
```typescript
// src/app/course/models/course.model.ts
export interface Rating {
  id: number;
  courseId: number;
  userId: number;
  rating: number;
  review: string;
  createdAt: Date;
}
```

**Step 2: Create Service**
```typescript
// src/app/course/services/rating.service.ts
@Injectable({
  providedIn: 'root'
})
export class RatingService {
  private apiUrl = `${environment.apiUrl}/ratings`;

  constructor(private http: HttpClient) {}

  createRating(data: CreateRating): Observable<Rating> {
    return this.http.post<Rating>(this.apiUrl, data);
  }

  getCourseRatings(courseId: number): Observable<Rating[]> {
    return this.http.get<Rating[]>(`${this.apiUrl}/course/${courseId}`);
  }
}
```

**Step 3: Create Component**
```bash
ng g c course/components/rating-form
```

```typescript
// rating-form.component.ts
export class RatingFormComponent {
  @Input() courseId!: number;
  @Output() submitted = new EventEmitter<Rating>();

  ratingForm = this.fb.group({
    rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
    review: ['']
  });

  constructor(
    private fb: FormBuilder,
    private ratingService: RatingService
  ) {}

  onSubmit() {
    if (this.ratingForm.valid) {
      this.ratingService.createRating({
        courseId: this.courseId,
        ...this.ratingForm.value
      }).subscribe(rating => this.submitted.emit(rating));
    }
  }
}
```

### 4. Running Tests

**Frontend Tests:**
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
npm run test:e2e:ui       # With UI
npm run test:e2e:headed   # In headed mode
```

**Backend Tests:**
```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### 5. Database Operations

**Inspect Database:**
```bash
psql -U postgres -d lms_db

# List all tables
\dt

# Describe table
\d users

# Query data
SELECT * FROM users;
SELECT * FROM courses WHERE published = true;

# Exit
\q
```

**Reset Database:**
```bash
# Drop and recreate database
psql -U postgres
DROP DATABASE lms_db;
CREATE DATABASE lms_db;
\q

# Restart backend to recreate tables (with synchronize: true)
npm run start:backend
```

### 6. Build for Production

**Frontend:**
```bash
npm run build

# Output: dist/ directory
# Files are optimized, minified, and ready for deployment
```

**Backend:**
```bash
cd backend
npm run build

# Output: backend/dist/ directory
# Run with: npm start
```

---

## Testing

### Unit Testing (Frontend)

**Test Structure:**
```typescript
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
    httpMock.verify();
  });

  it('should fetch courses', () => {
    const mockCourses: Course[] = [
      { id: 1, title: 'Angular Basics', ... }
    ];

    service.getCourses().subscribe(courses => {
      expect(courses.length).toBe(1);
      expect(courses[0].title).toBe('Angular Basics');
    });

    const req = httpMock.expectOne(`${service.apiUrl}/courses`);
    expect(req.request.method).toBe('GET');
    req.flush(mockCourses);
  });
});
```

### Unit Testing (Backend)

**Test Structure:**
```typescript
describe('QuizService', () => {
  let service: QuizService;

  beforeEach(() => {
    service = new QuizService();
  });

  it('should grade quiz correctly', async () => {
    const quiz = {
      id: 1,
      questions: [
        {
          id: 1,
          points: 10,
          options: [
            { id: 1, isCorrect: false },
            { id: 2, isCorrect: true }
          ]
        }
      ]
    };

    const userAnswers = [
      { questionId: 1, selectedOptionIds: [2] }
    ];

    const result = await service.gradeQuiz(quiz, userAnswers);

    expect(result.score).toBe(10);
    expect(result.passed).toBe(true);
  });
});
```

### E2E Testing

```typescript
// e2e/course-enrollment.spec.ts
import { test, expect } from '@playwright/test';

test('user can enroll in course', async ({ page }) => {
  // Login
  await page.goto('http://localhost:4200/login');
  await page.fill('input[name="email"]', 'student@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  // Navigate to courses
  await page.goto('http://localhost:4200/courses');

  // Click on first course
  await page.click('.course-card:first-child');

  // Enroll
  await page.click('button:has-text("Enroll")');

  // Verify enrollment
  await expect(page.locator('text=Enrolled')).toBeVisible();
});
```

---

## Debugging

### Frontend Debugging

**1. Chrome DevTools**
- Press F12 to open DevTools
- Use Sources tab to set breakpoints
- Use Console for logging
- Use Network tab to inspect API calls

**2. Angular DevTools Extension**
- Install Angular DevTools browser extension
- Inspect component tree
- View component properties
- Profile change detection

**3. VS Code Debugging**

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Angular",
      "url": "http://localhost:4200",
      "webRoot": "${workspaceFolder}"
    }
  ]
}
```

Press F5 to start debugging.

### Backend Debugging

**1. VS Code Debugging**

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "program": "${workspaceFolder}/backend/src/app.ts",
      "runtimeArgs": ["-r", "ts-node/register"],
      "cwd": "${workspaceFolder}/backend",
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

**2. Console Logging**
```typescript
console.log('User:', user);
console.error('Error:', error);
console.table(courses);
```

**3. Database Query Logging**

In `backend/src/config/database.ts`:
```typescript
export const AppDataSource = new DataSource({
  // ...
  logging: true, // Log all SQL queries
  logger: 'advanced-console'
});
```

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors

**Error:** `ECONNREFUSED` or `password authentication failed`

**Solution:**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql
# or
pg_isready

# Verify credentials in backend/.env
# Check DB_HOST, DB_PORT, DB_USER, DB_PASSWORD
```

#### 2. Port Already in Use

**Error:** `Port 3000 is already in use`

**Solution:**
```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run start:backend
```

#### 3. Module Not Found Errors

**Error:** `Cannot find module 'xyz'`

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# For backend
cd backend
rm -rf node_modules package-lock.json
npm install
```

#### 4. TypeORM Synchronization Issues

**Error:** Table/column doesn't exist

**Solution:**
```typescript
// backend/src/config/database.ts
// Temporarily enable synchronize
synchronize: true

// Or manually drop and recreate database
```

#### 5. CORS Errors

**Error:** `No 'Access-Control-Allow-Origin' header`

**Solution:**
```typescript
// backend/src/app.ts
// Verify CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:4200'
}));
```

#### 6. JWT Token Errors

**Error:** `jwt malformed` or `invalid signature`

**Solution:**
```bash
# Clear localStorage in browser
localStorage.clear()

# Verify JWT_SECRET is same across restarts
# Check backend/.env file
```

#### 7. Angular Build Errors

**Error:** `Cannot read property 'xxx' of undefined`

**Solution:**
```bash
# Clear Angular cache
rm -rf .angular/cache

# Rebuild
ng build --configuration development
```

---

## Development Tips

### 1. Hot Reload

Both frontend and backend support hot reloading:
- **Frontend**: Angular CLI watches for file changes
- **Backend**: nodemon restarts server on changes

### 2. API Testing with cURL

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"password123"}'

# Get courses (with auth)
curl -X GET http://localhost:3000/api/courses \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Database Seeding

```bash
# Seed database with sample data
cd backend
npm run seed

# Customize seed data in:
# backend/src/utils/seedData.ts
```

### 4. Logging

Use the logger service for consistent logging:

```typescript
// Frontend
this.logger.info('Course loaded', course);
this.logger.error('Failed to load course', error);

// Backend
logger.info('User registered', { userId: user.id });
logger.error('Database error', error);
```

---

## Next Steps

After setting up your development environment:

1. **Explore the Codebase**: Read through existing components and services
2. **Review Documentation**: Check out [API.md](./API.md) and [ARCHITECTURE.md](./ARCHITECTURE.md)
3. **Run Tests**: Ensure all tests pass
4. **Make a Small Change**: Fix a bug or add a small feature to get familiar
5. **Join the Team**: Ask questions and contribute!

---

**Last Updated:** 2024-01-26
