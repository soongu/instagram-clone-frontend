// apps/web-spa/src/routes/c9-dm-page.test.tsx
// C-9 Step 3 — /user 로 듣고 /app 으로 보낸다 (내부 검증용)
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { DmPage } from './DmPage';
import { createStompClient, DM_QUEUE, DM_SEND } from '../realtime/stompClient';
import { RealtimeBridge } from '../realtime/RealtimeBridge';
import { useConnectionStore } from '../stores/useConnectionStore';
import { useSessionStore } from '../stores/useSessionStore';
import { createFakeBroker, type FakeBroker } from '../../scratch/c8-stomp-harness';
import { withQuery } from '../../scratch/c5-query-harness';

let broker: FakeBroker;

beforeEach(() => {
  broker = createFakeBroker();
  useSessionStore.getState().signOut();
  useConnectionStore.getState().reset();
});

afterEach(() => {
  useSessionStore.getState().signOut();
  useConnectionStore.getState().reset();
});

// 대화방 주소로 들어간 화면 하나를 그린다.
// 실제 앱과 같이 통로(RealtimeBridge)를 함께 띄운다 — 붙기 전에는 구독을 못 한다.
function renderRoom(client = createStompClient({ webSocketFactory: broker.webSocketFactory })) {
  const router = createMemoryRouter(
    [{ path: '/dm/:conversationId', element: <DmPage client={client} /> }],
    { initialEntries: ['/dm/1'] },
  );
  return render(
    withQuery(
      <>
        <RealtimeBridge client={client} />
        <RouterProvider router={router} />
      </>,
    ),
  );
}

async function connected(client: ReturnType<typeof createStompClient>) {
  await expect.poll(() => client.connected).toBe(true);
  await expect.poll(() => broker.subscriptions).toContain(DM_QUEUE);
}

describe('Step 3 — 나에게만 오는 줄로 듣는다', () => {
  it('로그인 전에는 쪽지 화면이 안 열린다', () => {
    renderRoom();

    expect(screen.getByText('쪽지를 보려면 먼저 로그인해주세요.')).toBeInTheDocument();
  });

  it('화면이 /user/queue/dm 을 구독한다', async () => {
    useSessionStore.getState().signIn('jaehoon');
    const client = createStompClient({ webSocketFactory: broker.webSocketFactory });
    renderRoom(client);
    await connected(client);

    expect(broker.subscriptions).toContain('/user/queue/dm');
  });

  it('나에게 온 쪽지가 화면에 뜬다', async () => {
    useSessionStore.getState().signIn('jaehoon');
    const client = createStompClient({ webSocketFactory: broker.webSocketFactory });
    renderRoom(client);
    await connected(client);

    broker.pushToUser('jaehoon', '/queue/dm', {
      messageId: 10,
      conversationId: 1,
      senderUsername: 'minji',
      content: '한강 사진 어디서 찍었어요?',
      createdAt: '2026-08-18T09:12:00',
    });

    expect(await screen.findByText('한강 사진 어디서 찍었어요?')).toBeInTheDocument();
  });

  it('★ 남에게 간 쪽지는 같은 줄을 구독해도 안 온다', async () => {
    useSessionStore.getState().signIn('jaehoon');
    const client = createStompClient({ webSocketFactory: broker.webSocketFactory });
    renderRoom(client);
    await connected(client);

    // 서버가 minji 에게 보낸 것이다. 우리 구독 문자열은 minji 의 것과 똑같다.
    broker.pushToUser('minji', '/queue/dm', {
      messageId: 11,
      conversationId: 1,
      senderUsername: 'seungwoo',
      content: '남에게 간 쪽지',
      createdAt: '2026-08-18T09:20:00',
    });

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(screen.queryByText('남에게 간 쪽지')).not.toBeInTheDocument();
  });

  it('다른 대화방 쪽지는 이 화면에 안 섞인다', async () => {
    useSessionStore.getState().signIn('jaehoon');
    const client = createStompClient({ webSocketFactory: broker.webSocketFactory });
    renderRoom(client);
    await connected(client);

    broker.pushToUser('jaehoon', '/queue/dm', {
      messageId: 12,
      conversationId: 99,
      senderUsername: 'dahye',
      content: '다른 방 쪽지',
      createdAt: '2026-08-18T09:30:00',
    });

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(screen.queryByText('다른 방 쪽지')).not.toBeInTheDocument();
  });

  it('같은 쪽지가 두 번 와도 한 번만 그려진다', async () => {
    useSessionStore.getState().signIn('jaehoon');
    const client = createStompClient({ webSocketFactory: broker.webSocketFactory });
    renderRoom(client);
    await connected(client);

    const twice = {
      messageId: 13,
      conversationId: 1,
      senderUsername: 'minji',
      content: '두 번 온 쪽지',
      createdAt: '2026-08-18T09:40:00',
    };
    broker.pushToUser('jaehoon', '/queue/dm', twice);
    broker.pushToUser('jaehoon', '/queue/dm', twice);

    await screen.findByText('두 번 온 쪽지');
    expect(screen.getAllByText('두 번 온 쪽지')).toHaveLength(1);
  });
});

describe('Step 3 — /app 으로 보낸다', () => {
  it('보내기를 누르면 SEND 프레임이 나가고 입력칸이 비워진다', async () => {
    const user = userEvent.setup();
    useSessionStore.getState().signIn('jaehoon');
    const client = createStompClient({ webSocketFactory: broker.webSocketFactory });
    renderRoom(client);
    await connected(client);

    const input = screen.getByLabelText('보낼 쪽지');
    await user.type(input, '반포대교 남단이요');
    await user.click(screen.getByRole('button', { name: '보내기' }));

    const sent = broker.sent.at(-1);
    expect(sent?.command).toBe('SEND');
    expect(sent?.headers.destination).toBe(DM_SEND);
    expect(JSON.parse(sent?.body ?? '{}')).toEqual({ conversationId: 1, content: '반포대교 남단이요' });
    expect(input).toHaveValue('');
  });

  it('빈 칸으로는 안 보낸다', async () => {
    const user = userEvent.setup();
    useSessionStore.getState().signIn('jaehoon');
    const client = createStompClient({ webSocketFactory: broker.webSocketFactory });
    renderRoom(client);
    await connected(client);

    const before = broker.sent.length;
    await user.type(screen.getByLabelText('보낼 쪽지'), '   ');
    await user.click(screen.getByRole('button', { name: '보내기' }));

    expect(broker.sent).toHaveLength(before);
  });

  it('화면을 떠나면 구독을 거둔다 — 연결은 그대로 둔 채', async () => {
    useSessionStore.getState().signIn('jaehoon');
    const client = createStompClient({ webSocketFactory: broker.webSocketFactory });

    // 통로는 앱에 있고 화면만 갈린다. 실제 앱과 같은 모양이다.
    const router = createMemoryRouter(
      [
        { path: '/dm/:conversationId', element: <DmPage client={client} /> },
        { path: '/explore', element: <p>탐색</p> },
      ],
      { initialEntries: ['/dm/1'] },
    );
    render(
      withQuery(
        <>
          <RealtimeBridge client={client} />
          <RouterProvider router={router} />
        </>,
      ),
    );
    await connected(client);

    await act(async () => {
      await router.navigate('/explore');
    });

    expect(broker.sent.at(-1)?.command).toBe('UNSUBSCRIBE');
    // 구독만 끊겼다. 통로는 그대로 열려 있다.
    expect(client.connected).toBe(true);
    expect(broker.subscriptions).not.toContain(DM_QUEUE);
  });
});
