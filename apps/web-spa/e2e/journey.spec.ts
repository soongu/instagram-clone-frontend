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

test('좋아요를 누르면 눌린 상태가 된다', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('article').first()).toBeVisible();

  await page.getByRole('button', { name: '로그인' }).click();
  await expect(page.locator('header').getByText('jaehoon')).toBeVisible();

  const heart = page.getByRole('button', { name: '좋아요' }).first();

  // 기다리라고 우리가 안 적는다. 이 단언이 될 때까지 스스로 다시 본다.
  //
  // 값을 한 번만 읽어서 비교하면(getAttribute 로 꺼내 놓고 expect) 실패한다.
  // 누른 직후에는 아직 'false' 다 — 낙관적 업데이트도 다음 줄보다는 늦다.
  await heart.click();
  await expect(heart).toHaveAttribute('aria-pressed', 'true');
});
