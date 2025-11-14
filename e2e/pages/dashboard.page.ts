import { Page, Locator } from '@playwright/test';
import { ROUTES } from '../fixtures/test-data';

/**
 * Page Object Model for Dashboard Page
 */
export class DashboardPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly coursesLink: Locator;
  readonly userProfileLink: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.locator('h1, h2').first();
    this.coursesLink = page.locator('a[href*="/courses"]').first();
    this.userProfileLink = page.locator('a[href*="/user"]').first();
    this.logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign Out")');
  }

  async goto() {
    await this.page.goto(ROUTES.dashboard);
  }

  async navigateToCourses() {
    await this.coursesLink.click();
    await this.page.waitForURL('**/courses**');
  }

  async logout() {
    await this.logoutButton.click();
  }

  async isOnDashboard() {
    return this.page.url().includes('/dashboard');
  }
}
