// apps/web-spa/src/routes/c2-navigate.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';
import { routesWithFeed } from '../../scratch/c1-router-harness';
import { withApp } from '../../scratch/c3-theme-harness';

const VALID = {
  username: 'jaehoon',
  email: 'jaehoon@spartaclub.kr',
  password: 'sparta1234',
  passwordConfirm: 'sparta1234',
};

function renderAt(entries: string[], index = entries.length - 1) {
  const router = createMemoryRouter(routesWithFeed(), { initialEntries: entries, initialIndex: index });
  render(withApp(<RouterProvider router={router} />));
  return router;
}

async function fillAndSubmit(values: typeof VALID = VALID) {
  await userEvent.type(screen.getByLabelText('사용자 이름'), values.username);
  await userEvent.type(screen.getByLabelText('이메일'), values.email);
  await userEvent.type(screen.getByLabelText('비밀번호'), values.password);
  await userEvent.type(screen.getByLabelText('비밀번호 확인'), values.passwordConfirm);
  await userEvent.click(screen.getByRole('button', { name: '가입하기' }));
}

describe('C-2 Step 2 — 손으로 안 누르고 코드가 보낸다', () => {
  it('그리기만 해서는 아무 데도 안 간다', () => {
    const router = renderAt(['/signup']);

    expect(router.state.location.pathname).toBe('/signup');
  });

  it('가입에 성공하면 아무것도 안 눌러도 홈으로 간다', async () => {
    const router = renderAt(['/signup']);

    await fillAndSubmit();

    expect(router.state.location.pathname).toBe('/');
  });

  it('검사에 걸리면 화면을 안 옮긴다', async () => {
    const router = renderAt(['/signup']);

    await fillAndSubmit({ ...VALID, passwordConfirm: 'sparta9999' });

    expect(await screen.findByText('비밀번호가 일치하지 않아요')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/signup');
  });
});

describe('C-2 Step 2 — 끝난 화면은 기록에 안 남긴다', () => {
  it('가입 후 이동은 밀어넣기가 아니라 갈아끼우기다', async () => {
    const router = renderAt(['/signup']);

    await fillAndSubmit();

    expect(router.state.historyAction).toBe('REPLACE');
  });

  it('그래서 뒤로 가도 방금 채운 폼으로 안 돌아온다', async () => {
    // 홈 → 회원가입 순으로 왔다가 가입을 끝낸 상황
    const router = renderAt(['/', '/signup']);

    await fillAndSubmit();
    expect(router.state.location.pathname).toBe('/');

    await router.navigate(-1);
    expect(router.state.location.pathname).not.toBe('/signup');
  });
});

describe('C-2 Step 2 — 뒤로 가기도 코드가 시킨다', () => {
  it('상세의 뒤로 버튼은 앞 화면으로 돌아간다', async () => {
    const router = renderAt(['/', '/p/1']);

    // Step 5 부터는 loader 가 끝나야 화면이 생긴다
    await screen.findByRole('button', { name: '뒤로' });
    await userEvent.click(screen.getByRole('button', { name: '뒤로' }));

    expect(router.state.location.pathname).toBe('/');
  });
});
