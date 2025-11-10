# Create Advanced Course Management System (LMS) Skill

You are an expert Angular developer helping to create a comprehensive Learning Management System (LMS) in this Angular application.

## Your Task

Create a complete LMS course module for this Angular application following the existing architectural patterns. The system should provide:

### Core Features
- View a list of courses with rich imagery
- Create, edit, and delete courses
- View detailed course information
- **Detailed curriculum with sections and lessons**
- **Course registration/enrollment system**
- **Course player to take courses**
- **Interactive quizzes within courses**
- **Quiz results tracking per user**
- **Dynamic image integration from the internet**

## Enhanced Architecture

### 1. Extended Data Models

Create comprehensive interfaces for the LMS:

```typescript
// Course Model
interface Course {
  id?: number;
  title: string;
  description: string;
  instructor: string;
  duration: number; // in hours
  price: number;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  thumbnailUrl?: string;
  bannerUrl?: string;
  enrollmentCount?: number;
  rating?: number;
  createdDate?: Date;
  language?: string;
  requirements?: string[];
  learningOutcomes?: string[];
  published?: boolean;
}

// Curriculum Structure
interface CourseSection {
  id?: number;
  courseId: number;
  title: string;
  description?: string;
  order: number;
  lessons: Lesson[];
}

interface Lesson {
  id?: number;
  sectionId: number;
  title: string;
  description?: string;
  order: number;
  type: 'video' | 'text' | 'quiz' | 'assignment';
  duration?: number; // in minutes
  content?: string;
  videoUrl?: string;
  completed?: boolean;
  quizId?: number;
}

// Quiz System
interface Quiz {
  id?: number;
  lessonId?: number;
  courseId: number;
  title: string;
  description?: string;
  passingScore: number; // percentage
  timeLimit?: number; // in minutes
  questions: QuizQuestion[];
}

interface QuizQuestion {
  id?: number;
  quizId: number;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'multi-select';
  order: number;
  points: number;
  options: QuizOption[];
  explanation?: string;
}

interface QuizOption {
  id?: number;
  questionId: number;
  text: string;
  isCorrect: boolean;
  order: number;
}

// User Progress & Results
interface Enrollment {
  id?: number;
  userId: number;
  courseId: number;
  enrolledDate: Date;
  status: 'active' | 'completed' | 'dropped';
  progress: number; // percentage
  lastAccessedDate?: Date;
  completedDate?: Date;
  certificateUrl?: string;
}

interface UserProgress {
  id?: number;
  userId: number;
  enrollmentId: number;
  lessonId: number;
  completed: boolean;
  completedDate?: Date;
  timeSpent?: number; // in minutes
}

interface QuizAttempt {
  id?: number;
  userId: number;
  enrollmentId: number;
  quizId: number;
  attemptNumber: number;
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  startedAt: Date;
  completedAt?: Date;
  answers: UserAnswer[];
}

interface UserAnswer {
  id?: number;
  attemptId: number;
  questionId: number;
  selectedOptionIds: number[];
  isCorrect: boolean;
  pointsEarned: number;
}

// User Model (if not exists)
interface User {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'student' | 'instructor' | 'admin';
}
```

### 2. Enhanced Service Layer

Create the following services:

