// apps/web-spa/src/routes/c2-search-params.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { routes } from './routes';
import { allPosts } from '../data/feed';
import { withApp } from '../../scratch/c3-theme-harness';
import { queryClient } from '../queries/queryClient';
import { server } from '../../scratch/c5-server-harness';

// C-5 Step 7 이후 탐색 화면은 게시물을 서버에서 받는다.
// 그래서 이 판들도 서버가 있어야 돌고, 화면이 채워지기를 기다려야 한다.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  // 앱이 쓰는 캐시를 그대로 쓰므로, 앞 판이 받아둔 것을 지운다
  queryClient.clear();
});
afterAll(() => server.close());

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(withApp(<RouterProvider router={router} />));
  return router;
}

function shownPosts() {
  return screen.findAllByRole('link', { name: /의 게시물$/ });
}

const CAFE_COUNT = allPosts.filter((post) => post.hashtagNames.includes('카페')).length;

describe('C-2 Step 3 — 주소가 무엇을 보여줄지도 정한다', () => {
  it('탐색은 게시물을 전부 펼친다', async () => {
    renderAt('/explore');

    expect(await shownPosts()).toHaveLength(allPosts.length);
  });

  it('주소에 태그가 붙어 있으면 그것만 남는다', async () => {
    renderAt('/explore?tag=카페');

    expect(await shownPosts()).toHaveLength(CAFE_COUNT);
    expect(CAFE_COUNT).toBeLessThan(allPosts.length);
  });

  it('없는 태그면 아무것도 안 남는다', async () => {
    renderAt('/explore?tag=없는태그');

    await screen.findByText(/게시물이 없/);
    expect(screen.queryAllByRole('link', { name: /의 게시물$/ })).toHaveLength(0);
    expect(await screen.findByText(/게시물이 없/)).toBeInTheDocument();
  });

  it('게시물마다 상세로 가는 링크가 달려 있다', async () => {
    renderAt('/explore?tag=카페');

    const [first] = await shownPosts();
    expect(first).toHaveAttribute('href', expect.stringMatching(/^\/p\/\d+$/));
  });
});

describe('C-2 Step 3 — 고르면 주소가 바뀐다', () => {
  it('태그를 누르면 화면만 바뀌는 게 아니라 주소가 바뀐다', async () => {
    const router = renderAt('/explore');

    await userEvent.click(await screen.findByRole('button', { name: '카페' }));

    expect(router.state.location.search).toBe('?tag=%EC%B9%B4%ED%8E%98');
    expect(await shownPosts()).toHaveLength(CAFE_COUNT);
  });

  it('전체를 누르면 태그가 주소에서 빠진다', async () => {
    const router = renderAt('/explore?tag=카페');

    await userEvent.click(await screen.findByRole('button', { name: '전체' }));

    expect(router.state.location.search).toBe('');
    expect(await shownPosts()).toHaveLength(allPosts.length);
  });

  it('고른 태그가 눌린 상태로 보인다', async () => {
    renderAt('/explore?tag=카페');

    expect(await screen.findByRole('button', { name: '카페' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: '러닝' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });
});

describe('C-2 Step 3 — 주소에 담았기 때문에 되는 것들', () => {
  it('주소를 직접 치고 들어와도 고른 상태 그대로 뜬다', async () => {
    // 화면 안 상태였다면 여기서 전부 초기화됐을 것이다
    renderAt('/explore?tag=제주도');

    expect(await screen.findByRole('button', { name: '제주도' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('뒤로 가면 직전에 고른 것으로 돌아온다', async () => {
    const router = renderAt('/explore');

    await userEvent.click(await screen.findByRole('button', { name: '카페' }));
    await userEvent.click(screen.getByRole('button', { name: '러닝' }));
    await router.navigate(-1);

    expect(router.state.location.search).toBe('?tag=%EC%B9%B4%ED%8E%98');
  });
});
