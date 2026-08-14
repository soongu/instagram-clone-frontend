// apps/web-spa/src/routes/c6-loader-query.test.tsx
// C-6 Step 6 — loader 와 useQuery 의 화해 (내부 검증용)
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import { routes } from './routes';
import { withApp } from '../../scratch/c3-theme-harness';
import { server, requestLog, resetRequestLog, fakeAuth } from '../../scratch/c5-server-harness';
import { c6Handlers, fakeDb, postFromDb } from '../../scratch/c6-server-harness';
import { queryClient } from '../queries/queryClient';
import { postQuery } from '../queries/posts';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

beforeEach(() => {
  server.use(...c6Handlers());
  resetRequestLog();
  fakeAuth.reset();
  fakeDb.reset();
  // 앱이 함께 쓰는 창고라 판마다 비운다 — 안 비우면 앞 판이 받아둔 것이 샌다
  queryClient.clear();
});

afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(withApp(<RouterProvider router={router} />));
  return router;
}

function postRequests(id: number) {
  return requestLog.filter((entry) => entry === `GET /api/posts/${id}`);
}

describe('화면이 뜨기 전에 창고를 채워둔다', () => {
  it('★ 상세 화면에 "불러오는 중" 이 안 뜬다', async () => {
    renderAt('/p/1');

    // 첫 화면부터 게시물이 들어 있다 — loader 가 먼저 채웠기 때문이다
    expect(await screen.findByText('오늘 한강 노을이 미쳤다')).toBeInTheDocument();
    expect(screen.queryByText('게시물을 불러오는 중이에요…')).not.toBeInTheDocument();
  });

  it('★ loader 가 채운 것을 화면이 그대로 읽는다 — 요청은 한 번뿐', async () => {
    renderAt('/p/1');
    await screen.findByText('오늘 한강 노을이 미쳤다');

    expect(postRequests(1)).toHaveLength(1);
  });

  it('창고에 그 이름으로 들어 있다', async () => {
    renderAt('/p/1');
    await screen.findByText('오늘 한강 노을이 미쳤다');

    expect(queryClient.getQueryData(postQuery(1).queryKey)).toMatchObject({
      id: 1,
      content: '오늘 한강 노을이 미쳤다',
    });
  });

  it('★ 이미 받아둔 게시물이면 요청이 아예 안 나간다', async () => {
    // 다른 화면에서 이미 받아둔 상황을 만든다
    await queryClient.ensureQueryData(postQuery(1));
    resetRequestLog();

    renderAt('/p/1');

    expect(await screen.findByText('오늘 한강 노을이 미쳤다')).toBeInTheDocument();
    expect(postRequests(1)).toHaveLength(0);
  });
});

describe('없는 게시물과 번호가 아닌 주소', () => {
  it('없는 번호면 서버가 준 사유가 404 화면에 뜬다', async () => {
    renderAt('/p/999');

    expect(await screen.findByText('없는 페이지예요')).toBeInTheDocument();
    expect(screen.getByText('404 게시물을 찾을 수 없습니다')).toBeInTheDocument();
  });

  it('번호가 아니면 loader 가 먼저 막는다 — 요청도 안 나간다', async () => {
    renderAt('/p/abc');

    expect(await screen.findByText('문제가 생겼어요')).toBeInTheDocument();
    expect(requestLog.filter((entry) => entry.startsWith('GET /api/posts/'))).toHaveLength(0);
  });

  it('서버가 느려도 화면은 옛 화면에 머문다 — 뜬 뒤에 갈린다', async () => {
    server.use(postFromDb(300));

    const router = renderAt('/');
    await screen.findAllByRole('article');

    void router.navigate('/p/1');

    // 아직 안 갈렸다 — loader 가 끝나야 갈린다
    expect(screen.getAllByRole('article').length).toBeGreaterThan(1);
    expect(await screen.findByText('오늘 한강 노을이 미쳤다')).toBeInTheDocument();
  });
});
