import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for Course Form (Create/Edit)
 */
export class CourseFormPage {
  readonly page: Page;
  readonly titleInput: Locator;
  readonly descriptionInput: Locator;
  readonly durationInput: Locator;
  readonly priceInput: Locator;
  readonly levelSelect: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.titleInput = page.locator('input[formControlName="title"], input[name="title"]');
    this.descriptionInput = page.locator('textarea[formControlName="description"], textarea[name="description"]');
    this.durationInput = page.locator('input[formControlName="duration"], input[name="duration"]');
    this.priceInput = page.locator('input[formControlName="price"], input[name="price"]');
    this.levelSelect = page.locator('mat-select[formControlName="level"], select[name="level"]');
    this.saveButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")');
    this.cancelButton = page.locator('button:has-text("Cancel")');
  }

  async fillCourseForm(course: {
    title: string;
    description: string;
    duration?: number;
    price?: number;
    level?: string;
  }) {
    await this.titleInput.fill(course.title);
    await this.descriptionInput.fill(course.description);

    if (course.duration) {
      await this.durationInput.fill(course.duration.toString());
    }

    if (course.price) {
      await this.priceInput.fill(course.price.toString());
    }

    if (course.level) {
      await this.levelSelect.click();
      await this.page.locator(`mat-option:has-text("${course.level}"), option:has-text("${course.level}")`).click();
    }
  }

  async submitForm() {
    await this.saveButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }
}
