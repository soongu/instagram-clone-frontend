// apps/web-spa/src/queries/c8-polling.test.tsx
// C-8 Step 1 — 다시 물어보는 방식으로 어디까지 되나 (내부 검증용)
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import { withRouter } from '../../scratch/c1-router-harness';
import { withQuery, freshQueryClient } from '../../scratch/c5-query-harness';
import { HomePagePolling } from '../../scratch/c8-polling-feed';
import { server, requestLog, resetRequestLog, fakeAuth } from '../../scratch/c5-server-harness';
import { c6Handlers, fakeDb } from '../../scratch/c6-server-harness';

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

describe('폴링 — 정해둔 간격마다 다시 물어본다', () => {
  it('아무도 아무것도 안 바꿔도 요청은 계속 나간다', async () => {
    const client = freshQueryClient();
    // ⚠️ 간격이 너무 짧으면 아래 "아직 한 번" 을 세기도 전에 다음 차례가 와버린다.
    //    판이 늘어 첫 그림이 느려질수록 잘 깨진다. 간격을 넉넉히 준다.
    render(withQuery(withRouter(<HomePagePolling intervalMs={300} />), client));

    await screen.findByText('좋아요 1240개');
    expect(feedRequests()).toHaveLength(1);

    // 서버에서는 그동안 아무 일도 없었다.
    // ⚠️ 이 판은 흐르는 시간을 센다. 판이 늘어 컴퓨터가 바쁘면 같은 3초 안에
    //    들어가는 요청 수가 줄어든다. 창과 판의 한도를 함께 넓혀둔다.
    await expect.poll(() => feedRequests().length, { timeout: 8000 }).toBeGreaterThanOrEqual(5);

    // 다섯 번을 물어봤는데 답은 처음과 똑같다.
    expect(screen.getByText('좋아요 1240개')).toBeInTheDocument();
  }, 15_000);

  it('★ 남이 바꾼 것을 아는 데 간격만큼 늦는다', async () => {
    const client = freshQueryClient();
    render(withQuery(withRouter(<HomePagePolling intervalMs={300} />), client));

    await screen.findByText('좋아요 1240개');

    // 다른 사람이 좋아요를 눌렀다. 서버 값만 바뀐 것이다.
    const target = fakeDb.find(1);
    if (target === undefined) throw new Error('1번 게시물이 없다');
    target.likeCount = 1300;

    // 우리는 아직 모른다 — 물어보기 전까지는.
    expect(screen.getByText('좋아요 1240개')).toBeInTheDocument();

    // 다음 차례가 돌아오고 나서야 안다.
    expect(await screen.findByText('좋아요 1300개', {}, { timeout: 3000 })).toBeInTheDocument();
  });

  it('간격을 줄이면 빨리 알지만 요청이 그만큼 늘어난다', async () => {
    const slow = freshQueryClient();
    const { unmount } = render(withQuery(withRouter(<HomePagePolling intervalMs={500} />), slow));
    await screen.findByText('좋아요 1240개');
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const slowCount = feedRequests().length;
    unmount();

    resetRequestLog();

    const fast = freshQueryClient();
    render(withQuery(withRouter(<HomePagePolling intervalMs={100} />), fast));
    await screen.findByText('좋아요 1240개');
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const fastCount = feedRequests().length;

    // 같은 시간 동안 더 자주 물어본 쪽이 요청이 더 많다.
    expect(fastCount).toBeGreaterThan(slowCount);
  });
});
