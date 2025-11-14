---
description: Generate comprehensive project documentation
---

Generate or update comprehensive project documentation including API docs, component docs, architecture diagrams, and developer guides.

## Objective

Create complete, up-to-date documentation for the entire project to improve onboarding, maintenance, and collaboration.

## Usage

```bash
/docs                # Generate all documentation
/docs api            # Generate API documentation only
/docs components     # Generate component documentation
/docs architecture   # Generate architecture docs
/docs readme         # Update README files
```

## Documentation Generation Workflow

### Phase 1: API Documentation 📚

**Generate OpenAPI/Swagger Documentation:**
```typescript
// Use decorators in controllers
@ApiTags('courses')
@Controller('courses')
export class CourseController {
  @Get()
  @ApiOperation({ summary: 'Get all courses' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'List of courses',
    type: [CourseDto]
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCourses(@Query() query: PaginationDto) {
    return this.courseService.getCourses(query);
  }
}
```

**Generated API Documentation:**
```markdown
# API Documentation

## Base URL
- Development: http://localhost:3000/api
- Production: https://api.lms.com

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Courses

#### GET /api/courses
Get a list of all courses with optional filtering and pagination.

**Query Parameters:**
| Parameter | Type   | Required | Description              |
|-----------|--------|----------|--------------------------|
| page      | number | No       | Page number (default: 1) |
| limit     | number | No       | Items per page (default: 20) |
| category  | string | No       | Filter by category       |
| level     | string | No       | Filter by level          |

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Angular Fundamentals",
      "description": "Learn Angular from scratch",
      "instructor": "John Doe",
      "price": 49.99,
      "category": "Programming",
      "level": "Beginner",
      "thumbnailUrl": "https://...",
      "enrollmentCount": 1250,
      "rating": 4.8
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

**Error Responses:**
- 400 Bad Request - Invalid query parameters
- 500 Internal Server Error - Server error

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/courses?page=1&limit=10&category=Programming"
```

#### POST /api/courses
Create a new course (Instructor/Admin only).

**Request Body:**
```json
{
  "title": "Advanced TypeScript",
  "description": "Master TypeScript",
  "category": "Programming",
  "level": "Advanced",
  "price": 79.99,
  "duration": 40
}
```

**Response (201 Created):**
```json
{
  "id": 151,
  "title": "Advanced TypeScript",
  ...
}
```

**Error Responses:**
- 400 Bad Request - Validation error
- 401 Unauthorized - Not authenticated
- 403 Forbidden - Insufficient permissions
```

### Phase 2: Component Documentation 🎨

**Generate Component Showcase (Storybook):**
```bash
npm install --save-dev @storybook/angular
npx storybook init
```

**Component Documentation Template:**
```markdown
# CourseCardComponent

## Overview
Displays course information in a card format with thumbnail, title, price, and rating.

## Usage

```typescript
import { CourseCardComponent } from '@app/course/components';

@Component({
  template: `
    <app-course-card
      [course]="course"
      [showActions]="true"
      (enroll)="onEnroll($event)"
      (viewDetails)="onViewDetails($event)">
    </app-course-card>
  `
})
export class MyComponent {
  course = {
    id: 1,
    title: 'Angular Fundamentals',
    price: 49.99,
    rating: 4.8,
    thumbnailUrl: 'https://...'
  };

  onEnroll(courseId: number) {
    // Handle enrollment
  }

  onViewDetails(courseId: number) {
    // Navigate to course details
  }
}
```

## Inputs

| Input       | Type    | Required | Default | Description                    |
|-------------|---------|----------|---------|--------------------------------|
| course      | Course  | Yes      | -       | Course object to display       |
| showActions | boolean | No       | false   | Show enroll/details buttons    |
| compact     | boolean | No       | false   | Use compact card layout        |

## Outputs

| Output      | Type   | Description                     |
|-------------|--------|---------------------------------|
| enroll      | number | Emitted when enroll button clicked |
| viewDetails | number | Emitted when details button clicked |

## Accessibility
- ARIA labels for all interactive elements
- Keyboard navigation support
- Screen reader friendly
- Color contrast WCAG AA compliant

## Visual Examples

### Default State
![Course Card Default](./docs/images/course-card-default.png)

### Hover State
![Course Card Hover](./docs/images/course-card-hover.png)

### Compact Mode
![Course Card Compact](./docs/images/course-card-compact.png)

## CSS Classes
- `.course-card` - Main container
- `.course-card__image` - Thumbnail image
- `.course-card__content` - Content area
- `.course-card__actions` - Action buttons

