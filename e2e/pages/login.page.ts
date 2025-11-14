import { Page, Locator } from '@playwright/test';
import { ROUTES } from '../fixtures/test-data';

/**
 * Page Object Model for Login Page
 */
export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[type="email"], input[formControlName="email"]');
    this.passwordInput = page.locator('input[type="password"], input[formControlName="password"]');
    this.loginButton = page.locator('button[type="submit"]').first();
    this.errorMessage = page.locator('.error-message, .mat-error, [role="alert"]');
  }

  async goto() {
    await this.page.goto(ROUTES.login);
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async isLoggedIn() {
    // Wait for navigation away from login page
    await this.page.waitForURL((url) => !url.pathname.includes('/login'), {
      timeout: 10000,
    });
    return !this.page.url().includes('/login');
  }

  async getErrorMessage() {
    return await this.errorMessage.textContent();
  }
}
