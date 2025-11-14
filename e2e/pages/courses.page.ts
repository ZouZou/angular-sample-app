import { Page, Locator } from '@playwright/test';
import { ROUTES } from '../fixtures/test-data';

/**
 * Page Object Model for Courses Page
 */
export class CoursesPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly courseCards: Locator;
  readonly createCourseButton: Locator;
  readonly searchInput: Locator;
  readonly filterOptions: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.locator('h1, h2').first();
    this.courseCards = page.locator('.course-card, mat-card, [data-testid="course-card"]');
    this.createCourseButton = page.locator('button:has-text("Create"), button:has-text("New Course"), a[href*="/courses/new"]');
    this.searchInput = page.locator('input[type="search"], input[placeholder*="Search"]');
    this.filterOptions = page.locator('mat-select, select');
  }

  async goto() {
    await this.page.goto(ROUTES.courses);
  }

  async getCourseCount() {
    await this.page.waitForLoadState('networkidle');
    return await this.courseCards.count();
  }

  async clickCourse(index: number = 0) {
    await this.courseCards.nth(index).click();
  }

  async clickCourseByTitle(title: string) {
    await this.page.locator(`text=${title}`).click();
  }

  async searchCourses(query: string) {
    await this.searchInput.fill(query);
    await this.page.keyboard.press('Enter');
  }

  async goToCreateCourse() {
    await this.createCourseButton.click();
    await this.page.waitForURL('**/courses/new**');
  }
}
