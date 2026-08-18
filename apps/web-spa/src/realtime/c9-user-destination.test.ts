import { describe, expect, it } from 'vitest';
import { Client } from '@stomp/stompjs';
import { createFakeBroker } from '../../scratch/c8-stomp-harness';

// 한 브로커에 두 사람을 붙인다. 두 사람의 구독 코드는 완전히 같다.
async function connectAs(
  broker: ReturnType<typeof createFakeBroker>,
  username: string,
  destinations: string[],
) {
  const inbox: { destination: string; body: unknown }[] = [];
  const client = new Client({
    webSocketFactory: broker.webSocketFactory,
    connectHeaders: { login: username },
    reconnectDelay: 0,
    heartbeatIncoming: 0,
    heartbeatOutgoing: 0,
  });

  await new Promise<void>((resolve) => {
    client.onConnect = () => {
      for (const destination of destinations) {
        client.subscribe(destination, (message) => {
          inbox.push({ destination, body: JSON.parse(message.body) });
        });
      }
      resolve();
    };
    client.activate();
  });

  return { client, inbox };
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('구독한 글자는 같은데 도착하는 것이 갈린다', () => {
  it('/topic 은 구독한 사람 전부에게 간다', async () => {
    const broker = createFakeBroker();
    const jaehoon = await connectAs(broker, 'jaehoon', ['/topic/posts']);
    const minji = await connectAs(broker, 'minji', ['/topic/posts']);

    broker.push('/topic/posts', { type: 'like', postId: 1, likeCount: 1241 });
    await settle();

    expect(jaehoon.inbox).toHaveLength(1);
    expect(minji.inbox).toHaveLength(1);

    await jaehoon.client.deactivate();
    await minji.client.deactivate();
  });

  it('/user/queue 는 같은 줄을 구독해도 한 사람에게만 간다', async () => {
    const broker = createFakeBroker();
    const jaehoon = await connectAs(broker, 'jaehoon', ['/user/queue/dm']);
    const minji = await connectAs(broker, 'minji', ['/user/queue/dm']);

    // 두 사람이 서버에 보낸 SUBSCRIBE 의 목적지가 글자 하나 안 다르다.
    expect(broker.subscriptions).toEqual(['/user/queue/dm', '/user/queue/dm']);

    broker.pushToUser('minji', '/queue/dm', { messageId: 3, content: '테스트 쪽지' });
    await settle();

    expect(jaehoon.inbox).toHaveLength(0);
    expect(minji.inbox).toHaveLength(1);

    await jaehoon.client.deactivate();
    await minji.client.deactivate();
  });

  it('한 사건이 두 목적지에서 갈린다 — 모두가 아는 것과 주인만 아는 것', async () => {
    const broker = createFakeBroker();
    const jaehoon = await connectAs(broker, 'jaehoon', [
      '/topic/posts',
      '/user/queue/notifications',
    ]);
    const minji = await connectAs(broker, 'minji', ['/topic/posts', '/user/queue/notifications']);

    // minji 가 jaehoon 의 게시물에 좋아요를 눌렀다. 서버는 두 곳으로 보낸다.
    broker.push('/topic/posts', { type: 'like', postId: 1, likeCount: 1241 });
    broker.pushToUser('jaehoon', '/queue/notifications', {
      type: 'LIKE',
      message: 'minji 님이 회원님의 게시물을 좋아합니다',
    });
    await settle();

    const count = (inbox: { destination: string }[], destination: string) =>
      inbox.filter((it) => it.destination === destination).length;

    expect(count(jaehoon.inbox, '/topic/posts')).toBe(1);
    expect(count(minji.inbox, '/topic/posts')).toBe(1);
    expect(count(jaehoon.inbox, '/user/queue/notifications')).toBe(1);
    expect(count(minji.inbox, '/user/queue/notifications')).toBe(0);

    await jaehoon.client.deactivate();
    await minji.client.deactivate();
  });

  it('/user 는 목적지 이름의 일부가 아니라 서버에게 보내는 표시다', async () => {
    const broker = createFakeBroker();
    // 구독은 /user 를 붙여서, 서버는 /user 없이 보낸다. 그런데도 도착한다.
    const jaehoon = await connectAs(broker, 'jaehoon', ['/user/queue/dm']);

    broker.pushToUser('jaehoon', '/queue/dm', { messageId: 1 });
    await settle();

    expect(jaehoon.inbox).toHaveLength(1);
    // 도착한 프레임에 적힌 목적지는 우리가 구독한 그 이름이다.
    expect(jaehoon.inbox[0].destination).toBe('/user/queue/dm');

    await jaehoon.client.deactivate();
  });
});
