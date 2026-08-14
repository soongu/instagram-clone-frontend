import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, createMemoryRouter, RouterProvider } from 'react-router';
import { withApp } from '../../scratch/c3-theme-harness';
import { routes } from './routes';
import { Feed } from '../components/Feed';
import { PostCard } from '../components/PostCard';
import { feedPosts } from '../data/feed';

const [first, second] = feedPosts;

describe('배달을 걷어낸 뒤', () => {
  it('카드 하나만 홀로 그려도 주소를 읽어 열려 있다', async () => {
    render(
      <MemoryRouter initialEntries={[`/?post=${first.id}`]}>
        <PostCard {...first} onToggleLike={() => {}} />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('주소에 다른 번호가 적혀 있으면 이 카드는 안 열린다', () => {
    render(
      <MemoryRouter initialEntries={[`/?post=${second.id}`]}>
        <PostCard {...first} onToggleLike={() => {}} />
      </MemoryRouter>,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('Feed 에 모달 이야기를 하나도 안 넘겨도 주소로 열린다', async () => {
    render(
      <MemoryRouter initialEntries={[`/?post=${second.id}`]}>
        <Feed posts={feedPosts} onToggleLike={() => {}} />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('열고 닫는 것도 그대로다 — 주소가 따라 움직인다', async () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/'] });
    render(withApp(<RouterProvider router={router} />));

    const [trigger] = screen.getAllByRole('button', { name: /모두 보기/ });
    await userEvent.click(trigger);

    await screen.findByRole('dialog');
    expect(router.state.location.search).toBe('?post=1');

    await userEvent.click(screen.getByRole('button', { name: '닫기' }));
    expect(router.state.location.search).toBe('');
  });
});
