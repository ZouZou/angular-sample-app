# Angular LMS - Learning Management System

A full-stack Learning Management System built with Angular 20 and Express.js, featuring course management, user enrollment, progress tracking, and automatic quiz grading.

## Features

### Frontend (Angular 20)
- Course browsing and detailed course views
- User authentication (register/login) with JWT
- Course enrollment system
- Interactive course player with lesson viewer
- Quiz system with instant feedback
- Progress tracking dashboard
- Responsive Material Design UI
- Secure HTTP interceptor for automatic token management

### Backend (Express.js + TypeORM)
- RESTful API architecture
- PostgreSQL database with TypeORM
- JWT-based authentication
- Role-based authorization (student, instructor, admin)
- Automatic quiz grading system
- Progress calculation engine
- Comprehensive course and curriculum management
- Secure password hashing with bcrypt

## Tech Stack

**Frontend:**
- Angular 20.3.10
- Angular Material 20.2.11
- RxJS 7.8.2
- TypeScript 5.8

**Backend:**
- Node.js with Express 4.18.2
- TypeORM 0.3.17
- PostgreSQL
- JWT authentication
- bcrypt password hashing

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
```

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

## Project Structure

```
angular-sample-app/
├── src/                          # Frontend source code
│   ├── app/
│   │   ├── core/                 # Core services and interceptors
│   │   │   └── interceptors/
│   │   │       └── auth.interceptor.ts
│   │   ├── course/               # Course feature module
│   │   │   ├── components/       # Course components
│   │   │   ├── models/           # TypeScript interfaces
│   │   │   └── services/         # Frontend services
│   │   ├── app.component.ts
│   │   ├── app.module.ts
│   │   └── app-routing.module.ts
│   ├── environments/             # Environment configurations
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
│   │   ├── controllers/          # Route controllers
│   │   ├── routes/               # API routes
│   │   ├── middleware/           # Custom middleware
│   │   ├── config/               # Configuration files
│   │   └── app.ts                # Express app entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                      # Environment variables
└── package.json                  # Root package.json
```

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

### Frontend Tests

```bash
npm test
```

### Backend Tests

*(To be implemented)*

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

- [ ] Add seed data script for sample courses
- [ ] Implement instructor dashboard
- [ ] Add video lesson support
- [ ] Implement course certificates
- [ ] Add discussion forums
- [ ] Email notifications
- [ ] Payment integration
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
