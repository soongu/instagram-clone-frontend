// apps/web-spa/src/routes/c7-lazy-signup.test.tsx
// C-7 Step 7 — 나중에 내려받는 화면 (내부 검증용)
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, it, expect } from 'vitest';
import { routes } from './routes';
import { routesWithFeed } from '../../scratch/c1-router-harness';
import { withApp } from '../../scratch/c3-theme-harness';

function renderAt(path: string) {
  const router = createMemoryRouter(routesWithFeed(), { initialEntries: [path] });
  render(withApp(<RouterProvider router={router} />));
  return router;
}

describe('C-7 — 회원가입은 따로 내려받는다', () => {
  it('★ 라우트 표에 적힌 것은 화면이 아니라 "가져오는 방법" 이다', () => {
    const [root] = routes;
    const signUp = root.children?.find((child) => 'path' in child && child.path === 'signup');
    const component = (signUp as { Component?: unknown }).Component;

    // 곧바로 그릴 수 있는 함수가 아니라, React 가 나중에 열어 볼 봉투다
    expect(typeof component).toBe('object');
    expect((component as { $$typeof?: symbol }).$$typeof).toBe(Symbol.for('react.lazy'));
  });

  it('홈은 회원가입 코드를 기다리지 않는다', async () => {
    renderAt('/');

    expect(await screen.findByRole('list', { name: '피드 목록' })).toBeInTheDocument();
    expect(screen.queryByText('화면을 불러오는 중이에요…')).not.toBeInTheDocument();
  });

  // ⚠️ lazy 는 한 번 받아온 모듈을 기억한다. 그래서 기다리는 화면은 이 파일에서
  //    "처음으로 /signup 을 그리는" 이 판에서만 관측된다. 아래 판이 그 뒷면이다.
  it('★ 회원가입에 들어가면 도착할 때까지 기다리는 화면이 먼저 뜨고, 머리말은 그대로다', async () => {
    renderAt('/signup');
    const headerBefore = screen.getByRole('heading', { name: '인스타그램', level: 1 });

    // 그린 직후의 한 컷 — 이 자리가 Suspense 가 맡은 곳이다
    expect(screen.getByText('화면을 불러오는 중이에요…')).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: '회원가입' })).not.toBeInTheDocument();

    // 그리고 도착하면 갈린다
    expect(await screen.findByRole('region', { name: '회원가입' })).toBeInTheDocument();
    expect(screen.queryByText('화면을 불러오는 중이에요…')).not.toBeInTheDocument();

    // 기다리는 동안에도 바깥은 살아 있었다 — 갈린 것은 Outlet 안쪽뿐이다 (C-1 회수)
    expect(screen.getByRole('heading', { name: '인스타그램', level: 1 })).toBe(headerBefore);
  });

  it('한 번 내려받은 뒤에 오가면 기다리는 화면이 안 뜬다', async () => {
    const user = userEvent.setup();
    renderAt('/');

    await user.click(screen.getByRole('link', { name: '회원가입' }));

    // 위 판에서 이미 받아뒀다. 두 번째부터는 기다림이 없다.
    expect(screen.queryByText('화면을 불러오는 중이에요…')).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: '회원가입' })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: '홈' }));

    expect(await screen.findByRole('list', { name: '피드 목록' })).toBeInTheDocument();
  });
});
