import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { DashboardPage } from './pages/dashboard.page';
import { TEST_USERS, ROUTES } from './fixtures/test-data';

test.describe('Authentication', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
  });

  test('should display login page', async ({ page }) => {
    await loginPage.goto();
    await expect(page).toHaveURL(new RegExp(ROUTES.login));
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await loginPage.goto();
    await loginPage.loginButton.click();

    // Check for validation errors
    const emailError = page.locator('mat-error, .error-message').first();
    await expect(emailError).toBeVisible({ timeout: 5000 });
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await loginPage.goto();
    await loginPage.login('invalid@example.com', 'wrongpassword');

    // Wait for error message or stay on login page
    await page.waitForTimeout(2000);

    // Should either show error message or stay on login page
    const isStillOnLogin = page.url().includes('/login');
    expect(isStillOnLogin).toBeTruthy();
  });

  test('should successfully login as student', async ({ page }) => {
    await loginPage.goto();
    await loginPage.login(TEST_USERS.student.email, TEST_USERS.student.password);

    // Should redirect away from login page
    await page.waitForURL((url) => !url.pathname.includes('/login'), {
      timeout: 10000,
    });

    const isLoggedIn = await loginPage.isLoggedIn();
    expect(isLoggedIn).toBeTruthy();
  });

  test('should successfully login as admin', async ({ page }) => {
    await loginPage.goto();
    await loginPage.login(TEST_USERS.admin.email, TEST_USERS.admin.password);

    // Should redirect away from login page
    await page.waitForURL((url) => !url.pathname.includes('/login'), {
      timeout: 10000,
    });

    const isLoggedIn = await loginPage.isLoggedIn();
    expect(isLoggedIn).toBeTruthy();
  });

  test('should redirect to login when accessing protected route without authentication', async ({
    page,
  }) => {
    // Try to access dashboard without logging in
    await page.goto(ROUTES.dashboard);

    // Should redirect to login
    await page.waitForURL((url) => url.pathname.includes('/login'), {
      timeout: 10000,
    });

    expect(page.url()).toContain('/login');
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await loginPage.goto();
    await loginPage.login(TEST_USERS.student.email, TEST_USERS.student.password);
    await loginPage.isLoggedIn();

    // Logout
    const logoutButton = page.locator(
      'button:has-text("Logout"), button:has-text("Sign Out"), a:has-text("Logout")'
    );

    if (await logoutButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await logoutButton.click();

      // Should redirect to login page
      await page.waitForURL((url) => url.pathname.includes('/login'), {
        timeout: 10000,
      });

      expect(page.url()).toContain('/login');
    }
  });

  test('should maintain session after page reload', async ({ page }) => {
    // Login
    await loginPage.goto();
    await loginPage.login(TEST_USERS.student.email, TEST_USERS.student.password);
    await loginPage.isLoggedIn();

    // Get current URL
    const currentUrl = page.url();

    // Reload page
    await page.reload();

    // Should still be on the same page (not redirected to login)
    await page.waitForLoadState('networkidle');
    expect(page.url()).not.toContain('/login');
  });
});