```typescript
// CourseService - Extended
@Injectable({ providedIn: 'root' })
export class CourseService {
  // Existing CRUD operations
  getCourses(): Observable<Course[]>
  getCourse(id): Observable<Course>
  createCourse(course): Observable<Course>
  updateCourse(id, course): Observable<Course>
  deleteCourse(id): Observable<void>

  // New methods for images
  searchCourseImages(query: string): Observable<string[]>
  updateCourseImages(courseId: number, images: any): Observable<Course>
}

// CurriculumService
@Injectable({ providedIn: 'root' })
export class CurriculumService {
  getCourseSections(courseId): Observable<CourseSection[]>
  createSection(section): Observable<CourseSection>
  updateSection(id, section): Observable<CourseSection>
  deleteSection(id): Observable<void>
  reorderSections(courseId, sectionIds): Observable<void>

  createLesson(lesson): Observable<Lesson>
  updateLesson(id, lesson): Observable<Lesson>
  deleteLesson(id): Observable<void>
  reorderLessons(sectionId, lessonIds): Observable<void>
}

// EnrollmentService
@Injectable({ providedIn: 'root' })
export class EnrollmentService {
  enrollInCourse(userId, courseId): Observable<Enrollment>
  getEnrollment(userId, courseId): Observable<Enrollment>
  getUserEnrollments(userId): Observable<Enrollment[]>
  getCourseEnrollments(courseId): Observable<Enrollment[]>
  updateEnrollmentStatus(id, status): Observable<Enrollment>
  calculateProgress(enrollmentId): Observable<number>
}

// ProgressService
@Injectable({ providedIn: 'root' })
export class ProgressService {
  getUserProgress(enrollmentId): Observable<UserProgress[]>
  markLessonComplete(userId, enrollmentId, lessonId): Observable<UserProgress>
  getLessonProgress(userId, lessonId): Observable<UserProgress>
  trackTimeSpent(progressId, minutes): Observable<void>
}

// QuizService
@Injectable({ providedIn: 'root' })
export class QuizService {
  getQuiz(id): Observable<Quiz>
  getCourseQuizzes(courseId): Observable<Quiz[]>
  createQuiz(quiz): Observable<Quiz>
  updateQuiz(id, quiz): Observable<Quiz>
  deleteQuiz(id): Observable<void>

  startQuizAttempt(userId, enrollmentId, quizId): Observable<QuizAttempt>
  submitQuizAttempt(attemptId, answers): Observable<QuizAttempt>
  getUserQuizAttempts(userId, quizId): Observable<QuizAttempt[]>
  getBestAttempt(userId, quizId): Observable<QuizAttempt>
}

// ImageService (for fetching images from internet)
@Injectable({ providedIn: 'root' })
export class ImageService {
  searchImages(query: string, count: number): Observable<string[]>
  getPlaceholderImage(category: string): Observable<string>
}
```

### 3. Enhanced Component Structure

Create the following components:

**Existing Components (Enhanced)**
- `CourseListComponent`: Enhanced with better image display
- `CourseFormComponent`: Enhanced with image selector
- `CourseDetailComponent`: Enhanced with curriculum preview and enrollment

**New Components**

**Curriculum Management:**
- `CourseCurriculumComponent`: Manage sections and lessons
- `SectionFormComponent`: Create/edit sections
- `LessonFormComponent`: Create/edit lessons

**Course Taking (Student View):**
- `CoursePlayerComponent`: Main course taking interface
- `LessonViewerComponent`: Display lesson content
- `VideoPlayerComponent`: Video lesson player
- `TextLessonComponent`: Text/article lesson viewer

**Quiz System:**
- `QuizListComponent`: View all quizzes in a course
- `QuizPlayerComponent`: Take quiz interface
- `QuizResultComponent`: Display quiz results
- `QuizReviewComponent`: Review quiz answers
- `QuizManagementComponent`: Create/edit quizzes (instructor)

**Enrollment & Progress:**
- `EnrollmentComponent`: Course enrollment interface
- `MyCoursesComponent`: User's enrolled courses
- `CourseProgressComponent`: Progress tracking dashboard

**Image Management:**
- `ImageSelectorComponent`: Search and select images from internet
- `ImageGalleryComponent`: Display course images

### 4. Extended Routing

```typescript
const routes: Routes = [
  // Course Management
  { path: '', component: CourseListComponent },
  { path: 'new', component: CourseFormComponent },
  { path: 'my-courses', component: MyCoursesComponent },
  { path: ':id', component: CourseDetailComponent },
  { path: ':id/edit', component: CourseFormComponent },

  // Curriculum Management
  { path: ':id/curriculum', component: CourseCurriculumComponent },
  { path: ':id/curriculum/section/new', component: SectionFormComponent },
  { path: ':id/curriculum/section/:sectionId/edit', component: SectionFormComponent },
  { path: ':id/curriculum/lesson/new', component: LessonFormComponent },
  { path: ':id/curriculum/lesson/:lessonId/edit', component: LessonFormComponent },

  // Quiz Management
  { path: ':id/quizzes', component: QuizListComponent },
  { path: ':id/quiz/new', component: QuizManagementComponent },
  { path: ':id/quiz/:quizId/edit', component: QuizManagementComponent },

  // Course Taking
  { path: ':id/enroll', component: EnrollmentComponent },
  { path: ':id/learn', component: CoursePlayerComponent },
  { path: ':id/learn/lesson/:lessonId', component: LessonViewerComponent },
  { path: ':id/learn/quiz/:quizId', component: QuizPlayerComponent },
  { path: ':id/learn/quiz/:quizId/result/:attemptId', component: QuizResultComponent },
  { path: ':id/learn/quiz/:quizId/review/:attemptId', component: QuizReviewComponent },
];
```

