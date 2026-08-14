// apps/web-spa/src/components/c6-single-truth.test.tsx
// C-6 Step 3 — 화면이 든 사본을 걷어낸 뒤 (내부 검증용)
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import type { Post } from '../types/instagram';
import { HomePage } from '../routes/HomePage';
import { withRouter } from '../../scratch/c1-router-harness';
import { withQuery, freshQueryClient } from '../../scratch/c5-query-harness';
import { server, requestLog, resetRequestLog, fakeAuth } from '../../scratch/c5-server-harness';
import { c6Handlers, fakeDb } from '../../scratch/c6-server-harness';
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

function feedRequests() {
  return requestLog.filter((entry) => entry === 'GET /api/posts');
}

describe('창고에 있는 것만 그린다', () => {
  it('★ Step 2 에서 갈렸던 숫자가 이제 서버 값으로 맞는다', async () => {
    const user = userEvent.setup();
    await login('jaehoon');

    const client = freshQueryClient();
    render(withQuery(withRouter(<HomePage />), client));
    const hearts = await screen.findAllByRole('button', { name: '좋아요' });

    expect(await screen.findByText('좋아요 1240개')).toBeInTheDocument();

    // 보고 있는 동안 다른 사람들도 눌렀다 (Step 2 와 똑같은 판)
    const target = fakeDb.find(1);
    if (target === undefined) throw new Error('1번 게시물이 없다');
    target.likeCount = 1300;

    await user.click(hearts[0]);
    await expect.poll(() => feedRequests().length).toBe(2);
    await expect.poll(() => client.getQueryData<Post[]>(['posts'])?.[0].likeCount).toBe(1301);

    // Step 2 에서는 여기가 1241 이었다
    expect(await screen.findByText('좋아요 1301개')).toBeInTheDocument();
    expect(screen.queryByText('좋아요 1241개')).not.toBeInTheDocument();
  });

  it('머리말 숫자도 창고에서 센다', async () => {
    const user = userEvent.setup();
    await login('jaehoon');

    render(withQuery(withRouter(<HomePage />)));
    const hearts = await screen.findAllByRole('button', { name: '좋아요' });

    // 열 장 중 minji 것 하나만 눌려 있다
    expect(screen.getByText('좋아요 누른 게시물 1개')).toBeInTheDocument();

    await user.click(hearts[0]);

    expect(await screen.findByText('좋아요 누른 게시물 2개')).toBeInTheDocument();
  });

  it('알림은 여전히 뜬다 — 그건 이 화면만의 것이라서', async () => {
    const user = userEvent.setup();
    await login('jaehoon');

    render(withQuery(withRouter(<HomePage />)));
    const hearts = await screen.findAllByRole('button', { name: '좋아요' });

    await user.click(hearts[0]);

    expect(await screen.findByRole('status')).toHaveTextContent(
      'jaehoon님의 게시물을 좋아합니다',
    );
  });

  it('화면 파일에 사본을 만드는 자리가 없다', async () => {
    const source = await import('./FeedSection.tsx?raw');

    expect(source.default).not.toMatch(/useFeed\b/);
    expect(source.default).not.toMatch(/useReducer/);
    expect(source.default).toMatch(/useLikeMutation/);
  });
});
