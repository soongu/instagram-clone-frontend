import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { DmPage } from '../src/routes/DmPage';
import { RealtimeBridge } from '../src/realtime/RealtimeBridge';
import { createStompClient, DM_QUEUE } from '../src/realtime/stompClient';
import { useConnectionStore } from '../src/stores/useConnectionStore';
import { useSessionStore } from '../src/stores/useSessionStore';
import { createFakeBroker, type FakeBroker } from './c8-stomp-harness';
import { withQuery } from './c5-query-harness';
import { server, resetRequestLog } from './c5-server-harness';
import { c9Handlers, fakeDmDb } from './c9-server-harness';

let broker: FakeBroker;
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());
beforeEach(() => {
  server.use(...c9Handlers()); resetRequestLog(); fakeDmDb.reset();
  broker = createFakeBroker();
  useSessionStore.getState().signIn('jaehoon');
  useConnectionStore.getState().reset();
});
afterEach(() => { server.resetHandlers(); useSessionStore.getState().signOut(); useConnectionStore.getState().reset(); });

describe('답안 주장 확인', () => {
  it('과제 3 — SUBSCRIBE 프레임의 id 형식과 목적지 네 개', async () => {
    const user = userEvent.setup();
    const client = createStompClient({ webSocketFactory: broker.webSocketFactory });
    const router = createMemoryRouter([{ path: '/dm/:conversationId', element: <DmPage client={client} /> }], { initialEntries: ['/dm/1'] });
    render(withQuery(<><RealtimeBridge client={client} /><RouterProvider router={router} /></>));
    await screen.findByText('한강 사진 그거 어디서 찍은 거예요?');
    await expect.poll(() => broker.subscriptions.length).toBe(4);
    const subs = broker.sent.filter((f) => f.command === 'SUBSCRIBE');
    console.log('SUBS=' + subs.map((f) => `${f.headers.id}|${f.headers.destination}`).join(' , '));
    expect(subs).toHaveLength(4);
    void user;
  });

  it('과제 4 — clientId 를 빼면 두 줄로 보인다', async () => {
    const user = userEvent.setup();
    const client = createStompClient({ webSocketFactory: broker.webSocketFactory });
    const router = createMemoryRouter([{ path: '/dm/:conversationId', element: <DmPage client={client} /> }], { initialEntries: ['/dm/1'] });
    render(withQuery(<><RealtimeBridge client={client} /><RouterProvider router={router} /></>));
    await screen.findByText('한강 사진 그거 어디서 찍은 거예요?');
    await expect.poll(() => broker.subscriptions).toContain(DM_QUEUE);

    await user.type(screen.getByLabelText('보낼 쪽지'), '표 없는 쪽지');
    await user.click(screen.getByRole('button', { name: '보내기' }));

    // 서버가 표를 안 실어 돌려준 경우
    broker.pushToUser('jaehoon', '/queue/dm', {
      messageId: 77, conversationId: 1, senderUsername: 'jaehoon',
      content: '표 없는 쪽지', createdAt: '2026-08-18T11:00:00',
    });

    await screen.findAllByText(/표 없는 쪽지/);
    const rows = screen.getAllByText(/표 없는 쪽지/);
    console.log('화면의 줄 수:', rows.length, '· 보내는 중 남음:', screen.queryByText('보내는 중…') !== null);
    expect(rows.length).toBe(2);
    expect(screen.getByText('보내는 중…')).toBeInTheDocument();
  });
});
