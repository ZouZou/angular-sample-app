# LMS Backend API

A comprehensive backend API for the Learning Management System (LMS) built with Express.js, TypeScript, TypeORM, and PostgreSQL.

## Features

- **User Authentication**: JWT-based authentication with bcrypt password hashing
- **Course Management**: Full CRUD operations for courses, sections, and lessons
- **Enrollment System**: Course enrollment and progress tracking
- **Quiz System**: Interactive quizzes with automatic grading and attempt tracking
- **Progress Tracking**: Track user progress per lesson and course
- **RESTful API**: Clean, well-structured API endpoints

## Technology Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt

## Project Structure

```
backend/
├── src/
│   ├── config/           # Database and JWT configuration
│   ├── entities/         # TypeORM entities (database models)
│   ├── controllers/      # Route controllers (TO BE IMPLEMENTED)
│   ├── services/         # Business logic services (TO BE IMPLEMENTED)
│   ├── middleware/       # Authentication and error handling middleware
│   ├── routes/           # API route definitions (TO BE IMPLEMENTED)
│   ├── utils/            # Utility functions and seed data
│   └── app.ts            # Main application file
├── .env                  # Environment variables (create from .env.example)
├── .env.example          # Environment variables template
├── package.json          # Dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE lms_db;
```

### 3. Environment Configuration

Create a `.env` file from the template:

```bash
cp .env.example .env
```

Update the `.env` file with your database credentials:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=lms_db
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password

JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:4200
```

### 4. Run the Application

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Build and run production**:
```bash
npm run build
npm start
```

The server will start on `http://localhost:3000`

## Database Schema

The application uses TypeORM with automatic synchronization in development mode. The following tables will be created:

- **users**: User accounts with authentication
- **courses**: Course information
- **course_sections**: Course sections/modules
- **lessons**: Individual lessons within sections
- **quizzes**: Quiz definitions
- **quiz_questions**: Questions within quizzes
- **quiz_options**: Answer options for questions
- **enrollments**: User course enrollments
- **user_progress**: Lesson completion tracking
- **quiz_attempts**: Quiz attempt records
- **user_answers**: User answers for quiz questions

## API Endpoints (Planned)

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses` - Create course (auth required)
- `PUT /api/courses/:id` - Update course (auth required)
- `DELETE /api/courses/:id` - Delete course (auth required)

### Curriculum
- `GET /api/courses/:id/sections` - Get course sections with lessons
- `POST /api/sections` - Create section (auth required)
- `PUT /api/sections/:id` - Update section (auth required)
- `DELETE /api/sections/:id` - Delete section (auth required)
- `POST /api/lessons` - Create lesson (auth required)
- `PUT /api/lessons/:id` - Update lesson (auth required)
- `DELETE /api/lessons/:id` - Delete lesson (auth required)

### Enrollment
- `POST /api/enrollments` - Enroll in course (auth required)
- `GET /api/enrollments/my-courses` - Get user enrollments (auth required)
- `GET /api/enrollments/:id` - Get enrollment details (auth required)

### Progress
- `GET /api/progress/enrollment/:id` - Get enrollment progress (auth required)
- `POST /api/progress/lesson/complete` - Mark lesson complete (auth required)

### Quizzes
- `GET /api/quizzes/:id` - Get quiz by ID (auth required)
- `GET /api/courses/:id/quizzes` - Get course quizzes
- `POST /api/quiz-attempts/start` - Start quiz attempt (auth required)
- `POST /api/quiz-attempts/:id/submit` - Submit quiz attempt (auth required)
- `GET /api/quiz-attempts/:id` - Get attempt details (auth required)

## Development Status

### ✅ Completed
- Project structure setup
- TypeORM entities for all models
- Database configuration
- JWT authentication configuration
- Authentication middleware
- Error handling middleware
- Main application setup

### 🚧 To Be Implemented
- Authentication controllers and services
- Course management controllers and services
- Curriculum management controllers and services
- Enrollment controllers and services
- Progress tracking controllers and services
- Quiz controllers and services
- API routes
- Seed data script with sample courses
- Input validation
- Unit and integration tests

## Next Steps

1. **Implement Controllers**: Create controller files for each domain (auth, courses, curriculum, etc.)
2. **Implement Services**: Create service files with business logic
3. **Create Routes**: Define API routes and connect to controllers
4. **Seed Data**: Create seed script to populate database with sample courses
5. **Update Frontend**: Update Angular services to use real API endpoints
6. **Testing**: Add unit and integration tests
7. **Deployment**: Deploy to production environment

## Security Considerations

- Passwords are hashed using bcrypt with salt rounds >= 10
- JWT tokens for stateless authentication
- CORS configured for specific origins
- Input validation on all endpoints (to be implemented)
- SQL injection protection via TypeORM parameterized queries
- Environment variables for sensitive data

## Contributing

When implementing new features:

1. Follow the existing project structure
2. Use TypeScript strict mode
3. Implement proper error handling
4. Add authentication where required
5. Validate all inputs
6. Write clean, documented code

## License

ISC
