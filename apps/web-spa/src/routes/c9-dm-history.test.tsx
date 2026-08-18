// apps/web-spa/src/routes/c9-dm-history.test.tsx
// C-9 Step 4 — 통로만으로는 안 되는 것, 그리고 이력과 통로를 한 곳으로 (내부 검증용)
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { DmPage } from './DmPage';
import { DmPageBeforeHistory } from '../../scratch/c9-dm-page-before';
import { RealtimeBridge } from '../realtime/RealtimeBridge';
import { createStompClient, DM_QUEUE, DM_SEND } from '../realtime/stompClient';
import { dmKey } from '../queries/dm';
import { useConnectionStore } from '../stores/useConnectionStore';
import { useSessionStore } from '../stores/useSessionStore';
import { createFakeBroker, type FakeBroker } from '../../scratch/c8-stomp-harness';
import { freshQueryClient, withQuery } from '../../scratch/c5-query-harness';
import { server, requestLog, resetRequestLog } from '../../scratch/c5-server-harness';
import { c9Handlers, fakeDmDb } from '../../scratch/c9-server-harness';
import type { DirectMessage } from '../types/dm';

let broker: FakeBroker;

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());

beforeEach(() => {
  server.use(...c9Handlers());
  resetRequestLog();
  fakeDmDb.reset();
  broker = createFakeBroker();
  useSessionStore.getState().signIn('jaehoon');
  useConnectionStore.getState().reset();
});

afterEach(() => {
  server.resetHandlers();
  useSessionStore.getState().signOut();
  useConnectionStore.getState().reset();
});

const arrived: DirectMessage = {
  messageId: 30,
  conversationId: 1,
  senderUsername: 'minji',
  content: '통로로 방금 온 쪽지',
  createdAt: '2026-08-18T10:00:00',
};

function roomRouter(element: React.ReactElement) {
  return createMemoryRouter([{ path: '/dm/:conversationId', element }], {
    initialEntries: ['/dm/1'],
  });
}

describe('Step 4 — 통로만으로는 지나간 것을 못 본다', () => {
  it('★ 얼려둔 화면은 들어가자마자 텅 비어 있다 — 지나간 쪽지가 없다', async () => {
    const client = createStompClient({
      webSocketFactory: broker.webSocketFactory,
      connectHeaders: { login: 'jaehoon' },
    });
    render(withQuery(<RouterProvider router={roomRouter(<DmPageBeforeHistory client={client} />)} />));

    client.activate();
    await expect.poll(() => client.connected).toBe(true);
    act(() => useConnectionStore.getState().setStatus('connected'));
    await expect.poll(() => broker.subscriptions).toContain(DM_QUEUE);

    // 서버는 두 개를 들고 있는데
    expect(fakeDmDb.messages).toHaveLength(2);
    // 화면에는 하나도 없다. 물어본 적이 없기 때문이다.
    expect(screen.queryByText('한강 사진 그거 어디서 찍은 거예요?')).not.toBeInTheDocument();
    expect(requestLog).toHaveLength(0);
  });
});

