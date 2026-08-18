// apps/web-spa/src/realtime/c9-notifications.test.tsx
// C-9 Step 6 — 알림은 쪽지와 같은 길, 다른 줄로 온다 (내부 검증용)
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RealtimeBridge } from './RealtimeBridge';
import { createStompClient, NOTIFICATIONS_QUEUE } from './stompClient';
import { NotificationToaster } from '../components/NotificationToaster';
import { useConnectionStore } from '../stores/useConnectionStore';
import { useNotificationStore } from '../stores/useNotificationStore';
import { useSessionStore } from '../stores/useSessionStore';
import { createFakeBroker, type FakeBroker } from '../../scratch/c8-stomp-harness';
import { withQuery } from '../../scratch/c5-query-harness';

let broker: FakeBroker;

beforeEach(() => {
  broker = createFakeBroker();
  useSessionStore.getState().signIn('jaehoon');
  useConnectionStore.getState().reset();
  useNotificationStore.getState().reset();
});

afterEach(() => {
  useSessionStore.getState().signOut();
  useConnectionStore.getState().reset();
  useNotificationStore.getState().reset();
});

function renderApp() {
  const client = createStompClient({ webSocketFactory: broker.webSocketFactory });
  render(
    withQuery(
      <>
        <RealtimeBridge client={client} />
        <NotificationToaster />
      </>,
    ),
  );
  return client;
}

const liked = {
  notificationId: 1,
  type: 'LIKE',
  senderUsername: 'minji',
  targetId: 1,
  message: 'minji 님이 회원님의 게시물을 좋아합니다',
  createdAt: '2026-08-18T10:10:00',
};

describe('Step 6 — 알림', () => {
  it('붙자마자 알림 줄도 함께 구독한다', async () => {
    const client = renderApp();

    await expect.poll(() => client.connected).toBe(true);
    expect(broker.subscriptions).toContain(NOTIFICATIONS_QUEUE);
  });

  it('★ 알림이 오면 토스트로 뜬다', async () => {
    const client = renderApp();
    await expect.poll(() => client.connected).toBe(true);
    await expect.poll(() => broker.subscriptions).toContain(NOTIFICATIONS_QUEUE);

    broker.pushToUser('jaehoon', '/queue/notifications', liked);

    const toast = await screen.findByRole('status');
    expect(toast).toHaveTextContent('minji 님이 회원님의 게시물을 좋아합니다');
  });

  it('남에게 간 알림은 안 뜬다', async () => {
    const client = renderApp();
    await expect.poll(() => client.connected).toBe(true);
    await expect.poll(() => broker.subscriptions).toContain(NOTIFICATIONS_QUEUE);

    broker.pushToUser('minji', '/queue/notifications', liked);

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(screen.queryByRole('status')).toBe(null);
  });

  it('모르는 종류는 버린다 — 서버가 새 종류를 늘려도 화면이 안 깨진다', async () => {
    const client = renderApp();
    await expect.poll(() => client.connected).toBe(true);
    await expect.poll(() => broker.subscriptions).toContain(NOTIFICATIONS_QUEUE);

    broker.pushToUser('jaehoon', '/queue/notifications', { ...liked, type: 'MENTION' });

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(screen.queryByRole('status')).toBe(null);
  });

  it('겹치면 나중 것이 이긴다 — 한 번에 하나만 띄운다', async () => {
    const client = renderApp();
    await expect.poll(() => client.connected).toBe(true);
    await expect.poll(() => broker.subscriptions).toContain(NOTIFICATIONS_QUEUE);

    broker.pushToUser('jaehoon', '/queue/notifications', liked);
    broker.pushToUser('jaehoon', '/queue/notifications', {
      ...liked,
      notificationId: 2,
      type: 'COMMENT',
      message: 'minji 님이 댓글을 남겼습니다: 노을 색 좋네요',
    });

    await screen.findByText('minji 님이 댓글을 남겼습니다: 노을 색 좋네요');
    expect(screen.getAllByRole('status')).toHaveLength(1);
  });
});