### 5. File Structure

```
src/app/course/
├── course.module.ts
├── course-routing.module.ts
│
├── models/
│   ├── course.interface.ts
│   ├── curriculum.interface.ts
│   ├── quiz.interface.ts
│   ├── enrollment.interface.ts
│   ├── progress.interface.ts
│   └── user.interface.ts
│
├── services/
│   ├── course.service.ts
│   ├── curriculum.service.ts
│   ├── enrollment.service.ts
│   ├── progress.service.ts
│   ├── quiz.service.ts
│   └── image.service.ts
│
├── components/
│   ├── course-list/
│   ├── course-form/
│   ├── course-detail/
│   │
│   ├── curriculum/
│   │   ├── course-curriculum/
│   │   ├── section-form/
│   │   └── lesson-form/
│   │
│   ├── player/
│   │   ├── course-player/
│   │   ├── lesson-viewer/
│   │   ├── video-player/
│   │   └── text-lesson/
│   │
│   ├── quiz/
│   │   ├── quiz-list/
│   │   ├── quiz-player/
│   │   ├── quiz-result/
│   │   ├── quiz-review/
│   │   └── quiz-management/
│   │
│   ├── enrollment/
│   │   ├── enrollment/
│   │   ├── my-courses/
│   │   └── course-progress/
│   │
│   └── shared/
│       ├── image-selector/
│       └── image-gallery/
│
└── pipes/
    ├── time-format.pipe.ts
    └── progress-percentage.pipe.ts
```

## Implementation Steps

### Phase 1: Enhanced Course Management with Images
1. Update Course model and service
2. Implement ImageService with mock/placeholder functionality
3. Enhance CourseFormComponent with image selector
4. Update CourseListComponent with better image display
5. Enhance CourseDetailComponent with banner images

### Phase 2: Curriculum Management
1. Create curriculum models and interfaces
2. Implement CurriculumService
3. Create CourseCurriculumComponent with drag-and-drop
4. Create SectionFormComponent
5. Create LessonFormComponent with content types
6. Add curriculum preview to CourseDetailComponent

### Phase 3: Enrollment System
1. Create enrollment models
2. Implement EnrollmentService
3. Create EnrollmentComponent with payment simulation
4. Create MyCoursesComponent
5. Add enrollment button to CourseDetailComponent

### Phase 4: Course Player
1. Create CoursePlayerComponent with sidebar navigation
2. Implement LessonViewerComponent
3. Create VideoPlayerComponent (with HTML5 video or YouTube embed)
4. Create TextLessonComponent
5. Implement progress tracking on lesson completion

### Phase 5: Quiz System
1. Create quiz models and interfaces
2. Implement QuizService
3. Create QuizManagementComponent (instructor view)
4. Create QuizPlayerComponent (student view)
5. Implement quiz submission and grading logic
6. Create QuizResultComponent with score display
7. Create QuizReviewComponent with correct answers

### Phase 6: Progress & Results Tracking
1. Create progress models
2. Implement ProgressService
3. Create CourseProgressComponent with visual indicators
4. Store quiz results in UserAnswer model
5. Display progress in MyCoursesComponent
6. Add certificates for course completion

## Key Features Implementation Details

### 1. Image Integration from Internet

Use placeholder services or implement image search:

