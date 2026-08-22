// apps/web-spa/e2e/feed.spec.ts
import { test, expect } from '@playwright/test';

test('피드를 열면 게시물이 보인다', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('article').first()).toBeVisible();
});
