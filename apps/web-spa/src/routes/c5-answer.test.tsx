// apps/web-spa/src/routes/c5-answer.test.tsx
// C-5 과제 예시답안 검증 (내부 검증용)
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach, vi } from 'vitest';
import {
  AnswerPostDetail,
  AnswerFeedWithRefresh,
  postKey,
  usePostQuery,
} from '../../scratch/c5-story-answer';
import { fetchPostById } from '../api/posts';
import { withQuery, freshQueryClient } from '../../scratch/c5-query-harness';
import { server, API_BASE, feedHandler, requestLog, resetRequestLog } from '../../scratch/c5-server-harness';
import { allPosts } from '../data/feed';
import type { Post } from '../types/instagram';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
beforeEach(() => resetRequestLog());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const FIRST_POST = allPosts[0];

// 반례 — 키에 번호가 없는 판
function FixedKeyDetail({ id }: { id: number }) {
  const { data } = useQuery({
    queryKey: ['posts', 'detail'],
    queryFn: () => fetchPostById(id),
  });

  return <p>{data?.username ?? '없음'}</p>;
}
const CAFE_COUNT = allPosts.filter((post) => post.hashtagNames.includes('카페')).length;

function renderDetail(path: string, client = freshQueryClient()) {
  render(
    withQuery(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/p/:postId" element={<AnswerPostDetail />} />
        </Routes>
      </MemoryRouter>,
      client,
    ),
  );

  return client;
}

describe('과제 1 — 게시물 상세도 서버에서', () => {
  it('키에 번호가 들어간다', () => {
    expect(postKey(1)).toEqual(['posts', 'detail', { id: 1 }]);
    expect(postKey(1)).not.toEqual(postKey(2));
  });

  it('/p/1 은 1번 게시물을 서버에서 받아 그린다', async () => {
    renderDetail('/p/1');

    expect(await screen.findByRole('article', { name: '게시물' })).toBeInTheDocument();
    expect(screen.getByText(FIRST_POST.username)).toBeInTheDocument();
    expect(requestLog).toContain('GET /api/posts/1');
  });

  it('없는 번호면 서버가 보낸 사유가 뜬다', async () => {
    renderDetail('/p/999');

    expect(await screen.findByText('게시물을 찾을 수 없습니다')).toBeInTheDocument();
  });

  it('★ 다녀온 뒤 다시 들어가면 기다리는 화면이 안 뜬다', async () => {
    const client = freshQueryClient();
    renderDetail('/p/1', client);
    await screen.findByRole('article', { name: '게시물' });

    // 화면을 떠났다 다시 들어온다
    render(
      withQuery(
        <MemoryRouter initialEntries={['/p/1']}>
          <Routes>
            <Route path="/p/:postId" element={<AnswerPostDetail />} />
          </Routes>
        </MemoryRouter>,
        client,
      ),
    );

    expect(screen.getAllByRole('article', { name: '게시물' })).toHaveLength(2);
    expect(screen.queryByText('게시물을 불러오는 중이에요…')).not.toBeInTheDocument();
  });

  it('게시물마다 다른 키라서 서로 안 섞인다', async () => {
    const client = freshQueryClient();
    renderDetail('/p/1', client);
    await screen.findByRole('article', { name: '게시물' });

    expect((client.getQueryData(postKey(1)) as Post).username).toBe(FIRST_POST.username);
    expect(client.getQueryData(postKey(2))).toBeUndefined();
  });

  it('훅은 화면 없이도 키를 만든다 — 같은 번호면 같은 키', () => {
    expect(typeof usePostQuery).toBe('function');
    expect(postKey(7)).toEqual(postKey(7));
  });
});

describe('과제 2 — 다시 불러오기 버튼', () => {
  it('누르면 서버에 다시 물어본다', async () => {
    const user = userEvent.setup();
    render(withQuery(<MemoryRouter><AnswerFeedWithRefresh /></MemoryRouter>));
    await screen.findAllByRole('article');
    resetRequestLog();

    await user.click(screen.getByRole('button', { name: '새로고침' }));

    expect(requestLog.filter((line) => line === 'GET /api/posts')).toHaveLength(1);
  });

  it('★ 다시 물어보는 동안에도 목록이 그대로 남아 있다', async () => {
    const user = userEvent.setup();
    // 응답을 늦춰서 그 사이를 본다
    server.use(feedHandler(allPosts, 50));
    render(withQuery(<MemoryRouter><AnswerFeedWithRefresh /></MemoryRouter>));
    await screen.findAllByRole('article');

    await user.click(screen.getByRole('button', { name: '새로고침' }));

    // 목록이 사라지지 않는다
    expect(screen.getAllByRole('article').length).toBeGreaterThan(0);
    expect(screen.queryByText('피드를 불러오는 중이에요…')).not.toBeInTheDocument();
  });

  it('★ 그 동안 버튼이 잠기고 글자가 바뀐다 — isFetching 을 봐야 한다', async () => {
    const user = userEvent.setup();
    server.use(feedHandler(allPosts, 50));
    render(withQuery(<MemoryRouter><AnswerFeedWithRefresh /></MemoryRouter>));
    await screen.findAllByRole('article');

    await user.click(screen.getByRole('button', { name: '새로고침' }));

    const busy = screen.getByRole('button', { name: '불러오는 중…' });
    expect(busy).toBeDisabled();

    expect(await screen.findByRole('button', { name: '새로고침' })).toBeEnabled();
  });
});

