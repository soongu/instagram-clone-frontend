// apps/web-spa/src/routes/c9-answer.test.tsx
// C-9 과제 예시답안 검증 (내부 검증용)
import { act, render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createStompClient, DM_QUEUE } from '../realtime/stompClient';
import { useSessionStore } from '../stores/useSessionStore';
import {
  countIfFromOther,
  retryNow,
  subscribeUnread,
  UnreadBadge,
  useUnreadStore,
} from '../../scratch/c9-story-answer';
import { createFakeBroker, type FakeBroker } from '../../scratch/c8-stomp-harness';

let broker: FakeBroker;

beforeEach(() => {
  broker = createFakeBroker();
  useSessionStore.getState().signIn('jaehoon');
  useUnreadStore.getState().clear();
});

afterEach(() => {
  useSessionStore.getState().signOut();
  useUnreadStore.getState().clear();
});

function clientAs(username: string) {
  return createStompClient({
    webSocketFactory: broker.webSocketFactory,
    connectHeaders: { login: username },
  });
}

const incoming = (sender: string, id: number) => ({
  messageId: id,
  conversationId: 1,
  senderUsername: sender,
  content: `쪽지 ${id}`,
  createdAt: '2026-08-18T10:00:00',
});

describe('과제 1 — 안 읽은 쪽지 개수', () => {
  it('★ 내가 보낸 것은 안 센다 — 되돌아오기 때문이다', () => {
    expect(countIfFromOther('minji', 'jaehoon')).toBe(true);
    expect(countIfFromOther('jaehoon', 'jaehoon')).toBe(false);
    // 로그인 전에는 셀 수 없다
    expect(countIfFromOther('minji', null)).toBe(false);
  });

  it('남이 보낸 쪽지가 오면 개수가 오른다', async () => {
    const client = clientAs('jaehoon');
    client.activate();
    await expect.poll(() => client.connected).toBe(true);
    subscribeUnread(client);
    await expect.poll(() => broker.subscriptions).toContain(DM_QUEUE);

    broker.pushToUser('jaehoon', '/queue/dm', incoming('minji', 1));
    await expect.poll(() => useUnreadStore.getState().count).toBe(1);

    // 내가 보낸 것이 되돌아와도 안 오른다
    broker.pushToUser('jaehoon', '/queue/dm', incoming('jaehoon', 2));
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(useUnreadStore.getState().count).toBe(1);

    await client.deactivate();
  });

  it('0 이면 아무것도 안 그린다', async () => {
    const { container } = render(<UnreadBadge />);
    expect(container).toBeEmptyDOMElement();

    // 같은 화면이 store 를 보고 있으니 새로 그리지 않아도 갈린다
    act(() => useUnreadStore.getState().add());
    expect(await screen.findByText('1')).toBeInTheDocument();
  });
});

describe('과제 2 — 돌아온 사람에게는 즉시 붙는다', () => {
  it('★ 기다리던 것을 건너뛰고 곧바로 다시 시도한다', async () => {
    // 다시 붙기까지 아주 길게 기다리도록 해둔다. 손대지 않으면 그 시간 동안 안 붙는다.
    const client = createStompClient({
      webSocketFactory: broker.webSocketFactory,
      connectHeaders: { login: 'jaehoon' },
      reconnectDelay: 30_000,
    });
    client.activate();
    await expect.poll(() => client.connected).toBe(true);

    const before = broker.attemptTimes.length;
    broker.dropAll();
    await expect.poll(() => client.connected).toBe(false);

    // 30초 뒤에나 시도할 것이므로 지금은 늘어나지 않는다
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(broker.attemptTimes.length).toBe(before);

    // 사용자가 돌아왔다
    await retryNow(client);

    await expect.poll(() => client.connected, { timeout: 2000 }).toBe(true);
    expect(broker.attemptTimes.length).toBeGreaterThan(before);

    await client.deactivate();
  });

  it('멀쩡히 붙어 있으면 아무것도 안 한다', async () => {
    const client = clientAs('jaehoon');
    client.activate();
    await expect.poll(() => client.connected).toBe(true);

    const before = broker.attemptTimes.length;
    await retryNow(client);

    expect(broker.attemptTimes.length).toBe(before);
    expect(client.connected).toBe(true);

    await client.deactivate();
  });
});
