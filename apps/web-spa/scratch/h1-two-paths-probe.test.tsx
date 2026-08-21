// 계획 단계 탐침 — 오류가 어디서 나느냐에 따라 onCaughtError 가 보고 못 보고가 갈리는가
import { createServer, type Server } from 'node:http';
import { afterAll, afterEach, beforeAll, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot, type RootOptions } from 'react-dom/client';
import { createMemoryRouter, type RouteObject } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import * as Sentry from '@sentry/react';
import { RootErrorBoundary } from '@/routes/RootErrorBoundary';

const PORT = 9415;
let envelopes: string[] = [];
let server: Server;

beforeAll(async () => {
  server = createServer((req, res) => {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      envelopes.push(body);
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end('{}');
    });
  });
  await new Promise<void>((r) => server.listen(PORT, r));
  Sentry.init({ dsn: `http://demopublickey123@localhost:${PORT}/7`, tracesSampleRate: 0 });
});

afterAll(async () => {
  await Sentry.close(2000);
  await new Promise<void>((r) => server.close(() => r()));
});

afterEach(() => {
  envelopes = [];
});

const OPTIONS: RootOptions = {
  onCaughtError: Sentry.reactErrorHandler(),
  onUncaughtError: Sentry.reactErrorHandler(),
};

async function run(routes: RouteObject[]): Promise<string> {
  const el = document.createElement('div');
  document.body.appendChild(el);
  const router = createMemoryRouter(routes, { initialEntries: ['/'] });
  const root = createRoot(el, OPTIONS);
  await act(async () => {
    root.render(<RouterProvider router={router} />);
  });
  await Sentry.flush(2000);
  const text = el.textContent ?? '';
  act(() => root.unmount());
  el.remove();
  return text;
}

it('경로 1 — 그리다가 터진다 (렌더 크래시)', async () => {
  function Explodes(): never {
    throw new Error('그리다가 터졌습니다');
  }
  const text = await run([{ path: '/', Component: Explodes, ErrorBoundary: RootErrorBoundary }]);
  console.log('[경로1 렌더] 봉투:', envelopes.length, '| 화면:', text.slice(0, 30));
});

it('경로 2 — loader 가 터진다 (데이터 실패)', async () => {
  const text = await run([
    {
      path: '/',
      loader: () => {
        throw new Error('데이터를 못 가져왔습니다');
      },
      Component: () => <p>안 그려짐</p>,
      ErrorBoundary: RootErrorBoundary,
    },
  ]);
  console.log('[경로2 loader] 봉투:', envelopes.length, '| 화면:', text.slice(0, 30));
});

it('경로 3 — loader 가 Response 를 던진다 (404)', async () => {
  const text = await run([
    {
      path: '/',
      loader: () => {
        throw new Response('그런 게시물이 없어요', { status: 404 });
      },
      Component: () => <p>안 그려짐</p>,
      ErrorBoundary: RootErrorBoundary,
    },
  ]);
  console.log('[경로3 404] 봉투:', envelopes.length, '| 화면:', text.slice(0, 30));
});