describe('과제 3 — staleTime 을 바꿔가며 재보기', () => {
  // 전체 → 카페 → 전체 → 카페 를 5초 안에 누른 뒤 요청 수를 센다
  async function countRequests(staleTime: number) {
    const { ExplorePage } = await import('./ExplorePage');
    const client = new QueryClient({
      defaultOptions: { queries: { staleTime, gcTime: 5 * 60_000, retry: false } },
    });
    const user = userEvent.setup();

    const view = render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={['/explore']}>
          <ExplorePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    await screen.findAllByRole('img');

    await user.click(await screen.findByRole('button', { name: '카페' }));
    await screen.findAllByRole('img');
    resetRequestLog();

    await user.click(screen.getByRole('button', { name: '전체' }));
    await screen.findAllByRole('img');
    await user.click(screen.getByRole('button', { name: '카페' }));
    await screen.findAllByRole('img');

    const count = requestLog.filter((line) => line.startsWith('GET /api/posts')).length;
    view.unmount();
    client.clear();

    return count;
  }

  it('0 이면 두 번, 3초·60초면 0 번이다', async () => {
    expect(await countRequests(0)).toBe(2);
    expect(await countRequests(3_000)).toBe(0);
    expect(await countRequests(60_000)).toBe(0);
  });

  it('★ gcTime 이 짧으면 다녀오는 사이에 지워진다', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    try {
      const { ExplorePage } = await import('./ExplorePage');
      const client = new QueryClient({
        defaultOptions: { queries: { staleTime: 30_000, gcTime: 1_000, retry: false } },
      });

      const view = render(
        <QueryClientProvider client={client}>
          <MemoryRouter initialEntries={['/explore']}>
            <ExplorePage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findAllByRole('img');
      view.unmount();

      await vi.advanceTimersByTimeAsync(2_000);

      expect(client.getQueryData(['posts'])).toBeUndefined();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('과제 4 — 인터셉터를 껐을 때', () => {
  it('응답 인터셉터가 없으면 화면까지 껍데기가 흘러간다', async () => {
    // 인터셉터가 없는 맨 axios 로 같은 주소를 부른다
    const axios = (await import('axios')).default;
    const response = await axios.get(`${API_BASE}/posts`);

    // 배열이 아니라 껍데기가 온다 — 화면에서 .map 을 부르면 터진다
    expect(Array.isArray(response.data)).toBe(false);
    expect(response.data).toHaveProperty('success', true);
    expect(response.data.data).toHaveLength(allPosts.length);
  });

  it('요청 인터셉터가 없으면 좋아요가 401 을 받는다', async () => {
    const axios = (await import('axios')).default;

    const status = await axios
      .post(`${API_BASE}/posts/1/like`)
      .then((response) => response.status)
      .catch((error: { response?: { status: number } }) => error.response?.status);

    expect(status).toBe(401);
  });
});

describe('과제 5 — 값의 성질이 staleTime 을 정한다', () => {
  it('탐색 화면의 태그 목록은 게시물보다 덜 바뀐다', async () => {
    const client = freshQueryClient();
    const { ExplorePage } = await import('./ExplorePage');
    const user = userEvent.setup();

    render(
      withQuery(
        <MemoryRouter initialEntries={['/explore']}>
          <ExplorePage />
        </MemoryRouter>,
        client,
      ),
    );
    await screen.findAllByRole('img');

    await user.click(await screen.findByRole('button', { name: '카페' }));
    await screen.findAllByRole('img');

    // 게시물은 태그마다 다시 받지만 태그 목록은 한 번만 받는다
    expect(requestLog.filter((line) => line === 'GET /api/tags')).toHaveLength(1);
    expect(requestLog.filter((line) => line.startsWith('GET /api/posts'))).toHaveLength(2);
    expect(CAFE_COUNT).toBeLessThan(allPosts.length);
  });

  it('경매 최고가처럼 밀려와야 하는 값은 이 도구가 아니다 — 다시 물어봐야만 안다', async () => {
    const client = freshQueryClient();
    const { ExplorePage } = await import('./ExplorePage');

    render(
      withQuery(
        <MemoryRouter initialEntries={['/explore']}>
          <ExplorePage />
        </MemoryRouter>,
        client,
      ),
    );
    await screen.findAllByRole('img');

    // 서버 값이 바뀌어도 우리가 물어보기 전에는 화면이 모른다
    server.use(feedHandler(allPosts.slice(0, 2)));

    expect(screen.getAllByRole('img')).toHaveLength(allPosts.length);
  });
});

describe('반례 — 상세 키에 번호를 안 넣으면', () => {
  it('★ 다른 게시물을 열어도 앞의 것이 그대로 뜬다', async () => {
    const client = freshQueryClient();

    const first = render(withQuery(<FixedKeyDetail id={1} />, client));
    expect(await screen.findByText(FIRST_POST.username)).toBeInTheDocument();
    first.unmount();

    render(withQuery(<FixedKeyDetail id={2} />, client));

    // 2번을 달라고 했는데 1번이 그대로 있다
    expect(screen.getByText(FIRST_POST.username)).toBeInTheDocument();
    expect(screen.queryByText(allPosts[1].username)).not.toBeInTheDocument();
  });
});
