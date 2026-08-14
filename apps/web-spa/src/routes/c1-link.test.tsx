// apps/web-spa/src/routes/c1-link.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';
import { routes } from './routes';
import { HomePage } from './HomePage';
import { SignUpPage } from './SignUpPage';
import { AnchorLayout } from '../../scratch/c1-anchor-nav';
import { withTheme } from '../../scratch/c3-theme-harness';

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}

// 같은 라우트 표에 껍데기만 <a> 판으로 갈아끼운다 — 갈리는 것이 그것 하나뿐이게
//
// AnchorLayout 은 C-1 Step 6 교안 코드의 스냅샷이라 손대지 않는다.
// 그때는 ThemeToggle 이 자기 상태를 들고 있어서 Provider 가 필요 없었는데,
// C-3 Step 3 이후로는 밖에서 넣어줘야 한다 — 여기서 문맥만 씌운다.
function renderAnchorAt(path: string) {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        Component: AnchorLayout,
        children: [
          { index: true, Component: HomePage },
          { path: 'signup', Component: SignUpPage },
        ],
      },
    ],
    { initialEntries: [path] },
  );
  render(withTheme(<RouterProvider router={router} />));
  return router;
}

describe('C-1 Step 6 — Link 도 결국 앵커다', () => {
  it('화면에는 그냥 링크로 그려진다 — href 가 그대로 있다', () => {
    renderAt('/');

    const toSignUp = screen.getByRole('link', { name: '회원가입' });

    expect(toSignUp.tagName).toBe('A');
    expect(toSignUp).toHaveAttribute('href', '/signup');
  });

  it('누르면 주소가 바뀌고 Outlet 안쪽만 갈린다', async () => {
    const user = userEvent.setup();
    const router = renderAt('/');

    expect(router.state.location.pathname).toBe('/');

    await user.click(screen.getByRole('link', { name: '회원가입' }));

    expect(router.state.location.pathname).toBe('/signup');
    expect(screen.getByRole('region', { name: '회원가입' })).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: '피드 목록' })).not.toBeInTheDocument();
  });

  it('되돌아올 수도 있다', async () => {
    const user = userEvent.setup();
    const router = renderAt('/signup');

    await user.click(screen.getByRole('link', { name: '홈' }));

    expect(router.state.location.pathname).toBe('/');
    expect(screen.getByRole('list', { name: '피드 목록' })).toBeInTheDocument();
  });
});

describe('C-1 Step 6 — 반례: 그냥 <a> 로 이으면', () => {
  // 여기서 증명하는 것은 "라우터가 그 이동을 모른다" 까지다.
  // 진짜 브라우저라면 문서를 통째로 다시 받지만 jsdom 은 그 이동을 실행하지 않는다.
  it('겉모습은 Link 와 구별이 안 된다', () => {
    renderAnchorAt('/');

    const toSignUp = screen.getByRole('link', { name: '회원가입' });

    expect(toSignUp.tagName).toBe('A');
    expect(toSignUp).toHaveAttribute('href', '/signup');
  });

  it('그런데 눌러도 라우터는 주소가 바뀐 것을 모른다', async () => {
    const user = userEvent.setup();
    const router = renderAnchorAt('/');

    await user.click(screen.getByRole('link', { name: '회원가입' }));

    // Link 였다면 '/signup' 이 됐을 자리인데 그대로다
    expect(router.state.location.pathname).toBe('/');
    expect(screen.getByRole('list', { name: '피드 목록' })).toBeInTheDocument();
  });
});

describe('C-1 Step 6 — 메뉴는 Layout 이 한 번만 그린다', () => {
  it('/ 에서 메뉴가 하나다', () => {
    renderAt('/');

    expect(screen.getAllByRole('navigation', { name: '주요 메뉴' })).toHaveLength(1);
  });

  it('/signup 에서도 같은 메뉴 하나다', () => {
    renderAt('/signup');

    expect(screen.getAllByRole('navigation', { name: '주요 메뉴' })).toHaveLength(1);
  });

  it('두 페이지 파일에는 Link 가 없다 — 메뉴는 Layout 소관이다', async () => {
    const layout = await import('./Layout.tsx?raw');
    const home = await import('./HomePage.tsx?raw');
    const signUp = await import('./SignUpPage.tsx?raw');

    expect(layout.default).toMatch(/from 'react-router'/);

    // 여기서 지키는 것은 "페이지가 메뉴를 안 그린다" 이지
    // "페이지가 라우터를 안 쓴다" 가 아니다 — 페이지도 주소를 다룰 일이 생긴다.
    expect(home.default).not.toMatch(/<(Nav)?Link\b/);
    expect(signUp.default).not.toMatch(/<(Nav)?Link\b/);
  });
});
