// apps/web-spa/src/realtime/c8-stomp-connect.test.tsx
// C-8 Step 5·6·7 — 붙고, 구독한 것을 캐시에 얹고, 상태를 담는다 (내부 검증용)
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ReconnectionTimeMode } from '@stomp/stompjs';
import type { Post } from '../types/instagram';
import { createStompClient, POSTS_TOPIC } from './stompClient';
import { RealtimeBridge } from './RealtimeBridge';
import { ConnectionIndicator } from '../components/ConnectionIndicator';
import { useConnectionStore } from '../stores/useConnectionStore';
import { feedKey } from '../queries/posts';
import { createFakeBroker, type FakeBroker } from '../../scratch/c8-stomp-harness';
import { freshQueryClient, withQuery } from '../../scratch/c5-query-harness';
import { allPosts } from '../data/feed';

let broker: FakeBroker;

beforeEach(() => {
  broker = createFakeBroker();
  useConnectionStore.getState().reset();
});

afterEach(() => useConnectionStore.getState().reset());

function bridgeWith(client = createStompClient({ webSocketFactory: broker.webSocketFactory })) {
  return client;
}

describe('Step 5 — 통로를 연다', () => {
  it('CONNECT 를 보내고 CONNECTED 를 받는다', async () => {
    const client = bridgeWith();
    render(withQuery(<RealtimeBridge client={client} />));

    await expect.poll(() => client.connected).toBe(true);
    expect(broker.sent[0].command).toBe('CONNECT');
  });

  it('붙자마자 우리가 들을 곳을 구독한다', async () => {
    const client = bridgeWith();
    render(withQuery(<RealtimeBridge client={client} />));

    await expect.poll(() => broker.subscriptions).toContain(POSTS_TOPIC);
  });
});

describe('Step 6 — 서버가 먼저 보낸 것이 캐시로 들어간다', () => {
  it('★ 우리가 아무것도 안 물어봤는데 화면 숫자가 바뀐다', async () => {
    const client = bridgeWith();
    const queryClient = freshQueryClient();

    // 이미 받아둔 피드가 캐시에 있다고 치자.
    queryClient.setQueryData<Post[]>(feedKey(), allPosts.map((post) => ({ ...post })));

    render(withQuery(<RealtimeBridge client={client} />, queryClient));
    await expect.poll(() => broker.subscriptions).toContain(POSTS_TOPIC);

    expect(queryClient.getQueryData<Post[]>(feedKey())?.[0].likeCount).toBe(1240);

    // 다른 사람이 눌렀다. 서버가 먼저 말을 건다.
    broker.push(POSTS_TOPIC, { type: 'like', postId: 1, likeCount: 1300, actor: 'minji' });

    await expect
      .poll(() => queryClient.getQueryData<Post[]>(feedKey())?.[0].likeCount)
      .toBe(1300);
  });

  it('남이 누른 좋아요는 내 하트를 빨갛게 만들지 않는다', async () => {
    const client = bridgeWith();
    const queryClient = freshQueryClient();
    queryClient.setQueryData<Post[]>(feedKey(), allPosts.map((post) => ({ ...post })));

    render(withQuery(<RealtimeBridge client={client} />, queryClient));
    await expect.poll(() => broker.subscriptions).toContain(POSTS_TOPIC);

    const before = queryClient.getQueryData<Post[]>(feedKey())?.[0].liked;
    broker.push(POSTS_TOPIC, { type: 'like', postId: 1, likeCount: 1300, actor: 'minji' });

    await expect
      .poll(() => queryClient.getQueryData<Post[]>(feedKey())?.[0].likeCount)
      .toBe(1300);

    expect(queryClient.getQueryData<Post[]>(feedKey())?.[0].liked).toBe(before);
  });

  it('우리가 모르는 모양이 오면 그냥 흘려보낸다', async () => {
    const client = bridgeWith();
    const queryClient = freshQueryClient();
    queryClient.setQueryData<Post[]>(feedKey(), allPosts.map((post) => ({ ...post })));

    render(withQuery(<RealtimeBridge client={client} />, queryClient));
    await expect.poll(() => broker.subscriptions).toContain(POSTS_TOPIC);

    broker.push(POSTS_TOPIC, { type: '처음 보는 것', postId: 1 });
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(queryClient.getQueryData<Post[]>(feedKey())?.[0].likeCount).toBe(1240);
  });
});

