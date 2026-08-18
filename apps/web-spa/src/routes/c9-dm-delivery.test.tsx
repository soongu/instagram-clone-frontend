// apps/web-spa/src/routes/c9-dm-delivery.test.tsx
// C-9 Step 5 — 보낸 것이 갔는지 우리는 모른다 (내부 검증용)
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { DmPage } from './DmPage';
import { RealtimeBridge } from '../realtime/RealtimeBridge';
import { createStompClient, DM_QUEUE, ERRORS_QUEUE } from '../realtime/stompClient';
import { useConnectionStore } from '../stores/useConnectionStore';
import { useSessionStore } from '../stores/useSessionStore';
import { createFakeBroker, type FakeBroker } from '../../scratch/c8-stomp-harness';
import { withQuery } from '../../scratch/c5-query-harness';
import { server, resetRequestLog } from '../../scratch/c5-server-harness';
import { c9Handlers, fakeDmDb } from '../../scratch/c9-server-harness';

let broker: FakeBroker;
let nextId = 100;

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

function renderApp() {
  const client = createStompClient({ webSocketFactory: broker.webSocketFactory });
  const router = createMemoryRouter([{ path: '/dm/:conversationId', element: <DmPage client={client} /> }], {
    initialEntries: ['/dm/1'],
  });
  render(
    withQuery(
      <>
        <RealtimeBridge client={client} />
        <RouterProvider router={router} />
      </>,
    ),
  );
  return client;
}

async function ready(client: ReturnType<typeof createStompClient>) {
  await screen.findByText('한강 사진 그거 어디서 찍은 거예요?');
  await expect.poll(() => client.connected).toBe(true);
  await expect.poll(() => broker.subscriptions).toContain(DM_QUEUE);
}

// 방금 보낸 SEND 프레임에 우리가 붙인 표를 꺼낸다.
function lastClientId(): string {
  const sent = [...broker.sent].reverse().find((it) => it.command === 'SEND');
  return JSON.parse(sent?.body ?? '{}').clientId;
}

describe('Step 5 — 보내고 나서 확인을 기다린다', () => {
  it('보내자마자 "보내는 중" 으로 뜬다 — 아직 서버는 모른다', async () => {
    const user = userEvent.setup();
    const client = renderApp();
    await ready(client);

    await user.type(screen.getByLabelText('보낼 쪽지'), '노을 시간 맞춰 가볼게요');
    await user.click(screen.getByRole('button', { name: '보내기' }));

    expect(screen.getByText('보내는 중…')).toBeInTheDocument();
    expect(screen.getByText(/노을 시간 맞춰 가볼게요/)).toBeInTheDocument();
  });

  it('★ 서버가 우리 표를 그대로 실어 돌려주면 그때 확정된다', async () => {
    const user = userEvent.setup();
    const client = renderApp();
    await ready(client);

    await user.type(screen.getByLabelText('보낼 쪽지'), '노을 시간 맞춰 가볼게요');
    await user.click(screen.getByRole('button', { name: '보내기' }));
    expect(screen.getByText('보내는 중…')).toBeInTheDocument();

    // 서버가 저장하고 나서 보낸 사람에게도 되돌려 보낸다 (백엔드의 @SendToUser).
    broker.pushToUser('jaehoon', '/queue/dm', {
      messageId: (nextId += 1),
      conversationId: 1,
      senderUsername: 'jaehoon',
      content: '노을 시간 맞춰 가볼게요',
      createdAt: '2026-08-18T10:05:00',
      clientId: lastClientId(),
    });

    await expect.poll(() => screen.queryByText('보내는 중…')).toBe(null);
    expect(screen.getByText('노을 시간 맞춰 가볼게요')).toBeInTheDocument();
  });

  it('표가 다르면 확정되지 않는다 — 남이 보낸 것과 헷갈리지 않는다', async () => {
    const user = userEvent.setup();
    const client = renderApp();
    await ready(client);

    await user.type(screen.getByLabelText('보낼 쪽지'), '내가 보낸 것');
    await user.click(screen.getByRole('button', { name: '보내기' }));

    // 같은 글자지만 우리 표가 안 붙어 있다.
    broker.pushToUser('jaehoon', '/queue/dm', {
      messageId: (nextId += 1),
      conversationId: 1,
      senderUsername: 'minji',
      content: '내가 보낸 것',
      createdAt: '2026-08-18T10:06:00',
    });

    await screen.findAllByText(/내가 보낸 것/);
    expect(screen.getByText('보내는 중…')).toBeInTheDocument();
  });

  it('★ 거절당하면 다른 줄로 답이 온다 — 그 쪽지가 안 갔다고 표시된다', async () => {
    const user = userEvent.setup();
    const client = renderApp();
    await ready(client);
    await expect.poll(() => broker.subscriptions).toContain(ERRORS_QUEUE);

    await user.type(screen.getByLabelText('보낼 쪽지'), '참여 안 한 방으로');
    await user.click(screen.getByRole('button', { name: '보내기' }));

    broker.pushToUser('jaehoon', '/queue/errors', {
      code: 'CONVERSATION_NOT_FOUND',
      message: '참여하지 않은 대화방입니다',
      clientId: lastClientId(),
    });

    expect(await screen.findByText(/안 갔어요 — 참여하지 않은 대화방입니다/)).toBeInTheDocument();
    expect(screen.queryByText('보내는 중…')).toBe(null);
  });

  it('남의 실패는 우리 화면을 안 건드린다', async () => {
    const user = userEvent.setup();
    const client = renderApp();
    await ready(client);
    await expect.poll(() => broker.subscriptions).toContain(ERRORS_QUEUE);

    await user.type(screen.getByLabelText('보낼 쪽지'), '내 쪽지');
    await user.click(screen.getByRole('button', { name: '보내기' }));

    broker.pushToUser('minji', '/queue/errors', {
      code: 'EMPTY_CONTENT',
      message: '내용을 입력해주세요',
      clientId: lastClientId(),
    });

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(screen.getByText('보내는 중…')).toBeInTheDocument();
  });

  it('끊겨 있으면 보내기 자체를 못 누른다 — publish 는 던지기 때문이다', async () => {
    const client = renderApp();
    await ready(client);

    broker.dropAll();

    await expect.poll(() => screen.getByRole('button', { name: '보내기' })).toBeDisabled();
    expect(client.connected).toBe(false);
  });
});
