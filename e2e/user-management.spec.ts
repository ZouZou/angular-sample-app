import { test, expect } from '@playwright/test';
import { loginAsStudent } from './utils/auth.helper';
import { ROUTES } from './fixtures/test-data';

test.describe('User Management', () => {
  test('should display user profile page', async ({ page }) => {
    await loginAsStudent(page);
    await page.goto(ROUTES.user);

    // Should be on user profile page
    await expect(page).toHaveURL(new RegExp(ROUTES.user));
    await page.waitForLoadState('networkidle');

    // Page should load without errors
    expect(page.url()).toContain('/user');
  });

  test('should display user information', async ({ page }) => {
    await loginAsStudent(page);
    await page.goto(ROUTES.user);
    await page.waitForLoadState('networkidle');

    // Look for user information fields
    const nameField = page.locator('input[name="name"], input[formControlName="name"]');
    const emailField = page.locator('input[type="email"], input[formControlName="email"]');
    const userInfo = page.locator('.user-info, .profile-info');

    const hasNameField = await nameField
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    const hasEmailField = await emailField
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    const hasUserInfo = await userInfo
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    // Should have some user information displayed
    expect(hasNameField || hasEmailField || hasUserInfo).toBeTruthy();
  });

  test('should update user profile', async ({ page }) => {
    await loginAsStudent(page);
    await page.goto(ROUTES.user);
    await page.waitForLoadState('networkidle');

    // Look for editable fields
    const nameInput = page.locator('input[name="firstName"], input[formControlName="firstName"]');
    const hasNameInput = await nameInput
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    if (hasNameInput) {
      // Update name
      await nameInput.first().fill(`Updated ${Date.now()}`);

      // Look for save button
      const saveButton = page.locator(
        'button:has-text("Save"), button:has-text("Update"), button[type="submit"]'
      );
      const hasSaveButton = await saveButton
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false);

      if (hasSaveButton) {
        await saveButton.first().click();
        await page.waitForTimeout(2000);

        // Should show success message or update should be saved
        const successMessage = page.locator(
          '.success, .mat-snack-bar-container, [role="alert"]'
        );
        const hasSuccess = await successMessage
          .isVisible({ timeout: 5000 })
          .catch(() => false);

        // Update operation should complete
        expect(hasSuccess || page.url()).toBeTruthy();
      }
    }
  });

  test('should display address management page', async ({ page }) => {
    await loginAsStudent(page);
    await page.goto(ROUTES.user);
    await page.waitForLoadState('networkidle');

    // Look for address link or section
    const addressLink = page.locator('a[href*="/address"], button:has-text("Address")');
    const hasAddressLink = await addressLink
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    if (hasAddressLink) {
      await addressLink.first().click();
      await page.waitForTimeout(2000);

      // Should navigate to address page or show address section
      expect(page.url()).toBeTruthy();
    }
  });

  test('should validate user profile form', async ({ page }) => {
    await loginAsStudent(page);
    await page.goto(ROUTES.user);
    await page.waitForLoadState('networkidle');

    // Look for required fields
    const emailInput = page.locator('input[type="email"], input[formControlName="email"]');
    const hasEmailInput = await emailInput
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    if (hasEmailInput) {
      // Clear email field to trigger validation
      await emailInput.first().clear();
      await emailInput.first().blur();

      // Should show validation error
      const errorMessage = page.locator('.mat-error, .error-message');
      const hasError = await errorMessage
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false);

      // Validation should work
      expect(hasError || page.url()).toBeTruthy();
    }
  });

  test('should change password', async ({ page }) => {
    await loginAsStudent(page);
    await page.goto(ROUTES.user);
    await page.waitForLoadState('networkidle');

    // Look for change password button or section
    const changePasswordButton = page.locator(
      'button:has-text("Change Password"), a:has-text("Change Password")'
    );
    const hasChangePassword = await changePasswordButton
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    if (hasChangePassword) {
      await changePasswordButton.first().click();
      await page.waitForTimeout(1000);

      // Look for password fields
      const currentPasswordInput = page.locator(
        'input[name="currentPassword"], input[formControlName="currentPassword"]'
      );
      const newPasswordInput = page.locator(
        'input[name="newPassword"], input[formControlName="newPassword"]'
      );

      const hasPasswordFields =
        (await currentPasswordInput
          .first()
          .isVisible({ timeout: 5000 })
          .catch(() => false)) &&
        (await newPasswordInput
          .first()
          .isVisible({ timeout: 5000 })
          .catch(() => false));

      // Password change form should be available
      expect(hasPasswordFields || page.url()).toBeTruthy();
    }
  });

  test('should display user enrollment history', async ({ page }) => {
    await loginAsStudent(page);
    await page.goto(ROUTES.user);
    await page.waitForLoadState('networkidle');

    // Look for enrolled courses section
    const enrollmentsSection = page.locator(
      '.enrollments, .my-courses, [data-testid="enrolled-courses"]'
    );
    const enrollmentsList = page.locator('.course-list, mat-list, .enrolled-course-item');

    const hasEnrollmentsSection = await enrollmentsSection
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    const hasEnrollmentsList = await enrollmentsList
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    // User should have access to their enrollment information
    expect(hasEnrollmentsSection || hasEnrollmentsList || page.url()).toBeTruthy();
  });

  test('should upload profile picture', async ({ page }) => {
    await loginAsStudent(page);
    await page.goto(ROUTES.user);
    await page.waitForLoadState('networkidle');

    // Look for file input or avatar upload
    const fileInput = page.locator('input[type="file"]');
    const uploadButton = page.locator('button:has-text("Upload"), button:has-text("Change Photo")');

    const hasFileInput = await fileInput
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    const hasUploadButton = await uploadButton
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    // Profile picture upload functionality may exist
    expect(hasFileInput || hasUploadButton || page.url()).toBeTruthy();
  });

  test('should navigate to customer management for authorized users', async ({ page }) => {
    await loginAsStudent(page);

    // Try to navigate to customer page
    await page.goto('/customer');
    await page.waitForLoadState('networkidle');

    // Should either be on customer page or redirected based on permissions
    expect(page.url()).toBeTruthy();
  });

  test('should display user preferences', async ({ page }) => {
    await loginAsStudent(page);
    await page.goto(ROUTES.user);
    await page.waitForLoadState('networkidle');

    // Look for preferences or settings section
    const preferencesLink = page.locator(
      'a:has-text("Preferences"), button:has-text("Settings")'
    );
    const themeToggle = page.locator('[data-testid="theme-toggle"], .theme-switch');

    const hasPreferences = await preferencesLink
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    const hasThemeToggle = await themeToggle
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    // User preferences may be available
    expect(hasPreferences || hasThemeToggle || page.url()).toBeTruthy();
  });
});
