// 계획 단계 탐침 — 계정 없이 로컬 주소를 DSN 으로 주면 SDK 가 실제로 보내는가
import { createServer, type Server } from 'node:http';
import { afterAll, beforeAll, expect, it } from 'vitest';
import * as Sentry from '@sentry/react';

const PORT = 9411;
const received: { url: string; body: string }[] = [];
let server: Server;

beforeAll(async () => {
  server = createServer((req, res) => {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      received.push({ url: req.url ?? '', body });
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end('{}');
    });
  });
  await new Promise<void>((r) => server.listen(PORT, r));
});

afterAll(async () => {
  await new Promise<void>((r) => server.close(() => r()));
});

it('가짜 공개키 + 로컬 주소 DSN 으로 봉투가 도착하는가', async () => {
  Sentry.init({
    dsn: `http://abc123def456@localhost:${PORT}/7`,
    tracesSampleRate: 0,
    // 브라우저 SDK 기본 전송은 fetch — node 23 에 전역 fetch 가 있다
  });

  Sentry.captureException(new Error('탐침용 오류입니다'));
  const flushed = await Sentry.flush(5000);

  console.log('[탐침] flush 반환값:', flushed);
  console.log('[탐침] 받은 요청 수:', received.length);
  for (const r of received) {
    console.log('[탐침] 주소:', r.url);
    console.log('[탐침] 본문 길이:', r.body.length);
    console.log('[탐침] 본문 앞 600자:\n' + r.body.slice(0, 600));
  }

  expect(received.length).toBeGreaterThan(0);
});
