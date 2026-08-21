// 계획 단계 탐침 — 경계를 잇는 두 방법 중 무엇이 라우터가 잡은 오류를 받는가
import { createServer, type Server } from 'node:http';
import { afterAll, beforeAll, beforeEach, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryRouter, type RouteObject } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import * as Sentry from '@sentry/react';
import { RootErrorBoundary } from '@/routes/RootErrorBoundary';

const PORT = 9413;
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
  Sentry.init({ dsn: `http://abc123def456@localhost:${PORT}/7`, tracesSampleRate: 0 });
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

function mount(options?: Parameters<typeof createRoot>[1]): HTMLElement {
  const el = document.createElement('div');
  document.body.appendChild(el);
  const router = createMemoryRouter(routes, { initialEntries: ['/'] });
  const root = createRoot(el, options);
  act(() => root.render(<RouterProvider router={router} />));
  return el;
}

it('방법 A — createRoot 의 onCaughtError 에 reactErrorHandler', async () => {
  const el = mount({ onCaughtError: Sentry.reactErrorHandler() });
  await Sentry.flush(2000);
  console.log('[A] onCaughtError → 봉투:', received.length, '| 화면:', el.textContent?.slice(0, 20));
  expect(el.textContent).toContain('문제가 생겼어요');
});

it('방법 B — 아무것도 안 이었을 때 (대조군)', async () => {
  const el = mount();
  await Sentry.flush(2000);
  console.log('[B] 안 이음 → 봉투:', received.length, '| 화면:', el.textContent?.slice(0, 20));
  expect(el.textContent).toContain('문제가 생겼어요');
});
