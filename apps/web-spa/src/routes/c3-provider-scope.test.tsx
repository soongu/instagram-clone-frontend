import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { AppProviders } from '../AppProviders';
import { routes } from './routes';
import { THEME_COLOR, THEME_STORAGE_KEY } from '../lib/theme';
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


function readThemeColor() {
  return document.querySelector('meta[name="theme-color"]')?.getAttribute('content');
}

function renderAppAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });

  render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  );

  return router;
}

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.classList.remove('dark');
  document.head.querySelector('meta[name="theme-color"]')?.remove();

  const meta = document.createElement('meta');
  meta.name = 'theme-color';
  meta.content = THEME_COLOR.light;
  document.head.append(meta);
});

describe('Provider 를 어디에 두느냐가 범위를 정한다', () => {
  it('정상 화면에서는 저장된 선택이 주소창까지 닿는다', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark');

    renderAppAt('/');

    expect(readThemeColor()).toBe(THEME_COLOR.dark);
  });

  it('던져진 화면에서도 닿는다 — 라우터 바깥에 있으니까', async () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark');

    renderAppAt('/p/999');

    // 이 화면은 Layout 을 통째로 대체한다. 머리말도 토글도 없다.
    expect(await screen.findByText('없는 페이지예요', undefined, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: '화면 밝기' })).toBeNull();
    expect(screen.queryByRole('navigation', { name: '주요 메뉴' })).toBeNull();

    // 그래도 주소창 색은 맞다 — Layout 안에 뒀다면 여기서 밝은 값으로 남았을 자리
    expect(readThemeColor()).toBe(THEME_COLOR.dark);
  });

  it('Layout 은 더 이상 범위를 정하지 않는다', async () => {
    const layout = await import('./Layout.tsx?raw');

    expect(layout.default).not.toMatch(/ThemeProvider/);
    expect(layout.default).not.toMatch(/ThemeColorMeta/);
  });

  it('범위를 정하는 곳은 라우터를 감싸는 자리다', async () => {
    const main = await import('../main.tsx?raw');

    expect(main.default).toMatch(/<AppProviders>/);
    expect(main.default).toMatch(/<RouterProvider/);
    // AppProviders 가 RouterProvider 보다 먼저 열린다
    expect(main.default.indexOf('<AppProviders>')).toBeLessThan(
      main.default.indexOf('<RouterProvider'),
    );
  });
});
