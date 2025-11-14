import { Page } from '@playwright/test';

/**
 * Wait helper functions for E2E tests
 */

export async function waitForAngularToLoad(page: Page) {
  // Wait for Angular to be defined
  await page.waitForFunction(() => {
    return (window as any).getAllAngularTestabilities !== undefined;
  }, { timeout: 10000 });

  // Wait for Angular to be stable
  await page.evaluate(() => {
    return new Promise<void>((resolve) => {
      const testabilities = (window as any).getAllAngularTestabilities();
      let count = testabilities.length;

      if (count === 0) {
        resolve();
        return;
      }

      testabilities.forEach((testability: any) => {
        testability.whenStable(() => {
          count--;
          if (count === 0) {
            resolve();
          }
        });
      });
    });
  });
}

export async function waitForApiResponse(page: Page, urlPattern: string | RegExp) {
  return await page.waitForResponse(
    (response) => {
      const url = response.url();
      if (typeof urlPattern === 'string') {
        return url.includes(urlPattern);
      }
      return urlPattern.test(url);
    },
    { timeout: 10000 }
  );
}

export async function waitForNetworkIdle(page: Page, timeout: number = 5000) {
  await page.waitForLoadState('networkidle', { timeout });
}