```typescript
@Injectable({ providedIn: 'root' })
export class ImageService {
  // Use Unsplash API, Pexels API, or placeholder services
  searchImages(query: string): Observable<string[]> {
    // For demo, use Unsplash Source or similar
    const baseUrl = 'https://source.unsplash.com/800x600/?';
    return of([
      `${baseUrl}${query},1`,
      `${baseUrl}${query},2`,
      `${baseUrl}${query},3`,
    ]);
  }

  // Or use Lorem Picsum for placeholders
  getPlaceholderImage(category: string, width = 800, height = 600): string {
    return `https://picsum.photos/${width}/${height}?random=${category}`;
  }
}
```

### 2. Detailed Curriculum Structure

Implement drag-and-drop for reordering:
- Use Angular CDK Drag and Drop
- Nested structure with sections > lessons
- Visual indicators for lesson types (video, text, quiz)
- Duration estimates per lesson
- Lock/unlock lessons based on prerequisites

### 3. Course Registration

Implement enrollment flow:
- Check if user is already enrolled
- Display enrollment button with price
- Modal/page for enrollment confirmation
- Simulate payment process
- Create enrollment record
- Redirect to course player

### 4. Course Player (Learning Interface)

Build comprehensive learning experience:
- Sidebar with curriculum navigation
- Main content area for lessons
- Progress bar at top
- "Mark as complete" button
- Previous/Next lesson navigation
- Notes section (optional)
- Bookmarks (optional)

### 5. Quiz Implementation

Create interactive quiz system:
- Multiple question types
- Timer (optional)
- Progress indicator during quiz
- Immediate or delayed feedback
- Score calculation
- Store all attempts
- Show best score
- Review mode with explanations

### 6. Quiz Results Storage

Implement comprehensive tracking:
- Store each attempt with timestamp
- Record all user answers
- Track which questions were correct/incorrect
- Calculate score and percentage
- Store time taken
- Allow unlimited attempts or limit them
- Display statistics and trends

## Material Components to Use

Additional Material components for new features:
- `MatStepper` for course player navigation
- `MatExpansionPanel` for curriculum sections
- `MatTabs` for different course views
- `MatDialog` for enrollment, confirmations
- `MatSnackBar` for notifications
- `MatProgressBar` for progress tracking
- `MatBadge` for completion indicators
- `MatChip` for tags and filters
- `MatRadioButton` for quiz single-choice
- `MatCheckbox` for quiz multi-select
- `MatSlider` for video player controls
- Drag and Drop from `@angular/cdk/drag-drop`

## Mock Data Requirements

Provide comprehensive mock data:
- 5-10 courses with rich details
- 3-5 sections per course
- 3-8 lessons per section
- 2-5 quizzes per course
- 5-10 questions per quiz
- Sample enrollments
- Sample progress records
- Sample quiz attempts

## API Endpoints (Mock)

Extend API endpoints:

**Courses:**
- `GET /api/courses`
- `GET /api/courses/:id`
- `POST /api/courses`
- `PUT /api/courses/:id`
- `DELETE /api/courses/:id`

**Curriculum:**
- `GET /api/courses/:id/sections`
- `POST /api/sections`
- `PUT /api/sections/:id`
- `DELETE /api/sections/:id`
- `POST /api/lessons`
- `PUT /api/lessons/:id`
- `DELETE /api/lessons/:id`

**Enrollment:**
- `POST /api/enrollments`
- `GET /api/enrollments/user/:userId`
- `GET /api/enrollments/course/:courseId`
- `GET /api/enrollments/:id`

**Progress:**
- `GET /api/progress/enrollment/:enrollmentId`
- `POST /api/progress`
- `PUT /api/progress/:id`

**Quizzes:**
- `GET /api/courses/:id/quizzes`
- `GET /api/quizzes/:id`
- `POST /api/quizzes`
- `PUT /api/quizzes/:id`
- `DELETE /api/quizzes/:id`
- `POST /api/quiz-attempts`
- `PUT /api/quiz-attempts/:id`
- `GET /api/quiz-attempts/user/:userId/quiz/:quizId`

**Images:**
- `GET /api/images/search?q={query}`
- `GET /api/images/placeholder?category={category}`

## Important Implementation Notes

### User Authentication
- Assume a user authentication system exists
- Create a mock `AuthService` if needed
- Store current user ID in localStorage or service
- Use mock user for development

### State Management
- Consider using RxJS BehaviorSubject for shared state
- Store enrollment state
- Track current lesson
- Cache quiz results

### Performance Considerations
- Lazy load course content
- Cache curriculum data
- Optimize image loading
- Implement virtual scrolling for long lists

### Responsive Design
- Mobile-first approach
- Collapsible sidebar on mobile
- Touch-friendly quiz interface
- Responsive video player

### Accessibility
- ARIA labels for all interactive elements
- Keyboard navigation support
- Screen reader friendly
- Color contrast compliance

### Error Handling
- Network error messages
- Graceful degradation
- Retry mechanisms
- Offline support considerations

## Testing Guidelines

After implementation, test:
1. **Course Management**: Create, edit, delete courses with images
2. **Curriculum**: Add sections and lessons, reorder them
3. **Enrollment**: Enroll in a course
4. **Course Player**: Navigate through lessons
5. **Video Lessons**: Play videos
6. **Text Lessons**: Read content, mark complete
7. **Quizzes**: Take quiz, submit, view results
8. **Progress**: Check progress updates in real-time
9. **Multiple Attempts**: Take quiz multiple times
10. **Quiz Review**: Review answers with explanations
11. **My Courses**: View all enrolled courses
12. **Image Selection**: Search and select images

## Deliverables

When this skill is invoked, you should:
1. Create all models and interfaces
2. Implement all services with mock data
3. Create all components with full functionality
4. Set up routing with all paths
5. Add necessary Material modules
6. Include comprehensive mock data
7. Update navigation menu
8. Build and test the application
9. Provide detailed usage instructions

## Visual Design Guidelines

### Course List
- Card grid with large images
- Overlay with course info on hover
- Quick stats (duration, students, rating)
- Clear CTA buttons

### Course Detail
- Hero banner with course image
- Tabbed interface (Overview, Curriculum, Instructor, Reviews)
- Prominent enroll button
- Curriculum preview with expandable sections

### Course Player
- Split view: sidebar (30%) + content (70%)
- Sticky progress bar at top
- Clear lesson navigation
- Completion checkmarks

### Quiz Interface
- Clean, focused design
- One question at a time or all questions
- Clear timer display (if timed)
- Progress indicator
- Confidence in submit button

### Results Page
- Large score display
- Pass/fail indicator
- Detailed breakdown by question
- Retry button
- Review answers button

---

## Implementation Status

### ✅ Completed Frontend Components

**Models:**
- ✅ Extended Course interface with all LMS fields
- ✅ Curriculum interfaces (CourseSection, Lesson)
- ✅ Quiz interfaces (Quiz, QuizQuestion, QuizOption, QuizAttempt, UserAnswer)
- ✅ Enrollment interface
- ✅ Progress interface (UserProgress)
- ✅ User interface

**Services:**
- ✅ CourseService with mock data (3 courses with proper images)
- ✅ CurriculumService with complete Angular course (5 sections, 20 lessons)
- ✅ QuizService with 4 complete quizzes
- ✅ EnrollmentService with enrollment management
- ✅ ProgressService with lesson completion tracking
- ✅ AuthService with mock authentication
- ✅ ImageService (basic placeholder implementation)

**Components:**
- ✅ CourseListComponent - Enhanced with thumbnail images
- ✅ CourseFormComponent - Basic CRUD functionality
- ✅ CourseDetailComponent - Enhanced with:
  - Banner images
  - Curriculum display with accordion
  - Enrollment status and buttons
  - Course statistics
- ✅ CoursePlayerComponent - Complete learning interface
- ✅ LessonViewerComponent - Video and text lesson display
- ✅ QuizPlayerComponent - Interactive quiz taking
- ✅ QuizResultComponent - Results display with statistics

**Additional Features:**
- ✅ MarkdownPipe for text content rendering
- ✅ Proper image URLs (Unsplash)
- ✅ Responsive design for all components
- ✅ Material Design integration
- ✅ Curriculum summary statistics
- ✅ Progress tracking per lesson

### 🚧 Backend Implementation Required

The frontend is complete with mock data. Now we need to build a real backend API to:

1. **Replace Mock Data** - Transition from mock services to real API calls
2. **User Authentication** - Implement real login/registration system
3. **Data Persistence** - Store courses, enrollments, progress, and quiz results
4. **API Endpoints** - Create RESTful API for all LMS operations

---

## Backend Implementation Guide

### Technology Stack

**Recommended Stack:**
- **Runtime:** Node.js with Express.js or NestJS
- **Database:** PostgreSQL or MongoDB
- **ORM:** TypeORM (PostgreSQL) or Mongoose (MongoDB)
- **Authentication:** JWT (JSON Web Tokens)
- **File Storage:** Local storage or cloud (AWS S3, Cloudinary)

### Database Schema

#### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500),
  role VARCHAR(50) DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Courses Table
```sql
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructor VARCHAR(255),
  duration INTEGER,
  price DECIMAL(10,2),
  category VARCHAR(100),
  level VARCHAR(50),
  thumbnail_url VARCHAR(500),
  banner_url VARCHAR(500),
  enrollment_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2),
  language VARCHAR(50),
  requirements TEXT[],
  learning_outcomes TEXT[],
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Course Sections Table
```sql
CREATE TABLE course_sections (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  order_number INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Lessons Table
```sql
CREATE TABLE lessons (
  id SERIAL PRIMARY KEY,
  section_id INTEGER REFERENCES course_sections(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  order_number INTEGER NOT NULL,
  duration INTEGER,
  content TEXT,
  video_url VARCHAR(500),
  quiz_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Quizzes Table
```sql
CREATE TABLE quizzes (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id INTEGER REFERENCES lessons(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  passing_score INTEGER DEFAULT 70,
  time_limit INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Quiz Questions Table
```sql
CREATE TABLE quiz_questions (
  id SERIAL PRIMARY KEY,
  quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  order_number INTEGER NOT NULL,
  points INTEGER DEFAULT 1,
  explanation TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Quiz Options Table
```sql
CREATE TABLE quiz_options (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES quiz_questions(id) ON DELETE CASCADE,
  text VARCHAR(500) NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  order_number INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Enrollments Table
```sql
CREATE TABLE enrollments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'active',
  progress DECIMAL(5,2) DEFAULT 0,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_accessed_at TIMESTAMP,
  completed_at TIMESTAMP,
  certificate_url VARCHAR(500),
  UNIQUE(user_id, course_id)
);
```

#### User Progress Table
```sql
CREATE TABLE user_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  enrollment_id INTEGER REFERENCES enrollments(id) ON DELETE CASCADE,
  lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  time_spent INTEGER DEFAULT 0,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, lesson_id)
);
```

#### Quiz Attempts Table
```sql
CREATE TABLE quiz_attempts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  enrollment_id INTEGER REFERENCES enrollments(id) ON DELETE CASCADE,
  quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL,
  score INTEGER NOT NULL,
  total_points INTEGER NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  passed BOOLEAN NOT NULL,
  started_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### User Answers Table