describe('Step 4 — 이력은 요청으로, 새 것은 통로로, 담는 곳은 하나', () => {
  function renderApp(client = createStompClient({ webSocketFactory: broker.webSocketFactory })) {
    const queryClient = freshQueryClient();
    const router = roomRouter(<DmPage client={client} />);
    render(
      withQuery(
        <>
          <RealtimeBridge client={client} />
          <RouterProvider router={router} />
        </>,
        queryClient,
      ),
    );
    return { client, queryClient, router };
  }

  it('들어가면 지나간 쪽지가 먼저 뜬다', async () => {
    renderApp();

    expect(await screen.findByText('한강 사진 그거 어디서 찍은 거예요?')).toBeInTheDocument();
    expect(requestLog).toContain('GET /api/conversations/1/messages');
  });

  it('★ 통로로 온 것이 같은 자리에 얹힌다 — 화면은 어느 쪽으로 왔는지 모른다', async () => {
    const { client } = renderApp();
    await screen.findByText('한강 사진 그거 어디서 찍은 거예요?');
    await expect.poll(() => client.connected).toBe(true);
    await expect.poll(() => broker.subscriptions).toContain(DM_QUEUE);

    broker.pushToUser('jaehoon', '/queue/dm', arrived);

    expect(await screen.findByText('통로로 방금 온 쪽지')).toBeInTheDocument();
    // 요청은 처음 한 번뿐이다. 새 쪽지 때문에 다시 물어보지 않았다.
    expect(requestLog.filter((it) => it.includes('/messages'))).toHaveLength(1);
  });

  it('★ 쪽지 화면을 떠나 있는 동안 온 것도 받아둔다', async () => {
    const { client, queryClient, router } = renderApp();
    await screen.findByText('한강 사진 그거 어디서 찍은 거예요?');
    await expect.poll(() => broker.subscriptions).toContain(DM_QUEUE);

    // 다른 화면으로 간다. 얼려둔 시절이라면 여기서 구독이 끊겼다.
    await act(async () => {
      await router.navigate('/dm/2');
    });

    // 진짜 서버는 저장하고 나서 푸시한다. 판도 그 순서를 그대로 흉내 낸다.
    fakeDmDb.messages.push(arrived);
    broker.pushToUser('jaehoon', '/queue/dm', arrived);

    // ★ 화면을 떠나 있는데도 캐시에 들어왔다. 통로가 앱에 있기 때문이다.
    await expect.poll(() => queryClient.getQueryData<DirectMessage[]>(dmKey(1))?.length).toBe(3);

    await act(async () => {
      await router.navigate('/dm/1');
    });
    expect(await screen.findByText('통로로 방금 온 쪽지')).toBeInTheDocument();
    expect(client.connected).toBe(true);
  });

  it('보내기는 그대로 통로로 나간다', async () => {
    const user = userEvent.setup();
    renderApp();
    await screen.findByText('한강 사진 그거 어디서 찍은 거예요?');

    await user.type(screen.getByLabelText('보낼 쪽지'), '노을 시간 맞춰 가볼게요');
    await user.click(screen.getByRole('button', { name: '보내기' }));

    const sent = broker.sent.at(-1);
    expect(sent?.headers.destination).toBe(DM_SEND);
    // Step 5 에서 확인용 표(clientId)가 하나 더 붙는다. 여기서 재는 것은 그게 아니다.
    expect(JSON.parse(sent?.body ?? '{}')).toMatchObject({
      conversationId: 1,
      content: '노을 시간 맞춰 가볼게요',
    });
  });

  it('빈 칸으로는 안 보낸다', async () => {
    const user = userEvent.setup();
    renderApp();
    await screen.findByText('한강 사진 그거 어디서 찍은 거예요?');

    const before = broker.sent.length;
    await user.type(screen.getByLabelText('보낼 쪽지'), '   ');
    await user.click(screen.getByRole('button', { name: '보내기' }));

    expect(broker.sent).toHaveLength(before);
  });
});

describe('Step 4 — 로그인 전에는 묻지 않는다', () => {
  it('출입증이 없으면 이력을 물어보지 않는다 — 거절만 받고 그 실패가 캐시에 남는다', async () => {
    useSessionStore.getState().signOut();
    const client = createStompClient({ webSocketFactory: broker.webSocketFactory });
    render(
      withQuery(
        <>
          <RealtimeBridge client={client} />
          <RouterProvider router={roomRouter(<DmPage client={client} />)} />
        </>,
      ),
    );

    expect(screen.getByText('쪽지를 보려면 먼저 로그인해주세요.')).toBeInTheDocument();
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(requestLog.filter((it) => it.includes('/messages'))).toHaveLength(0);
  });
});
