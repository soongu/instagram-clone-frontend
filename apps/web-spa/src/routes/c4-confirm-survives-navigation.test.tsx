import { routesWithFeed } from '../../scratch/c1-router-harness';
import { describe, expect, it, beforeEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { withApp } from '../../scratch/c3-theme-harness';
import { useConfirmStore } from '../stores/useConfirmStore';
import { closeConfirmOnNavigate } from '../lib/closeConfirmOnNavigate';

beforeEach(() => {
  useConfirmStore.setState({ request: null });
  window.localStorage.clear();
});

async function openConfirmOnHome() {
  const user = userEvent.setup();
  const router = createMemoryRouter(routesWithFeed(), { initialEntries: ['/'] });

  render(withApp(<RouterProvider router={router} />));

  // 댓글을 하나 달아야 지울 것이 생긴다
  await user.type(screen.getAllByRole('textbox', { name: '댓글 입력' })[0], '노을');
  await user.click(screen.getAllByRole('button', { name: '게시' })[0]);
  await user.click(screen.getAllByRole('button', { name: '댓글 삭제' })[0]);

  return router;
}

describe('물어보는 중에 화면을 옮기면', () => {
  it('상자가 라우터 바깥에 있어서 다음 화면까지 따라온다', async () => {
    const router = await openConfirmOnHome();

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // 뒤로 가기·주소 직접 입력처럼 손으로 안 누르는 이동
    await act(async () => {
      await router.navigate('/explore');
    });

    expect(router.state.location.pathname).toBe('/explore');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(useConfirmStore.getState().request).not.toBeNull();
  });

  it('라우터에 귀를 달아두면 화면이 바뀔 때 상자가 닫힌다', async () => {
    const router = await openConfirmOnHome();
    const stop = closeConfirmOnNavigate(router);

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await act(async () => {
      await router.navigate('/explore');
    });

    expect(useConfirmStore.getState().request).toBeNull();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    stop();
  });

  it('같은 화면에서 일어나는 다른 변화에는 안 닫힌다', async () => {
    const router = await openConfirmOnHome();
    const stop = closeConfirmOnNavigate(router);

    // 주소는 그대로 두고 검색 조건만 바꾼다 — 화면을 옮긴 것이 아니다
    await act(async () => {
      await router.revalidate();
    });

    expect(useConfirmStore.getState().request).not.toBeNull();

    stop();
  });
});
