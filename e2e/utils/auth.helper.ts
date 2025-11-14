import { Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { TEST_USERS } from '../fixtures/test-data';

/**
 * Authentication helper functions for E2E tests
 */

export async function loginAsAdmin(page: Page) {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
  await loginPage.isLoggedIn();
}

export async function loginAsStudent(page: Page) {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(TEST_USERS.student.email, TEST_USERS.student.password);
  await loginPage.isLoggedIn();
}

export async function login(page: Page, email: string, password: string) {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(email, password);
  await loginPage.isLoggedIn();
}

export async function logout(page: Page) {
  // Look for logout button in common locations
  const logoutButton = page.locator(
    'button:has-text("Logout"), button:has-text("Sign Out"), a:has-text("Logout")'
  );

  if (await logoutButton.isVisible({ timeout: 5000 }).catch(() => false)) {
    await logoutButton.click();
  }
}

/**
 * Setup authenticated state for faster test execution
 * This saves the authentication state to be reused across tests
 */
export async function setupAuthState(page: Page, role: 'admin' | 'student' = 'student') {
  const user = role === 'admin' ? TEST_USERS.admin : TEST_USERS.student;
  await login(page, user.email, user.password);

  // Wait for authentication to complete
  await page.waitForURL((url) => !url.pathname.includes('/login'), {
    timeout: 10000,
  });
}
