// H-2 Step 1~3 — 라우터가 잡은 오류를 밖으로 내보내는 일
//
// 앞 회차에서 이은 두 줄(onCaughtError/onUncaughtError)은 "그리다가 터진 것" 만 본다.
// loader 가 실패한 오류는 라우터가 데이터로 넘겨서 React 가 아무 일도 없었다고 보고,
// 그래서 봉투가 0건이었다. 그 구멍을 경계 안에서 메운다.
//
// 여기서 재는 것은 세 가지다.
//   (1) loader 실패가 이제 올라가는가
//   (2) 404 는 여전히 안 올라가는가 (버그가 아니라 없는 주소다)
//   (3) 렌더 크래시가 두 번 올라가지 않는가 (앞 회차의 두 줄과 겹치는 자리)
import { createServer, type Server } from 'node:http';
import { afterAll, afterEach, beforeAll, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot, type RootOptions } from 'react-dom/client';
import { createMemoryRouter, type RouteObject } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import * as Sentry from '@sentry/react';
import { RootErrorBoundary } from '@/routes/RootErrorBoundary';

const PORT = 9422;
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

// init 직후 나가는 session 봉투를 빼고 오류 봉투만 센다
function errorEnvelopeCount(): number {
  return envelopes.filter((e) => e.includes('"type":"event"')).length;
}

const OPTIONS: RootOptions = {
  onCaughtError: Sentry.reactErrorHandler(),
  onUncaughtError: Sentry.reactErrorHandler(),
};

async function render(routes: RouteObject[]): Promise<string> {
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

it('loader 가 실패하면 봉투가 올라간다', async () => {
  const text = await render([
    {
      path: '/',
      loader: () => {
        throw new Error('데이터를 못 가져왔습니다');
      },
      Component: () => <p>안 그려짐</p>,
      ErrorBoundary: RootErrorBoundary,
    },
  ]);

  expect(text).toContain('문제가 생겼어요');
  expect(errorEnvelopeCount()).toBe(1);
});

it('없는 주소(404)는 화면만 바뀌고 봉투는 안 나간다', async () => {
  const text = await render([
    {
      path: '/',
      loader: () => {
        throw new Response('그런 게시물이 없어요', { status: 404 });
      },
      Component: () => <p>안 그려짐</p>,
      ErrorBoundary: RootErrorBoundary,
    },
  ]);

  expect(text).toContain('없는 페이지예요');
  expect(errorEnvelopeCount()).toBe(0);
});

it('그리다가 터진 오류는 앞 회차의 두 줄과 겹쳐도 한 번만 올라간다', async () => {
  function Explodes(): never {
    throw new Error('그리다가 터졌습니다');
  }

  const text = await render([
    { path: '/', Component: Explodes, ErrorBoundary: RootErrorBoundary },
  ]);

  expect(text).toContain('문제가 생겼어요');
  // 경계는 두 번 그려진다. 보내는 일이 렌더 본문에 있으면 여기서 2가 된다.
  expect(errorEnvelopeCount()).toBe(1);
});

it('올라간 봉투에 우리가 던진 말이 담겨 있다', async () => {
  await render([
    {
      path: '/',
      loader: () => {
        throw new Error('데이터를 못 가져왔습니다');
      },
      Component: () => <p>안 그려짐</p>,
      ErrorBoundary: RootErrorBoundary,
    },
  ]);

  const errorBody = envelopes.find((e) => e.includes('"type":"event"')) ?? '';
  expect(errorBody).toContain('데이터를 못 가져왔습니다');
});
