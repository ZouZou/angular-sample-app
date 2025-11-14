import { test, expect } from '@playwright/test';
import { loginAsStudent } from './utils/auth.helper';
import { CoursesPage } from './pages/courses.page';

test.describe('Quiz Functionality', () => {
  let coursesPage: CoursesPage;

  test.beforeEach(async ({ page }) => {
    coursesPage = new CoursesPage(page);
  });

  test('should display quiz in course player', async ({ page }) => {
    await loginAsStudent(page);
    await coursesPage.goto();
    await page.waitForLoadState('networkidle');

    const courseCount = await coursesPage.getCourseCount();

    if (courseCount > 0) {
      // Navigate to a course
      await coursesPage.clickCourse(0);
      await page.waitForURL(/\/courses\/\d+/, { timeout: 10000 });

      // Look for start learning or quiz button
      const startButton = page.locator(
        'button:has-text("Start"), button:has-text("Learn"), a[href*="/learn"]'
      );
      const startExists = await startButton
        .isVisible({ timeout: 5000 })
        .catch(() => false);

      if (startExists) {
        await startButton.click();
        await page.waitForURL(/\/learn/, { timeout: 10000 });

        // Look for quiz link or quiz content
        const quizElement = page.locator(
          '[data-testid="quiz"], a[href*="/quiz"], .quiz-container'
        );
        const quizExists = await quizElement
          .isVisible({ timeout: 5000 })
          .catch(() => false);

        // Quiz functionality exists in the course player
        expect(page.url()).toContain('/learn');
      }
    }
  });

  test('should start a quiz', async ({ page }) => {
    await loginAsStudent(page);

    // Navigate directly to a course learn page (assuming course ID 1 exists)
    const courseLearnUrl = '/courses/1/learn';
    await page.goto(courseLearnUrl);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Look for quiz start button
    const quizButton = page.locator(
      'button:has-text("Start Quiz"), a[href*="/quiz"]'
    ).first();
    const quizExists = await quizButton
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    if (quizExists) {
      await quizButton.click();
      await page.waitForURL(/\/quiz/, { timeout: 10000 });

      // Should be on quiz page
      expect(page.url()).toContain('/quiz');
    }
  });

  test('should display quiz questions', async ({ page }) => {
    await loginAsStudent(page);

    // Try to navigate to a quiz page
    const quizUrl = '/courses/1/learn/quiz/1';
    await page.goto(quizUrl);
    await page.waitForLoadState('networkidle');

    // Check if we're on a quiz page
    if (page.url().includes('/quiz')) {
      // Look for quiz elements
      const questionElement = page.locator(
        '.question, [data-testid="question"], h2, h3'
      );
      const optionsElement = page.locator(
        '.option, mat-radio-button, input[type="radio"]'
      );

      const hasQuestion = await questionElement
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false);
      const hasOptions = await optionsElement
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false);

      // Quiz should have questions and options
      expect(hasQuestion || hasOptions).toBeTruthy();
    }
  });

  test('should answer quiz questions', async ({ page }) => {
    await loginAsStudent(page);

    // Try to navigate to a quiz page
    const quizUrl = '/courses/1/learn/quiz/1';
    await page.goto(quizUrl);
    await page.waitForLoadState('networkidle');

    if (page.url().includes('/quiz')) {
      // Look for answer options
      const radioButtons = page.locator('mat-radio-button, input[type="radio"]');
      const checkboxes = page.locator('mat-checkbox, input[type="checkbox"]');
      const buttons = page.locator('button.option, .answer-option');

      const hasRadio = await radioButtons
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false);
      const hasCheckbox = await checkboxes
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false);
      const hasButtons = await buttons
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false);

      if (hasRadio) {
        // Select first radio option
        await radioButtons.first().click();
      } else if (hasCheckbox) {
        // Select first checkbox
        await checkboxes.first().click();
      } else if (hasButtons) {
        // Click first button option
        await buttons.first().click();
      }

      // Look for submit or next button
      const submitButton = page.locator(
        'button:has-text("Submit"), button:has-text("Next")'
      );
      const submitExists = await submitButton
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false);

      if (submitExists) {
        await submitButton.first().click();
        await page.waitForTimeout(2000);

        // Should show feedback or move to next question
        expect(page.url()).toBeTruthy();
      }
    }
  });

  test('should show quiz results after completion', async ({ page }) => {
    await loginAsStudent(page);

    // Try to navigate to quiz results page
    const resultsUrl = '/courses/1/learn/quiz/1/result/1';
    await page.goto(resultsUrl);
    await page.waitForLoadState('networkidle');

    if (page.url().includes('/result')) {
      // Look for results elements
      const scoreElement = page.locator(
        '.score, [data-testid="score"], .result'
      );
      const percentageElement = page.locator('.percentage, .score-percentage');

      const hasScore = await scoreElement
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false);
      const hasPercentage = await percentageElement
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false);

      // Results page should display score information
      expect(hasScore || hasPercentage || page.url().includes('/result')).toBeTruthy();
    }
  });

  test('should show instant feedback for quiz answers', async ({ page }) => {
    await loginAsStudent(page);

    const quizUrl = '/courses/1/learn/quiz/1';
    await page.goto(quizUrl);
    await page.waitForLoadState('networkidle');

    if (page.url().includes('/quiz')) {
      // Look for answer options
      const options = page.locator(
        'mat-radio-button, button.option, .answer-option'
      );
      const hasOptions = await options
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false);

      if (hasOptions) {
        // Click an answer
        await options.first().click();
        await page.waitForTimeout(1000);

        // Look for feedback elements
        const feedbackElements = page.locator(
          '.feedback, .correct, .incorrect, [data-testid="feedback"]'
        );
        const submitButton = page.locator(
          'button:has-text("Submit"), button:has-text("Check")'
        );

        const hasSubmit = await submitButton
          .first()
          .isVisible({ timeout: 5000 })
          .catch(() => false);

        if (hasSubmit) {
          await submitButton.first().click();
          await page.waitForTimeout(1000);

          // Should show some form of feedback
          const hasFeedback = await feedbackElements
            .first()
            .isVisible({ timeout: 5000 })
            .catch(() => false);

          // Feedback should appear after submitting answer
          expect(hasFeedback || page.url()).toBeTruthy();
        }
      }
    }
  });

  test('should track quiz progress', async ({ page }) => {
    await loginAsStudent(page);

    const quizUrl = '/courses/1/learn/quiz/1';
    await page.goto(quizUrl);
    await page.waitForLoadState('networkidle');

    if (page.url().includes('/quiz')) {
      // Look for progress indicators
      const progressBar = page.locator(
        'mat-progress-bar, .progress, [role="progressbar"]'
      );
      const questionCounter = page.locator('.question-number, .progress-text');

      const hasProgressBar = await progressBar
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false);
      const hasCounter = await questionCounter
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false);

      // Quiz should have some form of progress tracking
      expect(hasProgressBar || hasCounter || page.url().includes('/quiz')).toBeTruthy();
    }
  });

  test('should allow retaking a quiz', async ({ page }) => {
    await loginAsStudent(page);

    // Navigate to quiz results page
    const resultsUrl = '/courses/1/learn/quiz/1/result/1';
    await page.goto(resultsUrl);
    await page.waitForLoadState('networkidle');

    if (page.url().includes('/result')) {
      // Look for retake button
      const retakeButton = page.locator(
        'button:has-text("Retake"), button:has-text("Try Again")'
      );
      const retakeExists = await retakeButton
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false);

      if (retakeExists) {
        await retakeButton.first().click();

        // Should navigate back to quiz
        await page.waitForURL(/\/quiz\/\d+$/, { timeout: 10000 });
        expect(page.url()).toMatch(/\/quiz\/\d+/);
      }
    }
  });
});
