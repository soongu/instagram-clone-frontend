// apps/web-spa/src/lib/h1-monitoring.test.tsx
//
// 오류가 실제로 밖으로 나가는지를 지킨다.
//
// 여기서 세우는 것은 "오류 받는 연습용 서비스" 를 대신하는 아주 작은 서버다.
// SDK 는 DSN 이 가리키는 주소로 봉투를 POST 하므로, 그 주소를 이 서버로 돌리면
// 무엇이 나가는지 셀 수 있다.
import { createServer, type Server } from 'node:http';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot, type RootOptions } from 'react-dom/client';
import { createMemoryRouter, type RouteObject } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import * as Sentry from '@sentry/react';
import { RootErrorBoundary } from '@/routes/RootErrorBoundary';

const PORT = 9414;

let envelopes: string[] = [];
let server: Server;
const mounted: { unmount: () => void; el: HTMLElement }[] = [];

beforeAll(async () => {
  server = createServer((req, res) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      envelopes.push(body);
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end('{}');
    });
  });
  await new Promise<void>((resolve) => server.listen(PORT, resolve));

  Sentry.init({
    dsn: `http://demopublickey123@localhost:${PORT}/7`,
    tracesSampleRate: 0,
  });
});

afterAll(async () => {
  await Sentry.close(2000);
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

afterEach(() => {
  envelopes = [];
  for (const item of mounted.splice(0)) {
    act(() => item.unmount());
    item.el.remove();
  }
});

function Explodes(): never {
  throw new Error('렌더 도중 터졌습니다');
}

const routes: RouteObject[] = [
  { path: '/', Component: Explodes, ErrorBoundary: RootErrorBoundary },
];

/** 앱과 같은 모양으로 띄운다 — 라우터가 잡는 경계를 그대로 쓴다. */
function mount(options?: RootOptions): HTMLElement {
  const el = document.createElement('div');
  document.body.appendChild(el);
  const router = createMemoryRouter(routes, { initialEntries: ['/'] });
  const root = createRoot(el, options);
  act(() => root.render(<RouterProvider router={router} />));
  mounted.push({ unmount: () => root.unmount(), el });
  return el;
}

describe('라우터가 잡은 오류를 밖으로 내보내기', () => {
  it('안 이어두면 화면만 바뀌고 아무것도 안 나간다', async () => {
    const el = mount();

    expect(el.textContent).toContain('문제가 생겼어요');
    await Sentry.flush(2000);

    expect(envelopes).toHaveLength(0);
  });

  it('onCaughtError 를 이어두면 나간다', async () => {
    const el = mount({ onCaughtError: Sentry.reactErrorHandler() });

    expect(el.textContent).toContain('문제가 생겼어요');
    await Sentry.flush(2000);

    expect(envelopes).toHaveLength(1);
    expect(envelopes[0]).toContain('렌더 도중 터졌습니다');
  });

  it('두 경우의 화면 글자가 완전히 같다 — 눈으로는 못 가른다', async () => {
    const 안이음 = mount().textContent;
    const 이음 = mount({ onCaughtError: Sentry.reactErrorHandler() }).textContent;

    expect(이음).toBe(안이음);
  });
});

describe('앱이 실제로 이어두었는가', () => {
  // 위의 판들은 "이으면 나간다" 는 것까지만 지킨다.
  // 정작 앱이 그 줄을 들고 있는지는 화면에도 테스트에도 안 드러나므로
  // 진입 파일을 직접 읽어 확인한다.
  const entry = readFileSync(resolve(import.meta.dirname, '../main.tsx'), 'utf-8');

  it('createRoot 에 두 처리기가 걸려 있다', () => {
    expect(entry).toContain('onCaughtError: Sentry.reactErrorHandler()');
    expect(entry).toContain('onUncaughtError: Sentry.reactErrorHandler()');
  });

  it('보내는 쪽을 그리기 전에 켠다', () => {
    expect(entry.indexOf('startMonitoring()')).toBeLessThan(entry.indexOf('createRoot('));
  });
});
