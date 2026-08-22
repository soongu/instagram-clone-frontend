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

  // 서버가 실제로 받았는지를 먼저 붙잡아둔다.
  //
  // 화면의 aria-pressed 만 보면 안 된다. 낙관적 업데이트가 먼저 바꿔놓기 때문에
  // 요청이 실패해도 잠깐은 눌린 것처럼 보이고, 그 찰나를 단언이 잡으면 통과한다.
  // 되돌아가기 전에 잡느냐 마느냐라서 판이 돌 때마다 결과가 달라진다.
  const answered = page.waitForResponse(
    (res) => res.url().includes('/like') && res.request().method() === 'POST',
    { timeout: 10_000 },
  );

  await heart.click();

  expect((await answered).ok()).toBe(true);

  // 기다리라고 우리가 안 적는다. 이 단언이 될 때까지 스스로 다시 본다.
  await expect(heart).toHaveAttribute('aria-pressed', 'true');
});
