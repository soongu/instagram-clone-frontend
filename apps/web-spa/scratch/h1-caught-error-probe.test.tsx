// 계획 단계 탐침 — 라우터가 잡은 오류를 Sentry 전역 처리기가 보는가
import { createServer, type Server } from 'node:http';
import { afterAll, beforeAll, beforeEach, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, type RouteObject } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import * as Sentry from '@sentry/react';
import { RootErrorBoundary } from '@/routes/RootErrorBoundary';

const PORT = 9412;
let received: string[] = [];
let server: Server;

beforeAll(async () => {
  server = createServer((req, res) => {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      received.push(body);
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end('{}');
    });
  });
  await new Promise<void>((r) => server.listen(PORT, r));

  Sentry.init({
    dsn: `http://abc123def456@localhost:${PORT}/7`,
    tracesSampleRate: 0,
  });
});

afterAll(async () => {
  await new Promise<void>((r) => server.close(() => r()));
});

beforeEach(() => {
  received = [];
});

function Explodes(): never {
  throw new Error('렌더 도중 터졌습니다');
}

const routes: RouteObject[] = [
  { path: '/', Component: Explodes, ErrorBoundary: RootErrorBoundary },
];

it('라우터가 잡은 렌더 오류 — 봉투가 나가는가', async () => {
  const router = createMemoryRouter(routes, { initialEntries: ['/'] });
  render(<RouterProvider router={router} />);

  // 오류 화면이 실제로 떴는지부터 확인 (= 라우터가 잡았다)
  expect(await screen.findByText('문제가 생겼어요')).toBeInTheDocument();

  await Sentry.flush(2000);

  console.log('[탐침A] 라우터가 잡은 오류 → 나간 봉투 수:', received.length);
  expect(screen.getByText('렌더 도중 터졌습니다')).toBeInTheDocument();
});

it('대조군 — 우리가 손으로 부르면 나가는가', async () => {
  Sentry.captureException(new Error('손으로 부른 오류'));
  await Sentry.flush(2000);
  console.log('[탐침B] 손으로 부른 오류 → 나간 봉투 수:', received.length);
  expect(received.length).toBeGreaterThan(0);
});
