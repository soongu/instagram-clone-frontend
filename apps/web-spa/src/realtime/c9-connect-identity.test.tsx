// apps/web-spa/src/realtime/c9-connect-identity.test.tsx
// C-9 Step 2 — 우리가 보낸다. 그리고 서버는 우리가 누구인지 CONNECT 로 안다 (내부 검증용)
import { act, render } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createStompClient } from './stompClient';
import { RealtimeBridge } from './RealtimeBridge';
import { useConnectionStore } from '../stores/useConnectionStore';
import { useSessionStore } from '../stores/useSessionStore';
import { createFakeBroker, type FakeBroker } from '../../scratch/c8-stomp-harness';
import { withQuery } from '../../scratch/c5-query-harness';

let broker: FakeBroker;

beforeEach(() => {
  broker = createFakeBroker();
  useConnectionStore.getState().reset();
  useSessionStore.getState().signOut();
});

afterEach(() => {
  useConnectionStore.getState().reset();
  useSessionStore.getState().signOut();
});

const clientOnBroker = () => createStompClient({ webSocketFactory: broker.webSocketFactory });

describe('통로에 이름을 싣는다', () => {
  it('로그인 전에는 아무 이름도 안 실린다 — 그래도 붙는다', async () => {
    const client = clientOnBroker();
    render(withQuery(<RealtimeBridge client={client} />));

    await expect.poll(() => client.connected).toBe(true);
    expect(broker.connectHeaders.at(-1)).not.toHaveProperty('login');
  });

  it('로그인하면 그 이름으로 다시 붙는다', async () => {
    const client = clientOnBroker();
    render(withQuery(<RealtimeBridge client={client} />));
    await expect.poll(() => client.connected).toBe(true);

    const before = broker.connectHeaders.length;
    act(() => useSessionStore.getState().signIn('minji'));

    await expect.poll(() => broker.connectHeaders.length).toBe(before + 1);
    expect(broker.connectHeaders.at(-1)?.login).toBe('minji');
  });
});

describe('이번엔 우리가 보낸다', () => {
  it('publish 한 것이 SEND 프레임으로 나간다', async () => {
    const client = clientOnBroker();
    useSessionStore.getState().signIn('jaehoon');
    render(withQuery(<RealtimeBridge client={client} />));
    await expect.poll(() => client.connected).toBe(true);

    client.publish({ destination: '/app/ping', body: JSON.stringify({ message: '안녕하세요' }) });

    const sent = broker.sent.at(-1);
    expect(sent?.command).toBe('SEND');
    expect(sent?.headers.destination).toBe('/app/ping');
  });

  it('보내는 글에 누가 보냈는지를 우리가 적지 않는다', async () => {
    const client = clientOnBroker();
    useSessionStore.getState().signIn('jaehoon');
    render(withQuery(<RealtimeBridge client={client} />));
    await expect.poll(() => client.connected).toBe(true);

    client.publish({
      destination: '/app/dm.send',
      body: JSON.stringify({ conversationId: 1, content: '안녕하세요' }),
    });

    // 보낸 사람은 서버가 CONNECT 때 받아둔 이름으로 안다.
    // 우리가 적어 보내면 아무나 남의 이름으로 보낼 수 있다.
    const body = JSON.parse(broker.sent.at(-1)?.body ?? '{}');
    expect(body).not.toHaveProperty('senderUsername');
    expect(broker.connectHeaders.at(-1)?.login).toBe('jaehoon');
  });

  it('★ 안 붙은 채로 보내면 조용히 사라지지 않는다 — 던진다', () => {
    const client = clientOnBroker();

    expect(() => client.publish({ destination: '/app/ping', body: '{}' })).toThrowError(
      TypeError,
    );
    expect(() => client.publish({ destination: '/app/ping', body: '{}' })).toThrowError(
      'There is no underlying STOMP connection',
    );
  });
});
