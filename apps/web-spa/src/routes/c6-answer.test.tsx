// apps/web-spa/src/routes/c6-answer.test.tsx
// C-6 과제 예시답안 검증 (내부 검증용)
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import type { Post } from '../types/instagram';
import { AnswerPostDetail, likeErrorMessage, LikeFailureToast } from '../../scratch/c6-story-answer';
import { postLoader } from './postLoader';
import { withApp } from '../../scratch/c3-theme-harness';
import { server, requestLog, resetRequestLog, fakeAuth } from '../../scratch/c5-server-harness';
import { c6Handlers, fakeDb, feedFromDb, likeToggleHandler } from '../../scratch/c6-server-harness';
import { queryClient } from '../queries/queryClient';
import { feedKey, postQuery } from '../queries/posts';
import { ApiError } from '../api/client';
import { login } from '../api/auth';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

beforeEach(() => {
  server.use(...c6Handlers());
  resetRequestLog();
  fakeAuth.reset();
  fakeDb.reset();
  queryClient.clear();
});

afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderDetail(path = '/p/1') {
  const router = createMemoryRouter(
    [{ path: '/p/:postId', loader: postLoader, Component: AnswerPostDetail }],
    { initialEntries: [path] },
  );
  render(withApp(<RouterProvider router={router} />));
  return router;
}

describe('과제 1 — 상세에서도 좋아요를 누른다', () => {
  it('누르면 서버로 간다', async () => {
    const user = userEvent.setup();
    await login('jaehoon');

    renderDetail();
    const heart = await screen.findByRole('button', { name: '좋아요' });

    await user.click(heart);

    await expect.poll(() => requestLog.filter((e) => e.endsWith('/like')).length).toBe(1);
    await expect.poll(() => fakeDb.find(1)?.liked).toBe(true);
  });

  it('★ 답: 상세에서 누르면 즉시 안 바뀐다 — 낙관적 갱신이 피드 이름표에만 걸린다', async () => {
    const user = userEvent.setup();
    await login('jaehoon');
    server.use(feedFromDb(), likeToggleHandler(400));

    renderDetail();
    const heart = await screen.findByRole('button', { name: '좋아요' });
    expect(screen.getByText('좋아요 1240개')).toBeInTheDocument();

    await user.click(heart);

    // 누른 직후 — 홈에서였다면 여기서 이미 1241 이다
    expect(screen.getByText('좋아요 1240개')).toBeInTheDocument();

    // 무효화가 돌고 나서야 바뀐다
    expect(await screen.findByText('좋아요 1241개')).toBeInTheDocument();
  });

  it('★ 그 이유 — 낙관적 갱신은 이름표 ["posts"] 만 고친다', async () => {
    const user = userEvent.setup();
    await login('jaehoon');
    server.use(feedFromDb(), likeToggleHandler(400));

    // 피드도 미리 받아둔다
    await queryClient.ensureQueryData({ queryKey: feedKey(), queryFn: () => import('../api/posts').then((m) => m.fetchFeed()) });

    renderDetail();
    const heart = await screen.findByRole('button', { name: '좋아요' });
    await user.click(heart);

    // 피드 쪽은 즉시 바뀌었는데
    expect(queryClient.getQueryData<Post[]>(feedKey())?.[0].likeCount).toBe(1241);
    // 상세 쪽은 아직이다
    expect(queryClient.getQueryData<Post>(postQuery(1).queryKey)?.likeCount).toBe(1240);
  });

  it('★ 무효화는 아무도 안 보는 것을 다시 안 물어본다 — 표시만 해둔다', async () => {
    await login('jaehoon');

    await queryClient.ensureQueryData(postQuery(1));
    expect(queryClient.getQueryData<Post>(postQuery(1).queryKey)?.likeCount).toBe(1240);

    // 홈에서 누른 것과 같은 무효화. 상세 화면은 지금 안 떠 있다.
    const target = fakeDb.find(1);
    if (target === undefined) throw new Error('1번 게시물이 없다');
    target.likeCount = 1241;
    await queryClient.invalidateQueries({ queryKey: ['posts'] });

    // 값은 옛것 그대로다 — 요청이 안 나갔다
    expect(queryClient.getQueryData<Post>(postQuery(1).queryKey)?.likeCount).toBe(1240);
    // 대신 낡았다는 표시가 붙었다
    expect(queryClient.getQueryState(postQuery(1).queryKey)?.isInvalidated).toBe(true);
  });

  it('★ 그래서 상세로 들어가는 순간 다시 물어보고 맞춰진다', async () => {
    await login('jaehoon');

    await queryClient.ensureQueryData(postQuery(1));
    const target = fakeDb.find(1);
    if (target === undefined) throw new Error('1번 게시물이 없다');
    target.likeCount = 1241;
    await queryClient.invalidateQueries({ queryKey: ['posts'] });

    renderDetail();

    // 표시가 붙어 있었으니 뜨면서 바로 다시 물어본다
    expect(await screen.findByText('좋아요 1241개')).toBeInTheDocument();
  });
});

describe('과제 2 — 실패를 눈에 보이게', () => {
  it('서버가 보낸 사유를 그대로 쓴다', () => {
    expect(likeErrorMessage(new ApiError('좋아요를 저장하지 못했습니다', 500))).toBe(
      '좋아요를 저장하지 못했습니다',
    );
  });

  it('우리가 모르는 오류면 우리 말로 대신한다', () => {
    expect(likeErrorMessage(new Error('boom'))).toBe('좋아요를 저장하지 못했어요');
  });

  it('실패했을 때만 뜬다', () => {
    const { container } = render(<LikeFailureToast isError={false} error={null} />);
    expect(container).toBeEmptyDOMElement();

    render(<LikeFailureToast isError error={new ApiError('좋아요를 저장하지 못했습니다', 500)} />);
    expect(screen.getByRole('status')).toHaveTextContent('좋아요를 저장하지 못했습니다');
  });
});

describe('과제 4 — 무효화의 범위', () => {
  async function fillCache() {
    const posts = await import('../api/posts');
    await queryClient.ensureQueryData({ queryKey: feedKey(), queryFn: () => posts.fetchFeed() });
    await queryClient.ensureQueryData({
      queryKey: feedKey('한강'),
      queryFn: () => posts.fetchFeed('한강'),
    });
    await queryClient.ensureQueryData(postQuery(1));
  }

  function invalidatedKeys() {
    return queryClient
      .getQueryCache()
      .getAll()
      .filter((query) => query.state.isInvalidated)
      .map((query) => JSON.stringify(query.queryKey))
      .sort();
  }

  it('① ["posts"] — 앞부분이 같은 것을 전부 잡는다', async () => {
    await fillCache();
    await queryClient.invalidateQueries({ queryKey: ['posts'] });

    expect(invalidatedKeys()).toEqual([
      '["posts",1]',
      '["posts",{"tag":"한강"}]',
      '["posts"]',
    ].sort());
  });

  it('② feedKey() — ① 과 완전히 같다', async () => {
    await fillCache();
    await queryClient.invalidateQueries({ queryKey: feedKey() });

    expect(invalidatedKeys()).toEqual([
      '["posts",1]',
      '["posts",{"tag":"한강"}]',
      '["posts"]',
    ].sort());
  });

  it('③ exact: true — 딱 그것 하나만', async () => {
    await fillCache();
    await queryClient.invalidateQueries({ queryKey: ['posts'], exact: true });

    expect(invalidatedKeys()).toEqual(['["posts"]']);
  });
});