## Dependencies
- Angular Material (MatCard, MatButton)
- RxJS for async operations
```

### Phase 3: Architecture Documentation 🏗️

**System Architecture Diagram:**
```markdown
# System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────┐
│           Client (Angular SPA)              │
│  ┌─────────┐  ┌─────────┐  ┌──────────┐   │
│  │  Auth   │  │ Course  │  │   Quiz   │   │
│  │ Module  │  │ Module  │  │  Module  │   │
│  └─────────┘  └─────────┘  └──────────┘   │
└─────────────────────────────────────────────┘
                    │ HTTP/HTTPS
                    ▼
┌─────────────────────────────────────────────┐
│         API Layer (Express.js)              │
│  ┌─────────┐  ┌─────────┐  ┌──────────┐   │
│  │  Auth   │  │ Course  │  │   Quiz   │   │
│  │  API    │  │   API   │  │   API    │   │
│  └─────────┘  └─────────┘  └──────────┘   │
└─────────────────────────────────────────────┘
                    │
      ┌─────────────┼─────────────┐
      ▼             ▼             ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│PostgreSQL│  │  Redis   │  │   AWS    │
│ Database │  │  Cache   │  │    S3    │
└──────────┘  └──────────┘  └──────────┘
```

## Technology Stack

### Frontend
- **Framework:** Angular 20
- **State Management:** RxJS + Services
- **UI Library:** Angular Material 20
- **HTTP Client:** HttpClient
- **Routing:** Angular Router
- **Forms:** Reactive Forms
- **Testing:** Jasmine + Karma

### Backend
- **Runtime:** Node.js 18
- **Framework:** Express.js
- **ORM:** TypeORM
- **Authentication:** JWT + bcrypt
- **Validation:** class-validator
- **Testing:** Jest

### Database
- **Primary:** PostgreSQL 15
- **Cache:** Redis 7
- **File Storage:** AWS S3

### DevOps
- **Containerization:** Docker + Docker Compose
- **CI/CD:** GitHub Actions
- **Hosting:** AWS / DigitalOcean
- **Monitoring:** New Relic / Datadog

## Data Flow

### Course Enrollment Flow
```
User clicks "Enroll" button
    ↓
Frontend validates user authentication
    ↓
POST /api/enrollments
    ↓
Backend validates course availability
    ↓
Create enrollment record in database
    ↓
Send confirmation email
    ↓
Return enrollment data
    ↓
Update UI with enrollment status
```

## Security Architecture

### Authentication Flow
1. User submits credentials
2. Server validates and hashes password
3. Generate JWT access token (15min expiry)
4. Generate refresh token (7 days expiry)
5. Store refresh token in database
6. Return tokens to client
7. Client stores tokens (access in memory, refresh in httpOnly cookie)
8. Subsequent requests include access token in Authorization header
9. On access token expiry, use refresh token to get new access token

### Authorization Layers
- Route Guards (Frontend)
- JWT Middleware (Backend)
- Role-based Access Control (RBAC)
- Permission-based Authorization
- Resource Ownership Validation
```

### Phase 4: Developer Guide 👨‍💻

**Getting Started Guide:**
```markdown
# Developer Setup Guide

## Prerequisites
- Node.js 18+ and npm 9+
- PostgreSQL 15+
- Redis 7+ (optional, for caching)
- Git
- Docker (optional)

## Installation

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/lms-app.git
cd lms-app
```

### 2. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend && npm install
```

### 3. Environment Setup
```bash
# Copy environment templates
cp .env.example .env
cp backend/.env.example backend/.env

# Update with your credentials
nano .env
```

### 4. Database Setup
```bash
# Create database
createdb lms_db

# Run migrations
cd backend && npm run typeorm migration:run

# Seed data (optional)
npm run seed
```

### 5. Start Development Servers
```bash
# Option 1: Start both servers separately
npm run start:frontend  # Runs on http://localhost:4200
npm run start:backend   # Runs on http://localhost:3000

