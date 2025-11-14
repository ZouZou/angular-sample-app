/**
 * Test data fixtures for E2E tests
 */

export const TEST_USERS = {
  admin: {
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
  },
  student: {
    email: 'student@example.com',
    password: 'student123',
    role: 'student',
  },
  newUser: {
    email: 'newuser@example.com',
    password: 'newuser123',
    firstName: 'Test',
    lastName: 'User',
  },
};

export const TEST_COURSES = {
  newCourse: {
    title: 'Introduction to E2E Testing',
    description: 'Learn how to write effective E2E tests with Playwright',
    duration: 120,
    price: 99.99,
    level: 'Beginner',
  },
  existingCourse: {
    id: 1,
    title: 'Angular Fundamentals',
    description: 'Learn Angular basics',
  },
};

export const TEST_QUIZ = {
  newQuiz: {
    title: 'Sample Quiz',
    description: 'Test your knowledge',
    passingScore: 70,
    questions: [
      {
        question: 'What is E2E testing?',
        options: [
          'End-to-End testing',
          'Error-to-Error testing',
          'Entry-to-Exit testing',
          'Evaluate-to-Execute testing',
        ],
        correctAnswer: 0,
      },
    ],
  },
};

export const TIMEOUTS = {
  short: 5000,
  medium: 10000,
  long: 30000,
};

export const ROUTES = {
  login: '/login',
  dashboard: '/dashboard',
  courses: '/courses',
  courseNew: '/courses/new',
  courseDetail: (id: number) => `/courses/${id}`,
  courseEdit: (id: number) => `/courses/${id}/edit`,
  courseLearn: (id: number) => `/courses/${id}/learn`,
  admin: '/admin',
  user: '/user',
};