```sql
CREATE TABLE user_answers (
  id SERIAL PRIMARY KEY,
  attempt_id INTEGER REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  question_id INTEGER REFERENCES quiz_questions(id) ON DELETE CASCADE,
  selected_option_ids INTEGER[] NOT NULL,
  is_correct BOOLEAN NOT NULL,
  points_earned INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Backend API Endpoints

#### Authentication Endpoints
```
POST   /api/auth/register       - Register new user
POST   /api/auth/login          - Login user
POST   /api/auth/logout         - Logout user
GET    /api/auth/me             - Get current user
PUT    /api/auth/profile        - Update user profile
POST   /api/auth/change-password - Change password
POST   /api/auth/forgot-password - Request password reset
POST   /api/auth/reset-password - Reset password with token
```

#### Course Management Endpoints
```
GET    /api/courses             - Get all courses (with filters)
GET    /api/courses/:id         - Get course by ID
POST   /api/courses             - Create new course (auth required)
PUT    /api/courses/:id         - Update course (auth required)
DELETE /api/courses/:id         - Delete course (auth required)
GET    /api/courses/:id/curriculum - Get full curriculum
```

#### Curriculum Management Endpoints
```
GET    /api/courses/:id/sections    - Get course sections
POST   /api/sections                - Create section (auth required)
PUT    /api/sections/:id            - Update section (auth required)
DELETE /api/sections/:id            - Delete section (auth required)
PUT    /api/sections/reorder        - Reorder sections (auth required)