# Option 2: Start both concurrently
npm run start:all
```

## Project Structure

```
angular-sample-app/
├── src/                    # Frontend source
│   ├── app/
│   │   ├── core/          # Core module (singleton services)
│   │   ├── shared/        # Shared components/directives
│   │   ├── course/        # Course feature module
│   │   ├── quiz/          # Quiz feature module
│   │   └── auth/          # Authentication module
│   ├── assets/            # Static assets
│   └── environments/      # Environment configs
├── backend/               # Backend source
│   ├── src/
│   │   ├── controllers/   # API controllers
│   │   ├── services/      # Business logic
│   │   ├── entities/      # TypeORM entities
│   │   ├── middleware/    # Express middleware
│   │   └── migrations/    # Database migrations
└── docs/                  # Documentation
```

## Development Workflow

### Creating a New Feature
1. Create feature branch: `git checkout -b feature/your-feature`
2. Implement frontend components and services
3. Implement backend API endpoints
4. Write unit tests
5. Update documentation
6. Run quality checks: `/lint && /test && /security`
7. Commit and push
8. Create pull request

### Database Changes
1. Update TypeORM entities
2. Generate migration: `/db generate YourMigrationName`
3. Review generated migration
4. Run migration: `/db migrate`
5. Update seed data if needed

### Running Tests
```bash
# Frontend tests
npm run test           # Run once
npm run test:watch     # Watch mode
npm run test:coverage  # With coverage

# Backend tests
cd backend
npm run test
npm run test:e2e      # E2E tests
```

## Common Tasks

### Add a New API Endpoint
1. Create/update controller in `backend/src/controllers/`
2. Add business logic in service
3. Update routes
4. Add validation with decorators
5. Write tests
6. Update API documentation

### Add a New Angular Component
1. Generate component: `ng g c feature/component-name`
2. Implement component logic
3. Add routing if needed
4. Write unit tests
5. Update module imports

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
pg_isready

# Check connection settings in .env
echo $DB_HOST $DB_PORT $DB_NAME
```

### Port Already in Use
```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run start:backend
```

## Code Style Guide

### TypeScript
- Use strict mode
- No `any` types
- Prefer interfaces over types
- Use meaningful variable names
- Comment complex logic

### Angular
- Follow Angular style guide
- Use OnPush change detection
- Unsubscribe from observables
- Use async pipe where possible
- Smart/dumb component pattern

### Git Commits
- Use conventional commits: `type(scope): message`
- Types: feat, fix, docs, style, refactor, test, chore
- Example: `feat(course): add course filtering`
```

### Phase 5: Generate Documentation Files ✍️

**Files to Create/Update:**
1. `/docs/README.md` - Project overview
2. `/docs/API.md` - Complete API reference
3. `/docs/ARCHITECTURE.md` - System architecture
4. `/docs/DEVELOPER_GUIDE.md` - Setup and development
5. `/docs/DEPLOYMENT.md` - Deployment guide
6. `/docs/TESTING.md` - Testing strategies
7. `/docs/SECURITY.md` - Security practices
8. `/docs/CHANGELOG.md` - Version history
9. `README.md` - Updated project README

## Output Format

```markdown
📚 Documentation Generation Complete
=====================================

## Generated Files

✅ /docs/README.md (Updated)
✅ /docs/API.md (Generated from controllers)
✅ /docs/ARCHITECTURE.md (Generated with diagrams)
✅ /docs/DEVELOPER_GUIDE.md (Generated)
✅ /docs/COMPONENTS.md (Generated from components)
✅ README.md (Updated)

## API Documentation

Endpoints Documented: 48
- Authentication: 8 endpoints
- Courses: 12 endpoints
- Enrollments: 6 endpoints
- Quizzes: 10 endpoints
- Users: 6 endpoints
- Payments: 6 endpoints

## Component Documentation

Components Documented: 32
Services Documented: 18
Pipes Documented: 4
Directives Documented: 3

## Coverage

- API Documentation: 100%
- Component Documentation: 87%
- Architecture Diagrams: 5 diagrams
- Code Examples: 145

## Next Steps

1. Review generated documentation for accuracy
2. Add custom sections if needed
3. Set up auto-documentation in CI/CD
4. Share documentation with team
5. Schedule quarterly documentation updates

## Documentation URLs

- API Docs: http://localhost:3000/api/docs
- Component Showcase: http://localhost:6006 (Storybook)
- Architecture: /docs/ARCHITECTURE.md
```

## Integration with Workflow

```bash
# Generate docs after major changes
/docs

# Update API docs only
/docs api

# Before release
/docs && git add docs/ && git commit -m "docs: update documentation"
```

## Success Criteria

✅ All API endpoints documented
✅ All components have usage examples
✅ Architecture diagrams up to date
✅ README files comprehensive
✅ Developer guide current
✅ Deployment guide tested
✅ Security practices documented

---

**Remember:** Good documentation is as important as good code. Update documentation with every major feature or change.
