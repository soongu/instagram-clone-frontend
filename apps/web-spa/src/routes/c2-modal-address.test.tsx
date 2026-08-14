// apps/web-spa/src/routes/c2-modal-address.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';
import { routes } from './routes';
import { PostModal } from '../components/PostModal';
import { withApp } from '../../scratch/c3-theme-harness';

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(withApp(<RouterProvider router={router} />));
  return router;
}

describe('C-2 Step 8 — 모달이 주소를 갖는다', () => {
  it('주소에 post 가 붙어 있으면 열린 채로 뜬다', async () => {
    renderAt('/?post=1');

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('주소에 없으면 닫힌 채로 뜬다', () => {
    renderAt('/');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('열면 주소가 바뀐다', async () => {
    const router = renderAt('/');

    const [trigger] = screen.getAllByRole('button', { name: /모두 보기/ });
    await userEvent.click(trigger);

    await screen.findByRole('dialog');
    expect(router.state.location.search).toBe('?post=1');
  });

  it('닫으면 주소에서 빠진다', async () => {
    const router = renderAt('/?post=1');
    await screen.findByRole('dialog');

    await userEvent.click(screen.getByRole('button', { name: '닫기' }));

    expect(router.state.location.search).toBe('');
  });

  it('열어둔 채로 주소를 다시 열면 그대로 열려 있다', async () => {
    // 새로고침이 이것과 같다 — 주소만 들고 처음부터 다시 그린다
    const router = renderAt('/');
    const [trigger] = screen.getAllByRole('button', { name: /모두 보기/ });
    await userEvent.click(trigger);
    await screen.findByRole('dialog');

    const reopened = renderAt(router.state.location.pathname + router.state.location.search);

    expect(await screen.findAllByRole('dialog')).not.toHaveLength(0);
    expect(reopened.state.location.search).toBe('?post=1');
  });

  it('뒤로 가면 닫힌다', async () => {
    const router = renderAt('/');
    const [trigger] = screen.getAllByRole('button', { name: /모두 보기/ });
    await userEvent.click(trigger);
    await screen.findByRole('dialog');

    await router.navigate(-1);

    expect(router.state.location.search).toBe('');
  });

  it('두 번째 게시물을 열면 그 번호가 주소에 붙는다', async () => {
    const router = renderAt('/');

    const triggers = screen.getAllByRole('button', { name: /모두 보기/ });
    await userEvent.click(triggers[1]);

    await screen.findByRole('dialog');
    expect(router.state.location.search).toBe('?post=2');
  });
});

describe('C-2 Step 8 — 모달 자체는 여전히 주소를 모른다', () => {
  it('라우터 없이 혼자 그려도 열린다', async () => {
    render(
      <PostModal
        username="jaehoon"
        profileImageUrl="/jaehoon.jpg"
        imageUrl="/post1.jpg"
        content="오늘 한강 노을이 미쳤다"
        likeCount={1240}
        commentCount={32}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: /모두 보기/ }));

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });
});
