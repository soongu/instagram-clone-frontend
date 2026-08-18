// apps/web-spa/src/routes/c8-answer.test.tsx
// C-8 과제 예시답안 검증 (내부 검증용)
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { Post } from '../types/instagram';
import { createStompClient, POSTS_TOPIC } from '../realtime/stompClient';
import { RealtimeBridge } from '../realtime/RealtimeBridge';
import { useConnectionStore } from '../stores/useConnectionStore';
import { feedKey } from '../queries/posts';
import { createFakeBroker, type FakeBroker } from '../../scratch/c8-stomp-harness';
import { OfflineNotice } from '../../scratch/c8-story-answer';
import { freshQueryClient, withQuery } from '../../scratch/c5-query-harness';
import { allPosts } from '../data/feed';

let broker: FakeBroker;

beforeEach(() => {
  broker = createFakeBroker();
  useConnectionStore.getState().reset();
});

afterEach(() => useConnectionStore.getState().reset());

describe('과제 1 — 댓글 수도 실시간으로', () => {
  it('★ 고칠 게 없다 — 댓글 소식은 이미 처리되고 있다', async () => {
    const client = createStompClient({ webSocketFactory: broker.webSocketFactory });
    const queryClient = freshQueryClient();
    queryClient.setQueryData<Post[]>(feedKey(), allPosts.map((post) => ({ ...post })));

    render(withQuery(<RealtimeBridge client={client} />, queryClient));
    await expect.poll(() => broker.subscriptions).toContain(POSTS_TOPIC);

    expect(queryClient.getQueryData<Post[]>(feedKey())?.[0].commentCount).toBe(32);

    broker.push(POSTS_TOPIC, {
      type: 'comment',
      postId: 1,
      commentCount: 33,
      actor: 'minji',
    });

    await expect
      .poll(() => queryClient.getQueryData<Post[]>(feedKey())?.[0].commentCount)
      .toBe(33);

    // 좋아요 숫자는 안 건드린다 — 댓글 소식이니까
    expect(queryClient.getQueryData<Post[]>(feedKey())?.[0].likeCount).toBe(1240);
  });
});

describe('과제 2 — 끊긴 지 10초가 지나면 알린다', () => {
  it('끊기자마자 뜨지는 않는다', async () => {
    render(<OfflineNotice afterMs={200} />);

    useConnectionStore.getState().setStatus('offline');

    // 아직은 조용하다
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('정해둔 시간이 지나면 뜬다', async () => {
    render(<OfflineNotice afterMs={200} />);

    useConnectionStore.getState().setStatus('offline');

    expect(await screen.findByRole('alert')).toHaveTextContent('연결이 끊겨');
  });

  it('★ 그 전에 다시 붙으면 아예 안 뜬다', async () => {
    render(<OfflineNotice afterMs={300} />);

    useConnectionStore.getState().setStatus('offline');
    await new Promise((resolve) => setTimeout(resolve, 100));
    useConnectionStore.getState().setStatus('connected');

    await new Promise((resolve) => setTimeout(resolve, 400));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('떠 있는 동안 다시 붙으면 치운다', async () => {
    render(<OfflineNotice afterMs={100} />);

    useConnectionStore.getState().setStatus('offline');
    await screen.findByRole('alert');

    useConnectionStore.getState().setStatus('connected');

    await expect.poll(() => screen.queryByRole('alert')).toBeNull();
  });

  it('몇 번째 시도인지 함께 보여준다', async () => {
    render(<OfflineNotice afterMs={100} />);

    useConnectionStore.getState().setStatus('connected');
    useConnectionStore.getState().countAttempt();
    useConnectionStore.getState().countAttempt();
    useConnectionStore.getState().setStatus('offline');

    expect(await screen.findByRole('alert')).toHaveTextContent('2번째 시도');
  });
});

describe('과제 4 — 두 방식의 요청 수', () => {
  it('★ 푸시로 숫자가 바뀌는 동안 요청은 0번이다', async () => {
    const client = createStompClient({ webSocketFactory: broker.webSocketFactory });
    const queryClient = freshQueryClient();
    queryClient.setQueryData<Post[]>(feedKey(), allPosts.map((post) => ({ ...post })));

    render(withQuery(<RealtimeBridge client={client} />, queryClient));
    await expect.poll(() => broker.subscriptions).toContain(POSTS_TOPIC);

    // 소식을 다섯 번 받는다
    for (let i = 0; i < 5; i += 1) {
      broker.push(POSTS_TOPIC, {
        type: 'like',
        postId: 1,
        likeCount: 1300 + i,
        actor: 'minji',
      });
    }

    await expect
      .poll(() => queryClient.getQueryData<Post[]>(feedKey())?.[0].likeCount)
      .toBe(1304);

    // 그동안 피드를 다시 물어본 적은 없다.
    // (요청이 나갔다면 이 판은 서버 핸들러가 없어 실패했을 것이다)
    expect(queryClient.getQueryState(feedKey())?.fetchStatus).toBe('idle');
  });
});
