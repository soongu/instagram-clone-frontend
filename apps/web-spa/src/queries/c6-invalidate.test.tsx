// apps/web-spa/src/queries/c6-invalidate.test.tsx
// C-6 Step 2 — 쓰고 나면 읽어둔 것이 낡는다 (내부 검증용)
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

describe('무효화 = 다시 물어보기', () => {
  it('좋아요가 성공하면 피드를 한 번 더 물어본다', async () => {
    const user = userEvent.setup();
    await login('jaehoon');

    render(withQuery(withRouter(<HomePage />)));
    const hearts = await screen.findAllByRole('button', { name: '좋아요' });

    expect(feedRequests()).toHaveLength(1);

    await user.click(hearts[0]);

    await expect.poll(() => feedRequests().length).toBe(2);
  });

  it('★ staleTime 이 남아 있어도 무효화는 나간다', async () => {
    const user = userEvent.setup();
    await login('jaehoon');

    // C-5 에서 정한 앱 기본값과 같은 30초를 준다.
    // 그냥 두면 이 시간 안에는 다시 안 물어보는 값이다.
    const client = freshQueryClient();
    client.setDefaultOptions({ queries: { staleTime: 30_000, retry: false } });

    render(withQuery(withRouter(<HomePage />), client));
    const hearts = await screen.findAllByRole('button', { name: '좋아요' });

    expect(feedRequests()).toHaveLength(1);

    await user.click(hearts[0]);

    await expect.poll(() => feedRequests().length).toBe(2);
  });

  it('실패하면 안 물어본다 — onSuccess 라서', async () => {
    const user = userEvent.setup();
    await login('jaehoon');
    fakeDb.likeFailEvery = 1;

    render(withQuery(withRouter(<HomePage />)));
    const hearts = await screen.findAllByRole('button', { name: '좋아요' });

    await user.click(hearts[0]);
    await expect.poll(() => requestLog.filter((e) => e.endsWith('/like')).length).toBe(1);

    expect(feedRequests()).toHaveLength(1);
  });
});

describe('★ 무효화를 했는데 화면이 안 바뀐다', () => {
  it('캐시에는 새 숫자가 들어왔는데 화면은 옛 숫자를 들고 있다', async () => {
    const user = userEvent.setup();
    await login('jaehoon');

    const client = freshQueryClient();
    render(withQuery(withRouter(<HomePage />), client));
    const hearts = await screen.findAllByRole('button', { name: '좋아요' });

    // 화면이 처음 받은 숫자
    expect(await screen.findByText('좋아요 1240개')).toBeInTheDocument();

    // 우리가 보고 있는 동안 다른 사람들도 눌렀다
    const target = fakeDb.find(1);
    if (target === undefined) throw new Error('1번 게시물이 없다');
    target.likeCount = 1300;

    await user.click(hearts[0]);
    await expect.poll(() => feedRequests().length).toBe(2);

    // 캐시는 서버가 준 새 숫자를 받았다 — 1300 에 우리 것 하나를 더한 값
    await expect.poll(() => client.getQueryData<Post[]>(['posts'])?.[0].likeCount).toBe(1301);

    // 그런데 화면은 자기가 센 숫자를 그대로 들고 있다
    expect(screen.getByText('좋아요 1241개')).toBeInTheDocument();
    expect(screen.queryByText('좋아요 1301개')).not.toBeInTheDocument();
  });
});
