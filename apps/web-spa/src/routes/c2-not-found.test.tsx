// apps/web-spa/src/routes/c2-not-found.test.tsx
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { routes } from './routes';
import { withApp } from '../../scratch/c3-theme-harness';

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

describe('C-2 Step 7 — 없는 주소: 라우터가 표에서 못 찾은 것', () => {
  it('아무 주소나 치면 없는 주소라고 알린다', async () => {
    renderAt('/이런주소는없다');

    expect(await screen.findByRole('heading', { name: '없는 주소예요' })).toBeInTheDocument();
  });

  it('머리말이 그대로 남는다 — 오류가 아니라 우리가 맡은 화면이라서다', async () => {
    renderAt('/이런주소는없다');
    await screen.findByRole('heading', { name: '없는 주소예요' });

    expect(screen.getByRole('navigation', { name: '주요 메뉴' })).toBeInTheDocument();
  });

  it('별표는 맨 끝이라 멀쩡한 주소를 안 가로챈다', async () => {
    renderAt('/explore');

    expect(await screen.findByRole('list', { name: '탐색 목록' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '없는 주소예요' })).not.toBeInTheDocument();
  });
});

describe('C-2 Step 7 — 없는 게시물: 주소는 맞는데 데이터가 없는 것', () => {
  it('404 를 던지면 상태 번호가 함께 온다', async () => {
    renderAt('/p/999');

    expect(await screen.findByRole('heading', { name: '없는 페이지예요' })).toBeInTheDocument();
    expect(screen.getByText(/404/)).toBeInTheDocument();
    expect(screen.getByText(/게시물을 찾을 수 없습니다/)).toBeInTheDocument();
  });

  it('이쪽은 머리말이 사라진다 — ErrorBoundary 가 Layout 을 대신하기 때문이다', async () => {
    renderAt('/p/999');
    await screen.findByRole('heading', { name: '없는 페이지예요' });

    expect(screen.queryByRole('navigation', { name: '주요 메뉴' })).not.toBeInTheDocument();
  });

  it('숫자가 아닌 번호는 404 가 아니다 — 던진 것이 Error 라서다', async () => {
    renderAt('/p/abc');

    expect(await screen.findByRole('heading', { name: '문제가 생겼어요' })).toBeInTheDocument();
    expect(screen.queryByText(/404/)).not.toBeInTheDocument();
  });
});

describe('C-2 Step 7 — 화면에서 갈래가 하나 더 사라졌다', () => {
  it('상세는 이제 못 찾은 경우를 신경 쓰지 않는다', async () => {
    const source = await import('./PostDetailPage.tsx?raw');

    expect(source.default).not.toMatch(/찾을 수 없습니다/);
    expect(source.default).not.toMatch(/undefined/);
  });

  it('사람이 읽을 말은 본문에 담는다 — statusText 에는 한글이 안 들어간다', async () => {
    const source = await import('./postLoader.ts?raw');

    expect(source.default).toMatch(/new Response\('게시물을 찾을 수 없습니다'/);
    expect(source.default).toMatch(/status: 404/);
  });
});
