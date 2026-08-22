// apps/web-spa/e2e/journey.spec.ts
import { test, expect } from '@playwright/test';

test('로그인하면 머리말에 내 이름이 뜬다', async ({ page }) => {
  await page.goto('/');

  // 피드가 다 뜬 뒤에 누른다. 안 기다리고 누르면 판이 통과하는데,
  // 통과한 이유가 "맞아서" 가 아니라 "아직 안 그려져서" 다.
  await expect(page.getByRole('article').first()).toBeVisible();

  await page.getByRole('button', { name: '로그인' }).click();

  // 'jaehoon' 은 화면에 셋이다 — 머리말·게시물 작성자·댓글 작성자.
  // 이름만으로는 못 고르니 어느 구역에서 찾을지를 먼저 말한다.
  await expect(page.locator('header').getByText('jaehoon')).toBeVisible();
});
