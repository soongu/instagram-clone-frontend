// apps/web-spa/src/routes/c1-layout.test.tsx
import { act, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';
import { routes } from './routes';
import { routesWithFeed } from '../../scratch/c1-router-harness';
import { withApp } from '../../scratch/c3-theme-harness';

function renderAt(path: string) {
  const router = createMemoryRouter(routesWithFeed(), { initialEntries: [path] });
  render(withApp(<RouterProvider router={router} />));
  return router;
}

describe('C-1 Step 5 — 머리는 한 번만 그려진다', () => {
  it('/ 에서 제목과 밝기 버튼이 하나씩이다', () => {
    renderAt('/');

    expect(screen.getAllByRole('heading', { name: '인스타그램', level: 1 })).toHaveLength(1);
    expect(screen.getAllByRole('group', { name: '화면 밝기' })).toHaveLength(1);
  });

  it('/signup 에서도 같은 머리가 하나 있다', () => {
    renderAt('/signup');

    expect(screen.getAllByRole('heading', { name: '인스타그램', level: 1 })).toHaveLength(1);
    expect(screen.getAllByRole('group', { name: '화면 밝기' })).toHaveLength(1);
  });

  it('Layout 만 ThemeToggle 을 가져온다 — 두 페이지는 더 안 가져온다', async () => {
    const layout = await import('./Layout.tsx?raw');
    const home = await import('./HomePage.tsx?raw');
    const signUp = await import('./SignUpPage.tsx?raw');

    expect(layout.default).toMatch(/import \{ ThemeToggle \}/);
    expect(home.default).not.toMatch(/ThemeToggle/);
    expect(signUp.default).not.toMatch(/ThemeToggle/);
  });
});

describe('C-1 Step 5 — 갈리는 것은 Outlet 자리뿐이다', () => {
  it('주소를 옮겨도 머리는 같은 DOM 요소 그대로다', async () => {
    const router = renderAt('/');
    const headerBefore = screen.getByRole('heading', { name: '인스타그램', level: 1 });

    expect(screen.getByRole('list', { name: '피드 목록' })).toBeInTheDocument();

    await act(() => router.navigate('/signup'));

    const headerAfter = screen.getByRole('heading', { name: '인스타그램', level: 1 });

    // 다시 만들어진 게 아니라 살아남은 것 — 같은 노드다
    expect(headerAfter).toBe(headerBefore);
    // 안쪽만 갈렸다 (C-7 이후 회원가입은 따로 내려받으므로 도착을 기다린다)
    expect(await screen.findByRole('region', { name: '회원가입' })).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: '피드 목록' })).not.toBeInTheDocument();
  });
});

describe('C-1 Step 5 — index 가 / 를 맡는다', () => {
  it('부모는 path 를, 자식 하나는 index 를 가진다', () => {
    const [root] = routes;

    expect(root.path).toBe('/');

    const indexRoutes = root.children?.filter((child) => 'index' in child && child.index);
    const signUpRoute = root.children?.find((child) => 'path' in child && child.path === 'signup');

    // 자식은 모듈이 갈 때마다 늘어난다. 여기서 지키는 것은 개수가 아니라
    // "빈 주소를 맡는 index 는 하나뿐" 이라는 규칙이다.
    expect(indexRoutes).toHaveLength(1);
    expect(signUpRoute).toBeDefined();
  });

  it('자식 주소는 앞에 빗금을 안 붙인다 — 부모에 이어 붙는다', async () => {
    const source = await import('./routes.ts?raw');

    expect(source.default).toMatch(/path: 'signup'/);
    expect(source.default).not.toMatch(/path: '\/signup'/);
  });
});
