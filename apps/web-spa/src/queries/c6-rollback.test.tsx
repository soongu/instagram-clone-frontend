// apps/web-spa/src/queries/c6-rollback.test.tsx
// C-6 Step 5 — 거절당하면 되돌린다 (내부 검증용)
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import type { Post } from '../types/instagram';
import { HomePage } from '../routes/HomePage';
import { feedKey } from './posts';
import { withRouter } from '../../scratch/c1-router-harness';
import { withQuery, freshQueryClient } from '../../scratch/c5-query-harness';
import { server, requestLog, resetRequestLog, fakeAuth } from '../../scratch/c5-server-harness';
import { c6Handlers, fakeDb, feedFromDb, likeToggleHandler } from '../../scratch/c6-server-harness';
import { login } from '../api/auth';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

beforeEach(() => {
  server.use(...c6Handlers());
  resetRequestLog();
  fakeAuth.reset();
  fakeDb.reset();
});

afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('서버가 거절하면 눌리기 전으로 돌아간다', () => {
  // ⚠️ onSettled 무효화가 있으면 롤백이 없어도 결국 서버 값으로 맞는다.
  // 갈리는 것은 *되돌아오느냐* 가 아니라 *언제 되돌아오느냐* 다.
  // 그래서 피드를 일부러 느리게(800ms) 두고, 거절(200ms) 직후를 본다.
  it('★ 거절당한 그 순간 되돌아온다 — 피드를 다시 받기 전에', async () => {
    const user = userEvent.setup();
    await login('jaehoon');

    fakeDb.likeFailEvery = 1;
    server.use(feedFromDb(800), likeToggleHandler(200));

    const client = freshQueryClient();
    render(withQuery(withRouter(<HomePage />), client));
    const hearts = await screen.findAllByRole('button', { name: '좋아요' });
    await screen.findByText('좋아요 1240개');

    await user.click(hearts[0]);

    // 먼저 빨개진다
    expect(client.getQueryData<Post[]>(feedKey())?.[0].likeCount).toBe(1241);

    // 롤백이 없으면 여기가 1241 인 채로 남는다 (다시 받아오는 데 800ms 더 걸린다)
    await expect
      .poll(() => client.getQueryData<Post[]>(feedKey())?.[0].likeCount, {
        timeout: 500,
        interval: 25,
      })
      .toBe(1240);
  });

  it('되돌린 뒤 화면도 눌리기 전 숫자다', async () => {
    const user = userEvent.setup();
    await login('jaehoon');
    fakeDb.likeFailEvery = 1;
    server.use(feedFromDb(), likeToggleHandler(300));

    render(withQuery(withRouter(<HomePage />)));
    const hearts = await screen.findAllByRole('button', { name: '좋아요' });
    await screen.findByText('좋아요 1240개');

    await user.click(hearts[0]);

    expect(await screen.findByText('좋아요 1240개')).toBeInTheDocument();
  });

  it('하트도 눌리기 전으로 돌아간다', async () => {
    const user = userEvent.setup();
    await login('jaehoon');
    fakeDb.likeFailEvery = 1;
    server.use(feedFromDb(), likeToggleHandler(300));

    render(withQuery(withRouter(<HomePage />)));
    const hearts = await screen.findAllByRole('button', { name: '좋아요' });
    await screen.findByText('좋아요 1240개');

    await user.click(hearts[0]);
    expect(hearts[0]).toHaveAttribute('aria-pressed', 'true');

    await expect.poll(() => hearts[0].getAttribute('aria-pressed')).toBe('false');
  });

  it('서버는 아무것도 안 바꿨다', async () => {
    const user = userEvent.setup();
    await login('jaehoon');
    fakeDb.likeFailEvery = 1;

    render(withQuery(withRouter(<HomePage />)));
    const hearts = await screen.findAllByRole('button', { name: '좋아요' });
    await screen.findByText('좋아요 1240개');

    await user.click(hearts[0]);
    await expect.poll(() => requestLog.filter((e) => e.endsWith('/like')).length).toBe(1);

    expect(fakeDb.find(1)).toMatchObject({ liked: false, likeCount: 1240 });
  });
});

describe('onSuccess 가 아니라 onSettled 인 이유', () => {
  it('★ 실패했을 때도 서버에 다시 물어본다', async () => {
    const user = userEvent.setup();
    await login('jaehoon');
    fakeDb.likeFailEvery = 1;

    render(withQuery(withRouter(<HomePage />)));
    const hearts = await screen.findAllByRole('button', { name: '좋아요' });
    await screen.findByText('좋아요 1240개');

    expect(requestLog.filter((entry) => entry === 'GET /api/posts')).toHaveLength(1);

    await user.click(hearts[0]);

    // Step 2 의 onSuccess 판에서는 여기가 1 이었다
    await expect
      .poll(() => requestLog.filter((entry) => entry === 'GET /api/posts').length)
      .toBe(2);
  });

  it('★ 되돌린 값이 틀렸어도 서버가 바로잡는다', async () => {
    const user = userEvent.setup();
    await login('jaehoon');
    fakeDb.likeFailEvery = 1;

    render(withQuery(withRouter(<HomePage />)));
    const hearts = await screen.findAllByRole('button', { name: '좋아요' });
    await screen.findByText('좋아요 1240개');

    // 우리 요청은 거절당하지만, 그사이 다른 사람들은 눌렀다.
    // 되돌리기만 하면 1240 인데 진짜 값은 1300 이다.
    const target = fakeDb.find(1);
    if (target === undefined) throw new Error('1번 게시물이 없다');
    target.likeCount = 1300;

    await user.click(hearts[0]);

    expect(await screen.findByText('좋아요 1300개')).toBeInTheDocument();
  });
});
