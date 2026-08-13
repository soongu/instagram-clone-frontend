// apps/web-spa/src/routes/c1-routes-split.test.tsx
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';
import { routes } from './routes';
import mainSource from '../main.tsx?raw';

// 한 it 안에서 두 번 render 하면 앞의 화면이 DOM 에 남아 개수 단언이 엉뚱하게 통과한다.
// 주소마다 it 을 따로 두고 한 번만 그린다.
function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return render(<RouterProvider router={router} />);
}

describe('C-1 Step 4 — 주소로 화면을 가른다', () => {
  it('/ 는 피드를 그리고 회원가입은 안 그린다', () => {
    renderAt('/');

    expect(screen.getByRole('list', { name: '피드 목록' })).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: '회원가입' })).not.toBeInTheDocument();
  });

  it('/signup 은 회원가입을 그리고 피드는 안 그린다', () => {
    renderAt('/signup');

    expect(screen.getByRole('region', { name: '회원가입' })).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: '피드 목록' })).not.toBeInTheDocument();
  });

  it('좋아요 개수는 피드가 있는 / 에만 있다', () => {
    renderAt('/');

    expect(screen.getByText(/좋아요 누른 게시물/)).toBeInTheDocument();
  });

  it('/signup 에는 좋아요 개수가 없다', () => {
    renderAt('/signup');

    expect(screen.queryByText(/좋아요 누른 게시물/)).not.toBeInTheDocument();
  });
});

describe('C-1 Step 4 — 아직 머리가 두 번 적혀 있다', () => {
  // Step 6 에서 Layout 으로 뽑아낼 중복. 지금은 두 페이지가 각자 들고 있다.
  it('/ 가 제목과 밝기 버튼을 직접 그린다', () => {
    renderAt('/');

    expect(screen.getByRole('heading', { name: '인스타그램', level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: '화면 밝기' })).toBeInTheDocument();
  });

  it('/signup 도 같은 제목과 밝기 버튼을 자기가 또 그린다', () => {
    renderAt('/signup');

    expect(screen.getByRole('heading', { name: '인스타그램', level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: '화면 밝기' })).toBeInTheDocument();
  });

  it('두 페이지 파일이 각자 ThemeToggle 을 가져온다 — 중복의 실물', async () => {
    const home = await import('./HomePage.tsx?raw');
    const signUp = await import('./SignUpPage.tsx?raw');

    expect(home.default).toMatch(/import \{ ThemeToggle \}/);
    expect(signUp.default).toMatch(/import \{ ThemeToggle \}/);
  });
});

describe('C-1 Step 4 — 라우트 표를 따로 뺐다', () => {
  it('main.tsx 는 라우트 배열을 직접 들고 있지 않다', () => {
    expect(mainSource).toMatch(/import \{ routes \} from '\.\/routes\/routes';/);
    expect(mainSource).toMatch(/createBrowserRouter\(routes\)/);
  });

  it('두 주소가 표에 있다', () => {
    const paths = routes.map((route) => route.path);

    expect(paths).toContain('/');
    expect(paths).toContain('/signup');
  });
});
