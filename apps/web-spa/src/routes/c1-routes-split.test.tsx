// apps/web-spa/src/routes/c1-routes-split.test.tsx
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';
import { routes } from './routes';
import mainSource from '../main.tsx?raw';
import { withApp } from '../../scratch/c3-theme-harness';

// 한 it 안에서 두 번 render 하면 앞의 화면이 DOM 에 남아 개수 단언이 엉뚱하게 통과한다.
// 주소마다 it 을 따로 두고 한 번만 그린다.
function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return render(withApp(<RouterProvider router={router} />));
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

// Step 4 는 두 페이지가 머리를 각자 들고 있었다. 그 중복은 Step 5 가 Layout 으로 걷어냈고,
// 머리가 한 번만 그려지는지는 c1-layout 이 본다. 여기서는 주소가 갈리는 것만 지킨다.

describe('C-1 Step 4 — 라우트 표를 따로 뺐다', () => {
  it('main.tsx 는 라우트 배열을 직접 들고 있지 않다', () => {
    expect(mainSource).toMatch(/import \{ routes \} from '\.\/routes\/routes';/);
    expect(mainSource).toMatch(/createBrowserRouter\(routes\)/);
  });

  it('두 주소로 갈 수 있다', () => {
    const home = createMemoryRouter(routes, { initialEntries: ['/'] });
    const signUp = createMemoryRouter(routes, { initialEntries: ['/signup'] });

    expect(home.state.location.pathname).toBe('/');
    expect(signUp.state.location.pathname).toBe('/signup');
    // 중첩이라 /signup 은 Layout 과 SignUpPage 둘에 걸린다
    expect(signUp.state.matches).toHaveLength(2);
  });
});