POST   /api/lessons                 - Create lesson (auth required)
PUT    /api/lessons/:id             - Update lesson (auth required)
DELETE /api/lessons/:id             - Delete lesson (auth required)
PUT    /api/lessons/reorder         - Reorder lessons (auth required)
```

#### Enrollment Endpoints
```
POST   /api/enrollments            - Enroll in course (auth required)
GET    /api/enrollments/my-courses - Get user's enrollments (auth required)
GET    /api/enrollments/:id        - Get enrollment details (auth required)
PUT    /api/enrollments/:id/status - Update enrollment status (auth required)
GET    /api/enrollments/course/:courseId/students - Get course enrollments (admin)
```

#### Progress Tracking Endpoints
```
GET    /api/progress/enrollment/:id    - Get progress for enrollment (auth required)
POST   /api/progress/lesson/complete   - Mark lesson complete (auth required)
PUT    /api/progress/:id/time          - Update time spent (auth required)
GET    /api/progress/stats             - Get user progress stats (auth required)
```

#### Quiz Endpoints
```
GET    /api/quizzes/:id                    - Get quiz by ID (auth required)
GET    /api/courses/:id/quizzes            - Get course quizzes
POST   /api/quizzes                        - Create quiz (auth required, instructor)
PUT    /api/quizzes/:id                    - Update quiz (auth required, instructor)
DELETE /api/quizzes/:id                    - Delete quiz (auth required, instructor)

