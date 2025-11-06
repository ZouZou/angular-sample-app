# Create Course Module Skill

You are an expert Angular developer helping to create a comprehensive course management feature in this Angular application.

## Your Task

Create a complete course module for this Angular application following the existing architectural patterns. The course module should allow users to:
- View a list of courses
- Create new courses
- Edit existing courses
- View course details
- Delete courses

## Existing Architecture Patterns to Follow

Based on the codebase analysis, follow these patterns:

### 1. Service Pattern
- Use the existing `HttpService` for API calls
- Create a `CourseService` with methods: `getCourses()`, `getCourse(id)`, `createCourse(course)`, `updateCourse(id, course)`, `deleteCourse(id)`
- Use `@Injectable({ providedIn: 'root' })`

### 2. Model/Interface Pattern
Create a `Course` interface with these fields:
```typescript
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
  enrollmentCount?: number;
  rating?: number;
  createdDate?: Date;
}
```

### 3. Component Structure
Create the following components:
- **CourseListComponent**: Display all courses in a responsive grid using Material Cards
- **CourseFormComponent**: Create/Edit course form using Reactive Forms with validation
- **CourseDetailComponent**: Display detailed course information
- Use `standalone: false` for all components (following the app's pattern)

### 4. Routing Pattern
- Create a `CourseRoutingModule` with routes:
  - `/courses` → CourseListComponent
  - `/courses/new` → CourseFormComponent
  - `/courses/:id` → CourseDetailComponent
  - `/courses/:id/edit` → CourseFormComponent
- Add the course routes to the main `app-routing.module.ts`

### 5. Form Pattern (Reactive Forms)
Use FormBuilder with validation:
```typescript
this.courseForm = this.formBuilder.group({
  title: ['', [Validators.required, Validators.minLength(3)]],
  description: ['', [Validators.required, Validators.minLength(10)]],
  instructor: ['', Validators.required],
  duration: [0, [Validators.required, Validators.min(1)]],
  price: [0, [Validators.required, Validators.min(0)]],
  category: ['', Validators.required],
  level: ['Beginner', Validators.required]
});
```

### 6. Material Design Components
Use these Angular Material components:
- `MatCard` for course cards
- `MatButton` for actions
- `MatIcon` for icons
- `MatFormField`, `MatInput` for form inputs
- `MatSelect` for dropdowns
- `MatGridList` for responsive layout
- `MatSnackBar` for notifications

### 7. File Structure
```
src/app/course/
├── course.module.ts
├── course-routing.module.ts
├── models/
│   └── course.interface.ts
├── services/
│   └── course.service.ts
├── components/
│   ├── course-list/
│   │   ├── course-list.component.ts
│   │   ├── course-list.component.html
│   │   └── course-list.component.css
│   ├── course-form/
│   │   ├── course-form.component.ts
│   │   ├── course-form.component.html
│   │   └── course-form.component.css
│   └── course-detail/
│       ├── course-detail.component.ts
│       ├── course-detail.component.html
│       └── course-detail.component.css
```

## Implementation Steps

1. **Create Directory Structure**: Create the `course` folder and subdirectories
2. **Create Course Interface**: Define the Course model
3. **Create Course Service**: Implement CRUD operations using HttpService
4. **Create Components**: Build list, form, and detail components
5. **Create Module and Routing**: Set up CourseModule and routing configuration
6. **Update Main Routes**: Add course routes to app-routing.module.ts
7. **Update Navigation**: Add a link to courses in the navigation component
8. **Test**: Ensure all components are properly integrated

## Important Notes

- Follow the existing code style (e.g., `standalone: false`)
- Use TypeScript strict typing
- Include proper error handling
- Add loading states and user feedback
- Make the UI responsive using Angular CDK's BreakpointObserver
- Use the existing HttpService for API calls (don't create a new HTTP service)
- Add proper form validation with error messages
- Include confirmation dialogs for delete operations

## API Endpoints (Mock)

Assume the following API endpoints exist:
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses` - Create new course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

## Example Component Code Pattern

Follow this structure (based on MotorQuotationComponent):
```typescript
@Component({
  selector: 'app-course-list',
  templateUrl: './course-list.component.html',
  styleUrls: ['./course-list.component.css'],
  standalone: false
})
export class CourseListComponent implements OnInit {
  courses: Course[] = [];
  isLoading = false;

  constructor(
    private courseService: CourseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.isLoading = true;
    this.courseService.getCourses().subscribe({
      next: (courses) => {
        this.courses = courses;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.isLoading = false;
      }
    });
  }

  navigateToDetail(courseId: number): void {
    this.router.navigate(['/courses', courseId]);
  }
}
```

## Deliverables

When this skill is invoked, you should:
1. Create all necessary files with complete implementation
2. Ensure proper imports and dependencies
3. Add the course routes to the main routing module
4. Optionally add a navigation link to access courses
5. Provide a summary of what was created and how to test it

## Testing Instructions to Provide

After implementation, provide these instructions:
1. Run `ng serve` to start the application
2. Navigate to `http://localhost:4200/courses` to view the course list
3. Click "New Course" to create a course
4. Test form validation by submitting empty fields
5. Test view, edit, and delete functionality

---

Now, proceed to implement the complete course management module following these guidelines.
