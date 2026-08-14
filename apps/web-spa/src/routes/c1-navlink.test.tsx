// apps/web-spa/src/routes/c1-navlink.test.tsx
import { cleanup, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';
import { routes } from './routes';
import { endProbeRoutes } from '../../scratch/c1-navlink-end-probe';
import { withApp } from '../../scratch/c3-theme-harness';

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(withApp(<RouterProvider router={router} />));
  return router;
}

describe('C-1 Step 7 — 지금 어디 있는지 표시된다', () => {
  it('/ 에서는 홈만 켜진다', () => {
    renderAt('/');

    expect(screen.getByRole('link', { name: '홈' })).toHaveClass('font-semibold');
    expect(screen.getByRole('link', { name: '회원가입' })).toHaveClass('text-faint');
  });

  it('/signup 에서는 회원가입만 켜진다', () => {
    renderAt('/signup');

    expect(screen.getByRole('link', { name: '회원가입' })).toHaveClass('font-semibold');
    expect(screen.getByRole('link', { name: '홈' })).toHaveClass('text-faint');
  });
});

describe('C-1 Step 7 — 낭독기에도 같은 사실이 전해진다', () => {
  it('켜진 링크에만 aria-current="page" 가 붙는다 — 우리가 안 적었는데도', () => {
    renderAt('/signup');

    expect(screen.getByRole('link', { name: '회원가입' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: '홈' })).not.toHaveAttribute('aria-current');
  });

  it('한 화면에 켜진 것은 하나뿐이다', () => {
    renderAt('/');

    const current = screen
      .getAllByRole('link')
      .filter((link) => link.getAttribute('aria-current') === 'page');

    expect(current).toHaveLength(1);
    expect(current[0]).toHaveAccessibleName('홈');
  });
});

// 켜지는 조건은 lib/dom/lib.js 의 한 줄이다 —
//   주소가 완전히 같거나, (end 가 아니고) 링크 주소로 시작하면서 그 바로 뒤가 '/' 일 때.
// to="/" 는 뒤가 '/' 로 이어지는 경우가 루트 자신밖에 없어서 end 가 아무 일도 안 한다.
// 흔히 "루트에는 end 를 붙여라" 라고들 하는데, 이 판에서는 근거가 없다.
function probeAt(path: string) {
  // 한 it 안에서 주소를 바꿔가며 여러 번 재기 때문에, 앞 화면을 먼저 치운다.
  // 안 치우면 같은 이름의 링크가 둘이 되어 읽는 쪽이 터진다.
  cleanup();
  const router = createMemoryRouter(endProbeRoutes, { initialEntries: [path] });
  render(withApp(<RouterProvider router={router} />));
  const read = (name: string) => screen.getByRole('link', { name }).className;

  return {
    rootNoend: read('root-noend'),
    rootEnd: read('root-end'),
    signupNoend: read('signup-noend'),
    signupEnd: read('signup-end'),
  };
}

describe('C-1 Step 7 — end 는 언제 갈리나 (실측)', () => {
  it('루트 링크는 end 를 붙이나 마나 결과가 같다', () => {
    expect(probeAt('/')).toMatchObject({ rootNoend: 'ON', rootEnd: 'ON' });
    expect(probeAt('/signup')).toMatchObject({ rootNoend: 'off', rootEnd: 'off' });
    expect(probeAt('/signup/done')).toMatchObject({ rootNoend: 'off', rootEnd: 'off' });
  });

  it('자식을 거느린 주소에서만 갈린다 — 자식 페이지에서 부모 링크가 켜지느냐', () => {
    // 그 주소 자신에서는 둘 다 켜진다
    expect(probeAt('/signup')).toMatchObject({ signupNoend: 'ON', signupEnd: 'ON' });
    // 자식 페이지에서 갈린다
    expect(probeAt('/signup/done')).toMatchObject({ signupNoend: 'ON', signupEnd: 'off' });
  });

  it('우리 Layout 은 end 를 안 쓴다 — 이 앱에서는 아무 일도 안 하기 때문이다', async () => {
    const layout = await import('./Layout.tsx?raw');

    expect(layout.default).toMatch(/NavLink/);
    expect(layout.default).not.toMatch(/\bend\b/);
  });
});
