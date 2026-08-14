import { routesWithFeed } from '../../scratch/c1-router-harness';
import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { withApp } from '../../scratch/c3-theme-harness';
import { useConfirmStore } from '../stores/useConfirmStore';

function renderAt(path: string) {
  const router = createMemoryRouter(routesWithFeed(), { initialEntries: [path] });
  render(withApp(<RouterProvider router={router} />));
  return router;
}

beforeEach(() => {
  useConfirmStore.setState({ request: null });
  window.localStorage.clear();
});

describe('세 갈래 — 값마다 사는 곳이 다르다', () => {
  it('화면 안 값: 캡션을 펼쳐도 주소는 그대로다', async () => {
    const user = userEvent.setup();
    const router = renderAt('/');

    const [more] = screen.getAllByRole('button', { name: '더 보기' });
    await user.click(more);

    expect(screen.getAllByRole('button', { name: '접기' }).length).toBeGreaterThan(0);
    expect(router.state.location.search).toBe('');
  });

  it('주소 값: 태그를 고르면 주소에 적힌다', async () => {
    const user = userEvent.setup();
    const router = renderAt('/explore');

    await user.click(screen.getByRole('button', { name: '한강' }));

    expect(router.state.location.search).toBe('?tag=%ED%95%9C%EA%B0%95');
  });

  it('주소 값: 게시물 모달도 주소에 적힌다', async () => {
    const user = userEvent.setup();
    const router = renderAt('/');

    await user.click(screen.getAllByRole('button', { name: /모두 보기/ })[0]);
    await screen.findByRole('dialog');

    expect(router.state.location.search).toBe('?post=1');
  });

  it('store 값: 삭제 확인은 주소에 안 적힌다', async () => {
    const user = userEvent.setup();
    const router = renderAt('/');

    await user.type(screen.getAllByRole('textbox', { name: '댓글 입력' })[0], '노을');
    await user.click(screen.getAllByRole('button', { name: '게시' })[0]);
    await user.click(screen.getAllByRole('button', { name: '댓글 삭제' })[0]);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(useConfirmStore.getState().request).not.toBeNull();
    expect(router.state.location.search).toBe('');
  });

  it('주소에 적힌 것만 새 화면에서 되살아난다', async () => {
    const user = userEvent.setup();
    const router = renderAt('/');

    await user.click(screen.getAllByRole('button', { name: /모두 보기/ })[0]);
    await screen.findByRole('dialog');
    const saved = router.state.location.search;

    // 주소만 들고 처음부터 다시 그린다 = 새로고침
    useConfirmStore.setState({ request: null });
    const reopened = renderAt(`/${saved}`);

    expect(reopened.state.location.search).toBe('?post=1');
    expect(await screen.findAllByRole('dialog')).not.toHaveLength(0);
  });

  it('서버 칸은 아직 비어 있다 — 게시물이 코드 안에 있다', async () => {
    const { feedPosts } = await import('../data/feed');

    expect(feedPosts.length).toBeGreaterThan(0);
    expect(feedPosts[0]).toHaveProperty('username');
  });
});

describe('결정 규칙대로 놓였는지', () => {
  it('확인 상자에 담긴 할 일은 함수라 주소에 못 간다', () => {
    useConfirmStore.getState().ask('댓글을 지울까요?', () => {});

    expect(typeof useConfirmStore.getState().request?.onConfirm).toBe('function');
    expect(Object.keys(JSON.parse(JSON.stringify(useConfirmStore.getState().request)))).toEqual([
      'message',
    ]);
  });

  it('열려 있는 게시물 번호는 글자 하나라 주소로 충분하다', () => {
    const params = new URLSearchParams('?post=2');

    expect(params.get('post')).toBe('2');
    expect(within(document.body).queryAllByRole('dialog')).toHaveLength(0);
  });
});