POST   /api/quiz-attempts/start            - Start quiz attempt (auth required)
POST   /api/quiz-attempts/:id/submit       - Submit quiz attempt (auth required)
GET    /api/quiz-attempts/quiz/:quizId/my  - Get user's attempts (auth required)
GET    /api/quiz-attempts/:id              - Get attempt details (auth required)
GET    /api/quiz-attempts/:id/review       - Get attempt with answers (auth required)
```

### Backend Implementation Steps

#### Step 1: Project Setup
```bash
# Create backend directory
mkdir backend
cd backend

# Initialize Node.js project
npm init -y

# Install dependencies
npm install express cors dotenv bcrypt jsonwebtoken
npm install pg typeorm reflect-metadata
npm install --save-dev @types/node @types/express typescript ts-node nodemon

# Initialize TypeScript
npx tsc --init
```

#### Step 2: Project Structure
```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   └── jwt.ts
│   ├── entities/
│   │   ├── User.ts
│   │   ├── Course.ts
│   │   ├── CourseSection.ts
│   │   ├── Lesson.ts
│   │   ├── Quiz.ts
│   │   ├── QuizQuestion.ts
│   │   ├── QuizOption.ts
│   │   ├── Enrollment.ts
│   │   ├── UserProgress.ts
│   │   ├── QuizAttempt.ts
│   │   └── UserAnswer.ts
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── courseController.ts
│   │   ├── curriculumController.ts
│   │   ├── enrollmentController.ts
│   │   ├── progressController.ts
│   │   └── quizController.ts
│   ├── services/
│   │   ├── authService.ts
│   │   ├── courseService.ts
│   │   ├── curriculumService.ts
│   │   ├── enrollmentService.ts
│   │   ├── progressService.ts
│   │   └── quizService.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   └── validator.ts
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── courseRoutes.ts
│   │   ├── curriculumRoutes.ts
│   │   ├── enrollmentRoutes.ts
│   │   ├── progressRoutes.ts
│   │   └── quizRoutes.ts
│   ├── utils/
│   │   ├── helpers.ts
│   │   └── seedData.ts
│   └── app.ts
├── .env
├── .gitignore
├── package.json
└── tsconfig.json
```

#### Step 3: Update Angular Services

After backend is created, update Angular services to use real API:

```typescript
// Example: course.service.ts
getCourses(): Observable<Course[]> {
  return this.http.get<Course[]>(`${this.apiUrl}/courses`);
}

// Add authentication headers
private getHeaders(): HttpHeaders {
  const token = localStorage.getItem('token');
  return new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });
}
```

### Environment Variables

Create `.env` file:
```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lms_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:4200
```

### Security Considerations

1. **Password Hashing:** Use bcrypt with salt rounds >= 10
2. **JWT Tokens:** Store securely, use short expiration times
3. **Input Validation:** Validate all inputs on backend
4. **SQL Injection:** Use parameterized queries (TypeORM handles this)
5. **CORS:** Configure properly for your frontend domain
6. **Rate Limiting:** Implement rate limiting for API endpoints
7. **File Upload:** Validate file types and sizes

### Testing Backend

Create test data using seed script:
```typescript
// src/utils/seedData.ts
export async function seedDatabase() {
  // Create test users
  // Create courses with curriculum
  // Create quizzes
  // Create sample enrollments
}
```

### Deployment Considerations

1. **Database:** Set up PostgreSQL on cloud (Heroku, AWS RDS, DigitalOcean)
2. **Backend API:** Deploy to Heroku, AWS, DigitalOcean, or Vercel
3. **Frontend:** Deploy to Netlify, Vercel, or AWS S3
4. **Environment Variables:** Configure properly for production
5. **HTTPS:** Ensure SSL certificates are in place
6. **Monitoring:** Set up logging and error tracking

---

Now, proceed to implement the backend API following these comprehensive guidelines, then integrate it with the existing frontend.
