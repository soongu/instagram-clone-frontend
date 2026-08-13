// apps/web-spa/src/routes/c2-post-detail.test.tsx
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';
import { routes } from './routes';
import { feedPosts } from '../data/feed';

// 한 it 안에서 두 번 render 하면 앞의 화면이 DOM 에 남는다. 주소마다 it 을 따로 둔다.
function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return render(<RouterProvider router={router} />);
}

describe('C-2 Step 1 — 주소의 일부를 값으로 받는다', () => {
  it('/p/1 은 1번 게시물을 그린다', () => {
    renderAt('/p/1');

    expect(screen.getByText('오늘 한강 노을이 미쳤다')).toBeInTheDocument();
    expect(screen.getByText('jaehoon')).toBeInTheDocument();
  });

  it('/p/2 는 2번 게시물을 그린다 — 표는 한 줄인데 화면이 갈린다', () => {
    renderAt('/p/2');

    expect(screen.getByText('제주도 3박 4일 기록')).toBeInTheDocument();
    expect(screen.queryByText('오늘 한강 노을이 미쳤다')).not.toBeInTheDocument();
  });

  it('/p/999 처럼 없는 번호면 못 찾았다고 알린다', () => {
    renderAt('/p/999');

    expect(screen.getByText(/찾을 수 없/)).toBeInTheDocument();
  });

  it('상세는 피드가 아니다 — 목록은 안 그린다', () => {
    renderAt('/p/1');

    expect(screen.queryByRole('list', { name: '피드 목록' })).not.toBeInTheDocument();
  });
});

describe('C-2 Step 1 — 주소 표의 :postId', () => {
  it('p/:postId 는 Layout 의 자식이라 매치가 2단이다', () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/p/1'] });

    expect(router.state.location.pathname).toBe('/p/1');
    expect(router.state.matches).toHaveLength(2);
  });

  it('주소에서 뽑은 값은 숫자가 아니라 문자열이다', () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/p/1'] });
    const params = router.state.matches.at(-1)?.params;

    expect(params?.postId).toBe('1');
    expect(typeof params?.postId).toBe('string');
  });

  it('그래서 그냥 찾으면 못 찾고, 숫자로 바꿔야 찾는다', () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/p/1'] });
    const postId = router.state.matches.at(-1)?.params.postId;

    // id 는 number, postId 는 string — 둘은 영원히 안 맞는다
    expect(feedPosts.some((post) => String(post.id) === postId)).toBe(true);
    expect(feedPosts.find((post) => post.id === Number(postId))).toBeDefined();
  });

  it('고정 주소는 그대로 산다 — /signup 이 :postId 에 먹히지 않는다', () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/signup'] });

    expect(router.state.location.pathname).toBe('/signup');
    expect(router.state.matches.at(-1)?.params.postId).toBeUndefined();
  });
});
