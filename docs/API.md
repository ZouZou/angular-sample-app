# API Documentation

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://api.yourdomain.com/api`

## Authentication

Most endpoints require authentication using JWT (JSON Web Token). After logging in, include the token in the Authorization header of your requests:

```
Authorization: Bearer <your-jwt-token>
```

The token expires after 7 days (configurable). Upon expiration, the user must login again.

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { /* response data */ }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information"
}
```

## HTTP Status Codes

- `200 OK` - Request succeeded
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Authentication required or token invalid
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists
- `500 Internal Server Error` - Server error

---

## Authentication Endpoints

### Register User

Creates a new user account.

**Endpoint:** `POST /api/auth/register`

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "SecurePassword123",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "user": {
    "id": 1,
    "email": "student@example.com",
    "name": "John Doe",
    "role": "student",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `400` - Validation error (missing fields, invalid email format)
- `409` - Email already exists

---

### Login

Authenticates a user and returns a JWT token.

**Endpoint:** `POST /api/auth/login`

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "SecurePassword123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "email": "student@example.com",
    "name": "John Doe",
    "role": "student",
    "avatarUrl": null
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `401` - Invalid credentials

---

### Get Profile

Gets the authenticated user's profile.

**Endpoint:** `GET /api/auth/me`

**Authentication:** Required

**Response (200):**
```json
{
  "id": 1,
  "email": "student@example.com",
  "name": "John Doe",
  "role": "student",
  "avatarUrl": null,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Errors:**
- `401` - Unauthorized (invalid or missing token)

---

### Update Profile

Updates the authenticated user's profile.

**Endpoint:** `PUT /api/auth/profile`

**Authentication:** Required

**Request Body:**
```json
{
  "name": "John Smith",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

**Response (200):**
```json
{
  "id": 1,
  "email": "student@example.com",
  "name": "John Smith",
  "avatarUrl": "https://example.com/avatar.jpg",
  "role": "student"
}
```

**Errors:**
- `400` - Validation error
- `401` - Unauthorized

---

### Change Password

Changes the authenticated user's password.

**Endpoint:** `POST /api/auth/change-password`

**Authentication:** Required

**Request Body:**
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewSecurePassword456"
}
```

**Response (200):**
```json
{
  "message": "Password changed successfully"
}
```

**Errors:**
- `400` - Validation error (password too short, etc.)
- `401` - Current password incorrect

---

## Course Endpoints

### Get All Courses

Retrieves a list of all published courses.

**Endpoint:** `GET /api/courses`

**Authentication:** Not required

**Query Parameters:**
| Parameter | Type   | Description                    |
|-----------|--------|--------------------------------|
| page      | number | Page number (default: 1)       |
| limit     | number | Items per page (default: 10)   |

**Response (200):**
```json
[
  {
    "id": 1,
    "title": "Angular Fundamentals",
    "description": "Learn Angular from the ground up",
    "instructor": "Jane Smith",
    "duration": 40,
    "price": 49.99,
    "category": "Web Development",
    "level": "Beginner",
    "thumbnailUrl": "https://example.com/thumbnail.jpg",
    "enrollmentCount": 1250,
    "rating": 4.8,
    "published": true,
    "createdAt": "2024-01-10T08:00:00Z"
  }
]
```

---

### Get Course by ID

Retrieves detailed information about a specific course.

**Endpoint:** `GET /api/courses/:id`

**Authentication:** Not required

**Response (200):**
```json
{
  "id": 1,
  "title": "Angular Fundamentals",
  "description": "Learn Angular from the ground up",
  "instructor": "Jane Smith",
  "duration": 40,
  "price": 49.99,
  "category": "Web Development",
  "level": "Beginner",
  "thumbnailUrl": "https://example.com/thumbnail.jpg",
  "bannerUrl": "https://example.com/banner.jpg",
  "enrollmentCount": 1250,
  "rating": 4.8,
  "language": "English",
  "requirements": [
    "Basic HTML knowledge",
    "Basic JavaScript knowledge"
  ],
  "learningOutcomes": [
    "Build single-page applications with Angular",
    "Understand TypeScript fundamentals",
    "Master Angular components and services"
  ],
  "published": true,
  "createdAt": "2024-01-10T08:00:00Z",
  "updatedAt": "2024-01-15T12:00:00Z"
}
```

**Errors:**
- `404` - Course not found

---

### Get Courses by Category

Filters courses by category.

**Endpoint:** `GET /api/courses/category/:category`

**Authentication:** Not required

**Response (200):**
```json
[
  {
    "id": 1,
    "title": "Angular Fundamentals",
    "category": "Web Development",
    ...
  }
]
```

---

### Get Courses by Level

Filters courses by difficulty level.

**Endpoint:** `GET /api/courses/level/:level`

**Authentication:** Not required

**Path Parameters:**
- `level` - One of: `Beginner`, `Intermediate`, `Advanced`

**Response (200):**
```json
[
  {
    "id": 1,
    "title": "Angular Fundamentals",
    "level": "Beginner",
    ...
  }
]
```

---

### Create Course

Creates a new course (instructor/admin only).

**Endpoint:** `POST /api/courses`

**Authentication:** Required (instructor or admin role)

**Request Body:**
```json
{
  "title": "Advanced TypeScript",
  "description": "Master TypeScript for large-scale applications",
  "instructor": "Jane Smith",
  "duration": 60,
  "price": 79.99,
  "category": "Programming",
  "level": "Advanced",
  "thumbnailUrl": "https://example.com/thumbnail.jpg",
  "language": "English",
  "requirements": ["Intermediate TypeScript knowledge"],
  "learningOutcomes": ["Master advanced TypeScript patterns"],
  "published": false
}
```

**Response (201):**
```json
{
  "id": 5,
  "title": "Advanced TypeScript",
  ...
}
```

**Errors:**
- `400` - Validation error
- `401` - Unauthorized
- `403` - Insufficient permissions (not instructor or admin)

---

### Update Course

Updates an existing course.

**Endpoint:** `PUT /api/courses/:id`

**Authentication:** Required (instructor or admin role)

**Request Body:** (same as Create Course)

**Response (200):**
```json
{
  "id": 5,
  "title": "Advanced TypeScript - Updated",
  ...
}
```

**Errors:**
- `400` - Validation error
- `401` - Unauthorized
- `403` - Insufficient permissions
- `404` - Course not found

---

### Delete Course

Deletes a course (admin only).

**Endpoint:** `DELETE /api/courses/:id`

**Authentication:** Required (admin role)

**Response (200):**
```json
{
  "message": "Course deleted successfully"
}
```

**Errors:**
- `401` - Unauthorized
- `403` - Insufficient permissions (not admin)
- `404` - Course not found

---

## Curriculum Endpoints

### Get Course Sections

Retrieves all sections for a specific course.

**Endpoint:** `GET /api/courses/:courseId/sections`

**Authentication:** Not required

**Response (200):**
```json
[
  {
    "id": 1,
    "courseId": 1,
    "title": "Introduction to Angular",
    "description": "Get started with Angular basics",
    "orderIndex": 0,
    "lessons": [
      {
        "id": 1,
        "sectionId": 1,
        "title": "What is Angular?",
        "content": "Angular is a platform and framework...",
        "type": "video",
        "duration": 15,
        "orderIndex": 0,
        "videoUrl": "https://example.com/video1.mp4"
      }
    ]
  }
]
```

---

### Get Section by ID

Retrieves a specific section with its lessons.

**Endpoint:** `GET /api/sections/:id`

**Authentication:** Not required

**Response (200):**
```json
{
  "id": 1,
  "courseId": 1,
  "title": "Introduction to Angular",
  "description": "Get started with Angular basics",
  "orderIndex": 0,
  "lessons": [...]
}
```

---

### Create Section

Creates a new section in a course.

**Endpoint:** `POST /api/sections`

**Authentication:** Required (instructor or admin role)

**Request Body:**
```json
{
  "courseId": 1,
  "title": "Advanced Components",
  "description": "Deep dive into Angular components",
  "orderIndex": 2
}
```

**Response (201):**
```json
{
  "id": 3,
  "courseId": 1,
  "title": "Advanced Components",
  "description": "Deep dive into Angular components",
  "orderIndex": 2
}
```

---

### Update Section

Updates an existing section.

**Endpoint:** `PUT /api/sections/:id`

**Authentication:** Required (instructor or admin role)

**Request Body:** (same as Create Section)

**Response (200):**
```json
{
  "id": 3,
  "title": "Advanced Components - Updated",
  ...
}
```

---

### Delete Section

Deletes a section and all its lessons.

**Endpoint:** `DELETE /api/sections/:id`

**Authentication:** Required (instructor or admin role)

**Response (200):**
```json
{
  "message": "Section deleted successfully"
}
```

---

### Reorder Sections

Reorders sections within a course.

**Endpoint:** `PUT /api/sections/reorder`

**Authentication:** Required (instructor or admin role)

**Request Body:**
```json
{
  "courseId": 1,
  "sectionOrders": [
    { "id": 2, "orderIndex": 0 },
    { "id": 1, "orderIndex": 1 },
    { "id": 3, "orderIndex": 2 }
  ]
}
```

**Response (200):**
```json
{
  "message": "Sections reordered successfully"
}
```

---

### Get Lesson by ID

Retrieves a specific lesson.

**Endpoint:** `GET /api/lessons/:id`

**Authentication:** Not required

**Response (200):**
```json
{
  "id": 1,
  "sectionId": 1,
  "title": "What is Angular?",
  "content": "Angular is a platform and framework for building...",
  "type": "video",
  "duration": 15,
  "orderIndex": 0,
  "videoUrl": "https://example.com/video1.mp4",
  "resources": []
}
```

---

### Create Lesson

Creates a new lesson in a section.

**Endpoint:** `POST /api/lessons`

**Authentication:** Required (instructor or admin role)

**Request Body:**
```json
{
  "sectionId": 1,
  "title": "TypeScript Basics",
  "content": "TypeScript is a typed superset of JavaScript...",
  "type": "article",
  "duration": 10,
  "orderIndex": 5,
  "resources": []
}
```

**Response (201):**
```json
{
  "id": 15,
  "sectionId": 1,
  "title": "TypeScript Basics",
  ...
}
```

---

### Update Lesson

Updates an existing lesson.

**Endpoint:** `PUT /api/lessons/:id`

**Authentication:** Required (instructor or admin role)

**Request Body:** (same as Create Lesson)

**Response (200):**
```json
{
  "id": 15,
  "title": "TypeScript Basics - Updated",
  ...
}
```

---

### Delete Lesson

Deletes a lesson.

**Endpoint:** `DELETE /api/lessons/:id`

**Authentication:** Required (instructor or admin role)

**Response (200):**
```json
{
  "message": "Lesson deleted successfully"
}
```

---

### Reorder Lessons

Reorders lessons within a section.

**Endpoint:** `PUT /api/lessons/reorder`

**Authentication:** Required (instructor or admin role)

**Request Body:**
```json
{
  "sectionId": 1,
  "lessonOrders": [
    { "id": 2, "orderIndex": 0 },
    { "id": 1, "orderIndex": 1 }
  ]
}
```

**Response (200):**
```json
{
  "message": "Lessons reordered successfully"
}
```

---

## Enrollment Endpoints

### Enroll in Course

Enrolls the authenticated user in a course.

**Endpoint:** `POST /api/enrollments`

**Authentication:** Required

**Request Body:**
```json
{
  "courseId": 1
}
```

**Response (201):**
```json
{
  "id": 10,
  "userId": 5,
  "courseId": 1,
  "status": "active",
  "progress": 0,
  "enrolledAt": "2024-01-20T14:30:00Z"
}
```

**Errors:**
- `400` - Already enrolled in course
- `404` - Course not found

---

### Get User Enrollments

Retrieves all enrollments for the authenticated user.

**Endpoint:** `GET /api/enrollments/my-courses`

**Authentication:** Required

**Response (200):**
```json
[
  {
    "id": 10,
    "userId": 5,
    "courseId": 1,
    "status": "active",
    "progress": 35,
    "enrolledAt": "2024-01-20T14:30:00Z",
    "course": {
      "id": 1,
      "title": "Angular Fundamentals",
      "thumbnailUrl": "https://example.com/thumbnail.jpg",
      ...
    }
  }
]
```

---

### Get Enrollment by Course

Gets enrollment for a specific course.

**Endpoint:** `GET /api/enrollments/course/:courseId`

**Authentication:** Required

**Response (200):**
```json
{
  "id": 10,
  "userId": 5,
  "courseId": 1,
  "status": "active",
  "progress": 35,
  "enrolledAt": "2024-01-20T14:30:00Z"
}
```

**Errors:**
- `404` - Not enrolled in this course

---

### Get Enrollment by ID

Gets a specific enrollment.

**Endpoint:** `GET /api/enrollments/:id`

**Authentication:** Required

**Response (200):**
```json
{
  "id": 10,
  "userId": 5,
  "courseId": 1,
  "status": "active",
  "progress": 35,
  "enrolledAt": "2024-01-20T14:30:00Z",
  "completedAt": null
}
```

---

### Update Enrollment Status

Updates the status of an enrollment.

**Endpoint:** `PUT /api/enrollments/:id/status`

**Authentication:** Required

**Request Body:**
```json
{
  "status": "completed"
}
```

**Possible statuses:** `active`, `completed`, `dropped`

**Response (200):**
```json
{
  "id": 10,
  "status": "completed",
  "completedAt": "2024-02-15T18:00:00Z"
}
```

---

### Calculate Progress

Manually triggers progress calculation for an enrollment.

**Endpoint:** `POST /api/enrollments/:id/calculate-progress`

**Authentication:** Required

**Response (200):**
```json
{
  "enrollmentId": 10,
  "progress": 65,
  "completedLessons": 13,
  "totalLessons": 20
}
```

---

### Get Course Enrollments (Admin/Instructor)

Gets all enrollments for a specific course.

**Endpoint:** `GET /api/enrollments/course/:courseId/students`

**Authentication:** Required (instructor or admin role)

**Response (200):**
```json
[
  {
    "id": 10,
    "userId": 5,
    "courseId": 1,
    "status": "active",
    "progress": 35,
    "user": {
      "id": 5,
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
]
```

---

## Progress Endpoints

### Get User Progress

Gets all progress records for a specific enrollment.

**Endpoint:** `GET /api/progress/enrollment/:enrollmentId`

**Authentication:** Required

**Response (200):**
```json
[
  {
    "id": 1,
    "enrollmentId": 10,
    "lessonId": 1,
    "completed": true,
    "timeSpent": 900,
    "notes": "Good introduction to Angular",
    "completedAt": "2024-01-21T10:00:00Z"
  }
]
```

---

### Get Lesson Progress

Gets progress for a specific lesson.

**Endpoint:** `GET /api/progress/lesson/:lessonId`

**Authentication:** Required

**Query Parameters:**
- `enrollmentId` - Required

**Response (200):**
```json
{
  "id": 1,
  "enrollmentId": 10,
  "lessonId": 1,
  "completed": true,
  "timeSpent": 900,
  "notes": "Good introduction to Angular",
  "completedAt": "2024-01-21T10:00:00Z"
}
```

---

### Mark Lesson Complete

Marks a lesson as completed.

**Endpoint:** `POST /api/progress/lesson/complete`

**Authentication:** Required

**Request Body:**
```json
{
  "enrollmentId": 10,
  "lessonId": 1
}
```

**Response (201):**
```json
{
  "id": 1,
  "enrollmentId": 10,
  "lessonId": 1,
  "completed": true,
  "completedAt": "2024-01-21T10:00:00Z"
}
```

---

### Update Lesson Notes

Adds or updates notes for a lesson.

**Endpoint:** `POST /api/progress/lesson/notes`

**Authentication:** Required

**Request Body:**
```json
{
  "enrollmentId": 10,
  "lessonId": 1,
  "notes": "Important: Remember to use async pipe"
}
```

**Response (200):**
```json
{
  "id": 1,
  "enrollmentId": 10,
  "lessonId": 1,
  "notes": "Important: Remember to use async pipe"
}
```

---

### Track Time Spent

Updates the time spent on a lesson.

**Endpoint:** `PUT /api/progress/:id/time`

**Authentication:** Required

**Request Body:**
```json
{
  "timeSpent": 1200
}
```

**Response (200):**
```json
{
  "id": 1,
  "timeSpent": 1200
}
```

---

### Get Progress Statistics

Gets overall progress statistics for the authenticated user.

**Endpoint:** `GET /api/progress/stats`

**Authentication:** Required

**Response (200):**
```json
{
  "totalEnrollments": 5,
  "completedCourses": 2,
  "inProgressCourses": 3,
  "totalLessonsCompleted": 45,
  "totalTimeSpent": 27000,
  "averageProgress": 68
}
```

---

## Quiz Endpoints

### Get Quiz by ID

Retrieves a specific quiz with questions and options.

**Endpoint:** `GET /api/quizzes/:id`

**Authentication:** Required

**Response (200):**
```json
{
  "id": 1,
  "courseId": 1,
  "title": "Angular Fundamentals Quiz",
  "description": "Test your knowledge of Angular basics",
  "passingScore": 70,
  "timeLimit": 30,
  "questions": [
    {
      "id": 1,
      "quizId": 1,
      "questionText": "What is Angular?",
      "questionType": "multiple-choice",
      "points": 10,
      "orderIndex": 0,
      "options": [
        {
          "id": 1,
          "questionId": 1,
          "optionText": "A JavaScript framework",
          "isCorrect": false
        },
        {
          "id": 2,
          "questionId": 1,
          "optionText": "A TypeScript-based web framework",
          "isCorrect": true
        }
      ]
    }
  ]
}
```

---

### Get Course Quizzes

Gets all quizzes for a specific course.

**Endpoint:** `GET /api/quizzes/course/:courseId/quizzes`

**Authentication:** Not required

**Response (200):**
```json
[
  {
    "id": 1,
    "courseId": 1,
    "title": "Angular Fundamentals Quiz",
    "description": "Test your knowledge",
    "passingScore": 70,
    "timeLimit": 30
  }
]
```

---

### Create Quiz

Creates a new quiz (instructor/admin only).

**Endpoint:** `POST /api/quizzes`

**Authentication:** Required (instructor or admin role)

**Request Body:**
```json
{
  "courseId": 1,
  "title": "Advanced Components Quiz",
  "description": "Test your component knowledge",
  "passingScore": 80,
  "timeLimit": 45,
  "questions": [
    {
      "questionText": "What is OnPush change detection?",
      "questionType": "multiple-choice",
      "points": 10,
      "orderIndex": 0,
      "options": [
        {
          "optionText": "A performance optimization strategy",
          "isCorrect": true
        },
        {
          "optionText": "A lifecycle hook",
          "isCorrect": false
        }
      ]
    }
  ]
}
```

**Response (201):**
```json
{
  "id": 5,
  "courseId": 1,
  "title": "Advanced Components Quiz",
  ...
}
```

---

### Start Quiz Attempt

Starts a new quiz attempt.

**Endpoint:** `POST /api/quizzes/attempts/start`

**Authentication:** Required

**Request Body:**
```json
{
  "quizId": 1,
  "enrollmentId": 10
}
```

**Response (201):**
```json
{
  "id": 25,
  "quizId": 1,
  "userId": 5,
  "enrollmentId": 10,
  "startedAt": "2024-01-25T15:00:00Z",
  "status": "in_progress"
}
```

---

### Submit Quiz Attempt

Submits answers for a quiz and receives automatic grading.

**Endpoint:** `POST /api/quizzes/attempts/:id/submit`

**Authentication:** Required

**Request Body:**
```json
{
  "answers": [
    {
      "questionId": 1,
      "selectedOptionIds": [2]
    },
    {
      "questionId": 2,
      "selectedOptionIds": [5, 6]
    }
  ]
}
```

**Response (200):**
```json
{
  "id": 25,
  "quizId": 1,
  "userId": 5,
  "score": 85,
  "maxScore": 100,
  "passed": true,
  "submittedAt": "2024-01-25T15:28:00Z",
  "status": "completed",
  "answers": [
    {
      "questionId": 1,
      "selectedOptionIds": [2],
      "isCorrect": true,
      "pointsEarned": 10
    },
    {
      "questionId": 2,
      "selectedOptionIds": [5, 6],
      "isCorrect": false,
      "pointsEarned": 0
    }
  ]
}
```

---

### Get User Quiz Attempts

Gets all attempts for a specific quiz by the authenticated user.

**Endpoint:** `GET /api/quizzes/attempts/quiz/:quizId/my`

**Authentication:** Required

**Response (200):**
```json
[
  {
    "id": 25,
    "quizId": 1,
    "score": 85,
    "maxScore": 100,
    "passed": true,
    "startedAt": "2024-01-25T15:00:00Z",
    "submittedAt": "2024-01-25T15:28:00Z",
    "status": "completed"
  }
]
```

---

### Get Attempt Details

Gets detailed information about a specific quiz attempt.

**Endpoint:** `GET /api/quizzes/attempts/:id`

**Authentication:** Required

**Response (200):**
```json
{
  "id": 25,
  "quizId": 1,
  "userId": 5,
  "score": 85,
  "maxScore": 100,
  "passed": true,
  "startedAt": "2024-01-25T15:00:00Z",
  "submittedAt": "2024-01-25T15:28:00Z",
  "status": "completed",
  "answers": [...]
}
```

---

### Get Best Attempt

Gets the user's best scoring attempt for a quiz.

**Endpoint:** `GET /api/quizzes/attempts/quiz/:quizId/best`

**Authentication:** Required

**Response (200):**
```json
{
  "id": 25,
  "quizId": 1,
  "score": 85,
  "maxScore": 100,
  "passed": true,
  "submittedAt": "2024-01-25T15:28:00Z"
}
```

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- Authentication endpoints: 5 requests per minute
- General API: 100 requests per minute
- Quiz submissions: 10 requests per minute

Exceeded limits return `429 Too Many Requests`.

## CORS Policy

The API accepts requests from:
- Development: `http://localhost:4200`
- Production: Your configured frontend domain

## API Versioning

The current API version is v1. Future versions will be accessible via `/api/v2/`, etc.

---

**Last Updated:** 2024-01-26
