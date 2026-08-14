// apps/web-spa/src/routes/c5-stale-server-state.test.tsx
// C-5 Step 5 — 서버 값은 우리가 안 만졌는데도 틀려진다 (내부 검증용)
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach, vi } from 'vitest';
import { HomePageByEffect } from '../../scratch/c5-effect-fetch-before';
import { withRouter } from '../../scratch/c1-router-harness';
import { withQuery } from '../../scratch/c5-query-harness';
import { server, feedHandler, requestLog, resetRequestLog } from '../../scratch/c5-server-harness';
import { allPosts } from '../data/feed';
import type { Post } from '../types/instagram';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
beforeEach(() => resetRequestLog());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// 서버 쪽 값이 바뀐 상황을 만든다 — 다른 사람이 좋아요를 누른 것
function withLikeCount(id: number, likeCount: number): Post[] {
  return allPosts.map((post) => (post.id === id ? { ...post, likeCount } : post));
}

const FIRST_POST = allPosts[0];

describe('한 번 가져온 값은 그 순간의 사진이다', () => {
  it('처음 그린 화면에는 그때의 숫자가 들어 있다', async () => {
    render(withQuery(withRouter(<HomePageByEffect />)));

    expect(await screen.findByText(`좋아요 ${FIRST_POST.likeCount}개`)).toBeInTheDocument();
  });

  it('★ 서버 값이 바뀌어도 이미 그려진 화면은 옛 숫자를 그대로 들고 있다', async () => {
    render(withQuery(withRouter(<HomePageByEffect />)));
    await screen.findByText(`좋아요 ${FIRST_POST.likeCount}개`);

    // 다른 사람이 좋아요를 눌렀다
    server.use(feedHandler(withLikeCount(FIRST_POST.id, FIRST_POST.likeCount + 1)));

    // 우리 화면은 아무 일도 없다. 물어보지 않았으니까.
    expect(screen.getByText(`좋아요 ${FIRST_POST.likeCount}개`)).toBeInTheDocument();
    expect(screen.queryByText(`좋아요 ${FIRST_POST.likeCount + 1}개`)).not.toBeInTheDocument();
  });

  it('★ 아무도 "언제 다시 물어볼지" 를 정해두지 않았다 — 시간이 흘러도 요청은 한 번뿐', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    try {
      render(withQuery(withRouter(<HomePageByEffect />)));
      await screen.findByText(`좋아요 ${FIRST_POST.likeCount}개`);

      await vi.advanceTimersByTimeAsync(60_000);

      expect(requestLog.filter((line) => line === 'GET /api/posts')).toHaveLength(1);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('두 화면이 서로 다른 숫자를 보여준다', () => {
  it('★ 먼저 열어둔 화면과 나중에 연 화면의 좋아요 개수가 갈린다', async () => {
    // 먼저 연 화면
    const first = render(withQuery(withRouter(<HomePageByEffect />)));
    await screen.findByText(`좋아요 ${FIRST_POST.likeCount}개`);

    // 그사이 서버 값이 올랐다
    server.use(feedHandler(withLikeCount(FIRST_POST.id, FIRST_POST.likeCount + 1)));

    // 나중에 연 화면 (다른 탭을 새로 연 것과 같다)
    const second = render(withQuery(withRouter(<HomePageByEffect />)), { container: document.body.appendChild(document.createElement('div')) });
    await screen.findByText(`좋아요 ${FIRST_POST.likeCount + 1}개`);

    expect(screen.getByText(`좋아요 ${FIRST_POST.likeCount}개`)).toBeInTheDocument();
    expect(screen.getByText(`좋아요 ${FIRST_POST.likeCount + 1}개`)).toBeInTheDocument();

    first.unmount();
    second.unmount();
  });
});

describe('화면 안 값은 성질이 다르다 — 우리가 바꿀 때만 바뀐다', () => {
  it('캡션을 펼친 상태는 서버가 무엇을 하든 그대로다', async () => {
    const user = userEvent.setup();
    render(withQuery(withRouter(<HomePageByEffect />)));
    await screen.findAllByRole('article');

    const [firstMore] = screen.getAllByRole('button', { name: '더 보기' });
    await user.click(firstMore);
    expect(screen.getAllByRole('button', { name: '접기' })).toHaveLength(1);

    // 서버 값이 바뀌어도 펼침 여부는 서버가 모르는 값이다
    server.use(feedHandler(withLikeCount(FIRST_POST.id, 99_999)));

    expect(screen.getAllByRole('button', { name: '접기' })).toHaveLength(1);
  });

  it('좋아요 버튼을 눌러 바꾼 화면은 새로 그리면 서버 값으로 돌아간다', async () => {
    const user = userEvent.setup();
    render(withQuery(withRouter(<HomePageByEffect />)));
    await screen.findAllByRole('article');

    await user.click(screen.getAllByRole('button', { name: '좋아요' })[0]);
    expect(screen.getByText(`좋아요 ${FIRST_POST.likeCount + 1}개`)).toBeInTheDocument();

    // 화면을 새로 여는 것 = 서버에 다시 물어보는 것
    cleanup();
    render(withQuery(withRouter(<HomePageByEffect />)));

    // 우리가 누른 것은 서버에 안 갔으므로 사라진다 (쓰기는 다음 시간)
    expect(await screen.findByText(`좋아요 ${FIRST_POST.likeCount}개`)).toBeInTheDocument();
  });
});