describe('Step 7 — 연결 상태는 어디에 담나', () => {
  it('붙으면 머리말 표시가 실시간으로 바뀐다', async () => {
    const client = bridgeWith();
    render(
      withQuery(
        <>
          <RealtimeBridge client={client} />
          <ConnectionIndicator />
        </>,
      ),
    );

    expect(await screen.findByText('실시간')).toBeInTheDocument();
  });

  it('끊기면 연결 끊김으로 바뀐다', async () => {
    const client = bridgeWith();
    render(
      withQuery(
        <>
          <RealtimeBridge client={client} />
          <ConnectionIndicator />
        </>,
      ),
    );
    await screen.findByText('실시간');

    broker.dropAll();

    expect(await screen.findByText('연결 끊김')).toBeInTheDocument();
  });
});

describe('Step 8 — 끊어지면 다시 붙는다', () => {
  it('★ 다시 붙으면 구독도 다시 살아난다', async () => {
    const client = bridgeWith();
    const queryClient = freshQueryClient();
    queryClient.setQueryData<Post[]>(feedKey(), allPosts.map((post) => ({ ...post })));

    render(withQuery(<RealtimeBridge client={client} />, queryClient));
    await expect.poll(() => broker.subscriptions).toContain(POSTS_TOPIC);

    const firstOpen = broker.openCount;
    broker.dropAll();

    // 라이브러리가 알아서 다시 연다.
    await expect.poll(() => broker.openCount, { timeout: 5000 }).toBeGreaterThan(firstOpen);
    await expect.poll(() => broker.subscriptions, { timeout: 5000 }).toContain(POSTS_TOPIC);

    // 새 연결로도 소식이 캐시에 들어온다.
    broker.push(POSTS_TOPIC, { type: 'like', postId: 1, likeCount: 1555, actor: 'minji' });
    await expect
      .poll(() => queryClient.getQueryData<Post[]>(feedKey())?.[0].likeCount, { timeout: 5000 })
      .toBe(1555);
  });

  it('★ 기다리는 시간이 시도할 때마다 두 배가 된다', async () => {
    const client = bridgeWith();
    render(withQuery(<RealtimeBridge client={client} />));
    await expect.poll(() => client.connected).toBe(true);

    // 서버가 죽었고 세 번은 더 안 받아준다.
    broker.refuseNext(3);
    const attemptsBefore = broker.attemptTimes.length;
    broker.dropAll();

    // 첫 연결 + 실패 3번 + 성공 1번
    await expect
      .poll(() => broker.attemptTimes.length, { timeout: 20_000 })
      .toBe(attemptsBefore + 4);

    // 붙어보려 한 시각들 사이의 간격
    const gaps = broker.attemptTimes
      .slice(attemptsBefore - 1)
      .map((time, index, all) => (index === 0 ? 0 : time - all[index - 1]))
      .slice(1);

    // 500 → 1000 → 2000 → 4000 이 되어야 한다. 시계가 정확하진 않으니
    // "다음 것이 앞의 것보다 확실히 길다" 로 본다.
    expect(gaps).toHaveLength(4);
    expect(gaps[1]).toBeGreaterThan(gaps[0] * 1.5);
    expect(gaps[2]).toBeGreaterThan(gaps[1] * 1.5);
    expect(gaps[3]).toBeGreaterThan(gaps[2] * 1.5);
  }, 25_000);
});

describe('설정값', () => {
  it('지수 백오프가 켜져 있고 상한이 있다', () => {
    const client = createStompClient();

    expect(client.reconnectTimeMode).toBe(ReconnectionTimeMode.EXPONENTIAL);
    expect(client.reconnectDelay).toBe(500);
    expect(client.maxReconnectDelay).toBe(30_000);
  });
});
