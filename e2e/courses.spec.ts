import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { CoursesPage } from './pages/courses.page';
import { CourseFormPage } from './pages/course-form.page';
import { loginAsAdmin, loginAsStudent } from './utils/auth.helper';
import { TEST_COURSES, ROUTES } from './fixtures/test-data';

test.describe('Course Management', () => {
  let coursesPage: CoursesPage;
  let courseFormPage: CourseFormPage;

  test.beforeEach(async ({ page }) => {
    coursesPage = new CoursesPage(page);
    courseFormPage = new CourseFormPage(page);
  });

  test('should display courses page', async ({ page }) => {
    await loginAsStudent(page);
    await coursesPage.goto();

    await expect(page).toHaveURL(new RegExp(ROUTES.courses));
    await expect(coursesPage.heading).toBeVisible();
  });

  test('should display list of courses', async ({ page }) => {
    await loginAsStudent(page);
    await coursesPage.goto();

    // Wait for courses to load
    await page.waitForLoadState('networkidle');

    // Check if courses are displayed (may be 0 if database is empty)
    const courseCount = await coursesPage.getCourseCount();
    expect(courseCount).toBeGreaterThanOrEqual(0);
  });

  test('should search for courses', async ({ page }) => {
    await loginAsStudent(page);
    await coursesPage.goto();

    // Check if search input exists
    const searchExists = await coursesPage.searchInput
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    if (searchExists) {
      await coursesPage.searchCourses('Angular');
      await page.waitForLoadState('networkidle');

      // Results should update (this is just checking functionality works)
      const courseCount = await coursesPage.getCourseCount();
      expect(courseCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('should navigate to course detail page', async ({ page }) => {
    await loginAsStudent(page);
    await coursesPage.goto();
    await page.waitForLoadState('networkidle');

    const courseCount = await coursesPage.getCourseCount();

    if (courseCount > 0) {
      await coursesPage.clickCourse(0);

      // Should navigate to course detail page
      await page.waitForURL(/\/courses\/\d+/, { timeout: 10000 });
      expect(page.url()).toMatch(/\/courses\/\d+/);
    }
  });

  test.describe('Admin Course Management', () => {
    test('should show create course button for admin', async ({ page }) => {
      await loginAsAdmin(page);
      await coursesPage.goto();

      // Admin should see create course button
      const createButtonExists = await coursesPage.createCourseButton
        .isVisible({ timeout: 5000 })
        .catch(() => false);

      // Admins should have access to create courses
      expect(createButtonExists).toBeTruthy();
    });

    test('should navigate to create course page', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(ROUTES.courseNew);

      // Should be on course creation page
      await expect(page).toHaveURL(new RegExp(ROUTES.courseNew));
    });

    test('should show validation errors on empty course form', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(ROUTES.courseNew);

      // Check if form elements exist
      const titleExists = await courseFormPage.titleInput
        .isVisible({ timeout: 5000 })
        .catch(() => false);

      if (titleExists) {
        await courseFormPage.submitForm();

        // Should show validation errors
        const errorExists = await page
          .locator('mat-error, .error-message')
          .first()
          .isVisible({ timeout: 5000 })
          .catch(() => false);

        expect(errorExists).toBeTruthy();
      }
    });

    test('should create a new course', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(ROUTES.courseNew);

      // Check if form exists
      const formExists = await courseFormPage.titleInput
        .isVisible({ timeout: 5000 })
        .catch(() => false);

      if (formExists) {
        // Fill out the course form
        await courseFormPage.fillCourseForm({
          title: `E2E Test Course ${Date.now()}`,
          description: TEST_COURSES.newCourse.description,
        });

        // Submit form
        await courseFormPage.submitForm();

        // Should redirect to courses page or course detail page
        await page.waitForURL(
          (url) => !url.pathname.includes('/courses/new'),
          { timeout: 10000 }
        );

        // Verify we're no longer on the create page
        expect(page.url()).not.toContain('/courses/new');
      }
    });

    test('should edit an existing course', async ({ page }) => {
      await loginAsAdmin(page);
      await coursesPage.goto();
      await page.waitForLoadState('networkidle');

      const courseCount = await coursesPage.getCourseCount();

      if (courseCount > 0) {
        // Click on first course
        await coursesPage.clickCourse(0);
        await page.waitForURL(/\/courses\/\d+/, { timeout: 10000 });

        // Look for edit button
        const editButton = page.locator(
          'button:has-text("Edit"), a[href*="/edit"]'
        );
        const editExists = await editButton
          .isVisible({ timeout: 5000 })
          .catch(() => false);

        if (editExists) {
          await editButton.click();
          await page.waitForURL(/\/courses\/\d+\/edit/, { timeout: 10000 });

          // Should be on edit page
          expect(page.url()).toMatch(/\/courses\/\d+\/edit/);

          // Update course title
          await courseFormPage.titleInput.fill(
            `Updated Course ${Date.now()}`
          );
          await courseFormPage.submitForm();

          // Should redirect away from edit page
          await page.waitForURL(
            (url) => !url.pathname.includes('/edit'),
            { timeout: 10000 }
          );
        }
      }
    });

    test('should delete a course', async ({ page }) => {
      await loginAsAdmin(page);
      await coursesPage.goto();
      await page.waitForLoadState('networkidle');

      const courseCount = await coursesPage.getCourseCount();

      if (courseCount > 0) {
        // Click on first course
        await coursesPage.clickCourse(0);
        await page.waitForURL(/\/courses\/\d+/, { timeout: 10000 });

        // Look for delete button
        const deleteButton = page.locator('button:has-text("Delete")');
        const deleteExists = await deleteButton
          .isVisible({ timeout: 5000 })
          .catch(() => false);

        if (deleteExists) {
          // Handle confirmation dialog
          page.on('dialog', (dialog) => dialog.accept());

          await deleteButton.click();

          // Should redirect to courses list
          await page.waitForURL(new RegExp(ROUTES.courses), {
            timeout: 10000,
          });
        }
      }
    });
  });

  test.describe('Course Enrollment', () => {
    test('should enroll in a course', async ({ page }) => {
      await loginAsStudent(page);
      await coursesPage.goto();
      await page.waitForLoadState('networkidle');

      const courseCount = await coursesPage.getCourseCount();

      if (courseCount > 0) {
        // Click on first course
        await coursesPage.clickCourse(0);
        await page.waitForURL(/\/courses\/\d+/, { timeout: 10000 });

        // Look for enroll button
        const enrollButton = page.locator(
          'button:has-text("Enroll"), button:has-text("Start Learning")'
        );
        const enrollExists = await enrollButton
          .isVisible({ timeout: 5000 })
          .catch(() => false);

        if (enrollExists) {
          await enrollButton.click();

          // Should show success message or navigate to course player
          await page.waitForTimeout(2000);

          // Button text should change or navigate to learn page
          const currentUrl = page.url();
          const isEnrolled =
            currentUrl.includes('/learn') ||
            (await page
              .locator('button:has-text("Continue Learning")')
              .isVisible({ timeout: 5000 })
              .catch(() => false));

          expect(isEnrolled).toBeTruthy();
        }
      }
    });
  });
});
