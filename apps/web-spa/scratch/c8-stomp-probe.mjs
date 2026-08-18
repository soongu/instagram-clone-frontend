// 실물 @stomp/stompjs 7.3.0 이 우리 스텁 브로커에 붙는지 확인하는 spike.
import { Client } from '@stomp/stompjs';

const BASE = 'http://localhost:8090';
const frames = [];
const received = [];

const client = new Client({
  brokerURL: 'ws://localhost:8090/ws',
  connectHeaders: { login: 'jaehoon' },
  heartbeatIncoming: 10000,
  heartbeatOutgoing: 10000,
  reconnectDelay: 0,
  debug: (line) => frames.push(line),
});

const connected = new Promise((resolve, reject) => {
  client.onConnect = resolve;
  client.onStompError = (f) => reject(new Error('STOMP ERROR: ' + f.headers.message));
  client.onWebSocketError = (e) => reject(new Error('WS ERROR: ' + e.message));
});

client.activate();
await connected;
console.log('1) CONNECTED  ok');

client.subscribe('/topic/posts', (message) => {
  received.push(JSON.parse(message.body));
});
client.subscribe('/topic/pong', (message) => {
  received.push(JSON.parse(message.body));
});
await new Promise((r) => setTimeout(r, 100));
console.log('2) SUBSCRIBE  ok');

// /app 으로 보내기 — 백엔드 과목의 ping/pong 과 같은 규칙
client.publish({ destination: '/app/ping', body: JSON.stringify({ message: '안녕하세요' }) });
await new Promise((r) => setTimeout(r, 200));
console.log('3) ping→pong  ', JSON.stringify(received.at(-1)));

// REST 로 좋아요를 누르면 열려 있는 연결에 알림이 와야 한다
const login = await fetch(`${BASE}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'jaehoon' }),
}).then((r) => r.json());

const before = received.length;
await fetch(`${BASE}/api/posts/1/like`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${login.data.accessToken}` },
});
await new Promise((r) => setTimeout(r, 300));
console.log('4) REST→푸시  ', received.length > before ? JSON.stringify(received.at(-1)) : '❌ 못 받음');

console.log('\n--- 오간 프레임 ---');
for (const line of frames.slice(0, 14)) console.log(line);

client.deactivate();
process.exit(0);
