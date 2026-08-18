// 스텁에 두 사람을 붙여 /user 목적지가 실제로 갈리는지 재는 spike.
//
//   node apps/api-stub/server.mjs        (다른 터미널에서)
//   node apps/web-spa/scratch/c9-user-queue-probe.mjs
import { Client } from '@stomp/stompjs';

const BASE = 'http://localhost:8090';

function connect(username) {
  const inbox = { dm: [], errors: [], notifications: [], topic: [] };
  const client = new Client({
    brokerURL: 'ws://localhost:8090/ws',
    connectHeaders: { login: username },
    reconnectDelay: 0,
    heartbeatIncoming: 0,
    heartbeatOutgoing: 0,
  });

  const ready = new Promise((resolve, reject) => {
    client.onConnect = () => {
      // ⚠️ 두 사람이 구독하는 글자는 완전히 같다.
      client.subscribe('/user/queue/dm', (m) => inbox.dm.push(JSON.parse(m.body)));
      client.subscribe('/user/queue/errors', (m) => inbox.errors.push(JSON.parse(m.body)));
      client.subscribe('/user/queue/notifications', (m) =>
        inbox.notifications.push(JSON.parse(m.body)),
      );
      client.subscribe('/topic/posts', (m) => inbox.topic.push(JSON.parse(m.body)));
      setTimeout(resolve, 60);
    };
    client.onStompError = (f) => reject(new Error('STOMP ERROR: ' + f.headers.message));
    client.onWebSocketError = (e) => reject(new Error('WS ERROR: ' + e.message));
  });

  client.activate();
  return ready.then(() => ({ client, inbox }));
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function login(username) {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  }).then((r) => r.json());
  return res.data.accessToken;
}

const jaehoon = await connect('jaehoon');
const minji = await connect('minji');
console.log('1) 두 사람 연결 + 같은 문자열 구독  ok');

// --- /user 가 갈리는가 -------------------------------------------------
minji.client.publish({
  destination: '/app/dm.send',
  body: JSON.stringify({ conversationId: 1, content: '테스트 쪽지', clientId: 'c-1' }),
});
await wait(200);

console.log('2) 쪽지 도착   jaehoon', jaehoon.inbox.dm.length, '· minji', minji.inbox.dm.length);
console.log('   보낸 사람에게 돌아온 것 =', JSON.stringify(minji.inbox.dm.at(-1)));

// --- 빈 내용은 에러 큐로 -----------------------------------------------
minji.client.publish({
  destination: '/app/dm.send',
  body: JSON.stringify({ conversationId: 1, content: '   ', clientId: 'c-2' }),
});
await wait(200);
console.log('3) 빈 내용     errors:', JSON.stringify(minji.inbox.errors.at(-1)));
console.log('   jaehoon 의 errors 는', jaehoon.inbox.errors.length, '건 (남의 에러는 안 온다)');

// --- 알림은 게시물 주인에게만 ------------------------------------------
const minjiToken = await login('minji');
await fetch(`${BASE}/api/posts/1/like`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${minjiToken}` },
});
await wait(400);
console.log(
  '4) 좋아요 알림  jaehoon(주인)',
  jaehoon.inbox.notifications.length,
  '· minji(누른 사람)',
  minji.inbox.notifications.length,
);
console.log('   알림 =', JSON.stringify(jaehoon.inbox.notifications.at(-1)));
console.log(
  '   /topic 은 둘 다 받았나 —  jaehoon',
  jaehoon.inbox.topic.length,
  '· minji',
  minji.inbox.topic.length,
);

// --- 이력 REST ----------------------------------------------------------
const history = await fetch(`${BASE}/api/conversations/1/messages`, {
  headers: { Authorization: `Bearer ${await login('jaehoon')}` },
}).then((r) => r.json());
console.log('5) 이력 REST   ', history.data.length, '건');

// --- 연결이 끊긴 채 보내면 ---------------------------------------------
await minji.client.deactivate();
try {
  minji.client.publish({ destination: '/app/dm.send', body: '{}' });
  console.log('6) 끊긴 채 보내기 — 아무 일도 안 일어났다');
} catch (error) {
  console.log('6) 끊긴 채 보내기 —', error.constructor.name + ':', error.message);
}

await jaehoon.client.deactivate();
process.exit(0);
