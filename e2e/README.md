# E2E Testing with Playwright

This directory contains end-to-end (E2E) tests for the Angular LMS application using Playwright.

## Overview

The E2E test suite covers the following areas:
- **Authentication**: Login, logout, session management
- **Course Management**: Browsing, creating, editing, deleting courses
- **Quiz Functionality**: Taking quizzes, viewing results, instant feedback
- **User Management**: Profile updates, preferences, enrollment history

## Prerequisites

Before running E2E tests, ensure you have:
1. Node.js and npm installed
2. All dependencies installed: `npm install`
3. Backend server running (if not using webServer in config)
4. Test database configured (if needed)

## Running Tests

### Run all tests (headless mode)
```bash
npm run test:e2e
```

### Run tests with UI Mode (recommended for development)
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Debug tests
```bash
npm run test:e2e:debug
```

### View HTML report
```bash
npm run test:e2e:report
```

### Run specific test file
```bash
npx playwright test auth.spec.ts
```

### Run specific test by name
```bash
npx playwright test -g "should successfully login"
```

### Run tests in specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Structure

```
e2e/
├── fixtures/           # Test data and constants
│   └── test-data.ts   # User credentials, course data, routes
├── pages/             # Page Object Models (POM)
│   ├── login.page.ts
│   ├── dashboard.page.ts
│   ├── courses.page.ts
│   └── course-form.page.ts
├── utils/             # Helper functions
│   ├── auth.helper.ts    # Authentication utilities
│   └── wait.helper.ts    # Wait/synchronization utilities
├── auth.spec.ts           # Authentication tests
├── courses.spec.ts        # Course management tests
├── quiz.spec.ts          # Quiz functionality tests
├── user-management.spec.ts # User management tests
└── README.md             # This file
```

## Page Object Model (POM)

The tests use the Page Object Model pattern to:
- Improve test maintainability
- Reduce code duplication
- Provide clear abstraction of page interactions

Example usage:
```typescript
import { LoginPage } from './pages/login.page';

const loginPage = new LoginPage(page);
await loginPage.goto();
await loginPage.login('user@example.com', 'password123');
```

## Test Data

Test data is centralized in `fixtures/test-data.ts`:

```typescript
import { TEST_USERS, ROUTES } from './fixtures/test-data';

// Use predefined test users
await loginPage.login(TEST_USERS.student.email, TEST_USERS.student.password);

// Use predefined routes
await page.goto(ROUTES.courses);
```

## Authentication Helpers

Quick authentication helpers are available:

```typescript
import { loginAsAdmin, loginAsStudent } from './utils/auth.helper';

// Login as admin
await loginAsAdmin(page);

// Login as student
await loginAsStudent(page);
```

## Configuration

Playwright configuration is in `playwright.config.ts` at the project root:

- **Base URL**: http://localhost:4200
- **Browsers**: Chromium, Firefox, WebKit
- **Retries**: 2 on CI, 0 locally
- **Reporter**: HTML report
- **Web Server**: Automatically starts Angular dev server

## CI/CD Integration

The tests are configured to run in CI environments:
- Retries enabled (2 retries on failure)
- Single worker for stability
- Automatic server startup
- Screenshots on failure
- Trace on first retry

## Writing New Tests

### 1. Create a new spec file
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    // Test implementation
  });
});
```

### 2. Use Page Objects
```typescript
import { LoginPage } from './pages/login.page';
import { loginAsStudent } from './utils/auth.helper';

test('should access protected route', async ({ page }) => {
  await loginAsStudent(page);
  await page.goto('/protected-route');
  expect(page.url()).toContain('/protected-route');
});
```

### 3. Follow best practices
- Use descriptive test names
- Keep tests independent and isolated
- Use appropriate wait strategies
- Clean up test data when needed
- Use page objects for reusability

## Debugging Tests

### Debug a specific test
```bash
npx playwright test auth.spec.ts --debug
```

### Use Playwright Inspector
The `--debug` flag opens Playwright Inspector where you can:
- Step through tests
- Pause and resume execution
- Inspect page elements
- View test logs

### Use trace viewer
```bash
npx playwright show-trace trace.zip
```

## Best Practices

1. **Independence**: Each test should be independent and not rely on others
2. **Cleanup**: Clean up test data to avoid side effects
3. **Waits**: Use proper wait strategies (waitForSelector, waitForLoadState)
4. **Assertions**: Use meaningful assertions with clear error messages
5. **Page Objects**: Use POM for maintainability
6. **Test Data**: Use centralized test data from fixtures
7. **Authentication**: Use auth helpers for consistent login

## Troubleshooting

### Tests fail with timeout
- Increase timeout in `playwright.config.ts`
- Check if the application is running
- Verify network requests complete
- Use `await page.waitForLoadState('networkidle')`

### Element not found
- Check if selector is correct
- Wait for element to be visible
- Verify the page loaded completely
- Use Playwright Inspector to debug

### Authentication issues
- Verify test user credentials exist in database
- Check if authentication tokens are being set
- Ensure backend API is running

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Writing Tests](https://playwright.dev/docs/writing-tests)
- [Locators](https://playwright.dev/docs/locators)
- [Assertions](https://playwright.dev/docs/test-assertions)

## Support

For issues or questions about E2E tests:
1. Check Playwright documentation
2. Review test logs and traces
3. Use `--debug` flag for interactive debugging
4. Check application logs for backend errors
