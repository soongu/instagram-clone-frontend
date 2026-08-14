// apps/web-spa/src/routes/c2-error-boundary.test.tsx
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { routes } from './routes';
import { withApp } from '../../scratch/c3-theme-harness';
import { server, resetRequestLog, fakeAuth } from '../../scratch/c5-server-harness';
import { c6Handlers, fakeDb } from '../../scratch/c6-server-harness';
import { queryClient } from '../queries/queryClient';

// C-6 Step 6 부터 /p/:postId 가 진짜 서버에 붙는다(C-2 시절의 흉내 함수가 아니다).
// 보던 것은 그대로 두고 서버만 붙인다.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

beforeEach(() => {
  server.use(...c6Handlers());
  resetRequestLog();
  fakeAuth.reset();
  fakeDb.reset();
  // 앱이 함께 쓰는 창고라 판마다 비운다
  queryClient.clear();
});

afterEach(() => server.resetHandlers());
afterAll(() => server.close());


// 라우터가 잡은 오류를 콘솔에 흘린다. 판정과 상관없는 잡음이라 이 파일에서만 막는다.
let consoleError: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  consoleError.mockRestore();
});

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(withApp(<RouterProvider router={router} />));
  return router;
}

describe('C-2 Step 6 — loader 가 던지면 화면 대신 여기로 온다', () => {
  it('숫자가 아닌 번호로 들어오면 오류 화면이 뜬다', async () => {
    renderAt('/p/abc');

    expect(await screen.findByRole('heading', { name: '문제가 생겼어요' })).toBeInTheDocument();
  });

  it('게시물 화면은 아예 안 그려진다', async () => {
    renderAt('/p/abc');
    await screen.findByRole('heading', { name: '문제가 생겼어요' });

    expect(screen.queryByRole('region', { name: '게시물' })).not.toBeInTheDocument();
  });

  it('던진 것이 Error 면 그 메시지를 보여준다', async () => {
    renderAt('/p/abc');
    await screen.findByRole('heading', { name: '문제가 생겼어요' });

    expect(screen.getByText(/게시물 번호가 아닙니다/)).toBeInTheDocument();
  });

  it('라우터가 들고 있던 기본 화면이 아니다', async () => {
    renderAt('/p/abc');
    await screen.findByRole('heading', { name: '문제가 생겼어요' });

    // 기본 화면이 쓰는 문구 — 우리 것으로 바뀌었으면 안 보인다
    expect(screen.queryByText(/Unexpected Application Error/i)).not.toBeInTheDocument();
  });

  it('돌아갈 길을 준다', async () => {
    renderAt('/p/abc');
    await screen.findByRole('heading', { name: '문제가 생겼어요' });

    expect(screen.getByRole('link', { name: '홈으로' })).toHaveAttribute('href', '/');
  });
});

describe('C-2 Step 6 — 멀쩡한 주소는 그대로다', () => {
  it('숫자 번호는 여전히 게시물이 뜬다', async () => {
    renderAt('/p/1');

    expect(await screen.findByText('오늘 한강 노을이 미쳤다')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '문제가 생겼어요' })).not.toBeInTheDocument();
  });
});

describe('C-2 Step 6 — 받은 것을 좁혀서 쓴다', () => {
  it('useRouteError 가 주는 것은 unknown 이라 갈래를 나눠 읽는다', async () => {
    const source = await import('./RootErrorBoundary.tsx?raw');

    expect(source.default).toMatch(/useRouteError\(\)/);
    expect(source.default).toMatch(/isRouteErrorResponse\(/);
    expect(source.default).toMatch(/instanceof Error/);
  });

  it('주소 표가 Component 와 짝으로 ErrorBoundary 를 들고 있다', async () => {
    const source = await import('./routes.ts?raw');

    expect(source.default).toMatch(/ErrorBoundary: RootErrorBoundary/);
    // v6.4 시절의 element 형은 안 쓴다 — 우리는 Component 쪽으로 맞춘다
    expect(source.default).not.toMatch(/errorElement/);
  });
});
