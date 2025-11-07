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

Now, proceed to implement the complete Learning Management System following these comprehensive guidelines.
