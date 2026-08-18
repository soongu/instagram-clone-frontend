// apps/web-spa/src/realtime/c9-reconnect-gap.test.tsx
// C-9 Step 7 — 끊겨 있는 동안 온 것은 통로로 안 온다 (내부 검증용)
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { RealtimeBridge } from './RealtimeBridge';
import { createStompClient, POSTS_TOPIC } from './stompClient';
import { FeedSection } from '../components/FeedSection';
import { useConnectionStore } from '../stores/useConnectionStore';
import { useSessionStore } from '../stores/useSessionStore';
import { useFeedQuery } from '../queries/posts';
import { createFakeBroker, type FakeBroker } from '../../scratch/c8-stomp-harness';
import { withRouter } from '../../scratch/c1-router-harness';
import { freshQueryClient, withQuery } from '../../scratch/c5-query-harness';
import { server, requestLog, resetRequestLog } from '../../scratch/c5-server-harness';
import { feedFromDb, fakeDb } from '../../scratch/c6-server-harness';

let broker: FakeBroker;

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());

beforeEach(() => {
  server.use(feedFromDb());
  resetRequestLog();
  fakeDb.reset();
  broker = createFakeBroker();
  useSessionStore.getState().signIn('jaehoon');
  useConnectionStore.getState().reset();
});

afterEach(() => {
  server.resetHandlers();
  useSessionStore.getState().signOut();
  useConnectionStore.getState().reset();
});

// 서버에서 피드를 받아 그리는 최소 화면. 여기서는 숫자만 본다.
function Feed() {
  const { data } = useFeedQuery();
  if (data === undefined) return <p>불러오는 중</p>;
  return <FeedSection posts={data} />;
}

function renderApp() {
  const client = createStompClient({ webSocketFactory: broker.webSocketFactory });
  const queryClient = freshQueryClient();
  render(
    withQuery(
      <>
        <RealtimeBridge client={client} />
        {withRouter(<Feed />)}
      </>,
      queryClient,
    ),
  );
  return client;
}

function feedRequests() {
  return requestLog.filter((entry) => entry === 'GET /api/posts');
}

describe('Step 7 — 다시 붙어도 지나간 것은 지나간 것', () => {
  it('★ 끊겨 있는 동안 바뀐 값은 통로로 안 온다', async () => {
    const client = renderApp();
    await screen.findByText('좋아요 1240개');
    await expect.poll(() => broker.subscriptions).toContain(POSTS_TOPIC);

    // 선이 끊긴다.
    broker.dropAll();
    await expect.poll(() => client.connected).toBe(false);

    // 그동안 남들이 눌렀다. 서버 값만 올라간다.
    const target = fakeDb.find(1);
    if (target === undefined) throw new Error('1번 게시물이 없다');
    target.likeCount = 1300;

    // 통로가 끊겨 있으니 그 소식은 우리에게 안 온다.
    expect(screen.getByText('좋아요 1240개')).toBeInTheDocument();
  });

  it('★ 다시 붙으면 그 구멍을 물어봐서 메운다', async () => {
    const client = renderApp();
    await screen.findByText('좋아요 1240개');
    await expect.poll(() => broker.subscriptions).toContain(POSTS_TOPIC);
    expect(feedRequests()).toHaveLength(1);

    broker.dropAll();
    await expect.poll(() => client.connected).toBe(false);

    const target = fakeDb.find(1);
    if (target === undefined) throw new Error('1번 게시물이 없다');
    target.likeCount = 1300;

    // 라이브러리가 알아서 다시 붙는다. 다시 붙는 순간 우리가 물어본다.
    await expect.poll(() => client.connected, { timeout: 3000 }).toBe(true);

    expect(await screen.findByText('좋아요 1300개')).toBeInTheDocument();
    expect(feedRequests().length).toBeGreaterThanOrEqual(2);
  });

  it('처음 붙을 때는 안 물어본다 — 방금 받아온 것을 또 받을 이유가 없다', async () => {
    renderApp();
    await screen.findByText('좋아요 1240개');
    await expect.poll(() => broker.subscriptions).toContain(POSTS_TOPIC);

    // 조금 기다려도 요청은 처음 한 번뿐이다.
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(feedRequests()).toHaveLength(1);
  });
});
