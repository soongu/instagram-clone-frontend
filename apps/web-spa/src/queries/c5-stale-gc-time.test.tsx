// apps/web-spa/src/queries/c5-stale-gc-time.test.tsx
// C-5 Step 8 — 두 시간이 서로 다른 일을 한다 (내부 검증용)
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach, vi } from 'vitest';
import { ExplorePage } from '../routes/ExplorePage';
import { queryClient } from './queryClient';
import { feedKey } from './posts';
import { server, requestLog, resetRequestLog } from '../../scratch/c5-server-harness';
import { allPosts } from '../data/feed';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
beforeEach(() => resetRequestLog());
afterEach(() => {
  server.resetHandlers();
  queryClient.clear();
});
afterAll(() => server.close());

const CAFE_COUNT = allPosts.filter((post) => post.hashtagNames.includes('카페')).length;

// 앱과 같은 값을 쓰되 실패 재시도만 끈다 — 실패를 재려면 한 번에 끝나야 한다
function appLikeClient(overrides: { staleTime?: number; gcTime?: number } = {}) {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: false,
        ...overrides,
      },
    },
  });
}

function renderExplore(client: QueryClient, path = '/explore') {
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <ExplorePage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('앱이 쓰는 값', () => {
  it('staleTime 30 초 · gcTime 5 분이 기본값으로 박혀 있다', () => {
    const defaults = queryClient.getDefaultOptions().queries;

    expect(defaults?.staleTime).toBe(30_000);
    expect(defaults?.gcTime).toBe(5 * 60_000);
  });
});

describe('staleTime — 그 시간 안에는 다시 안 물어본다', () => {
  it('★ 이미 본 태그로 돌아가면 이제 요청이 아예 안 나간다', async () => {
    const user = userEvent.setup();
    const client = appLikeClient();
    renderExplore(client);
    await screen.findAllByRole('img');

    await user.click(await screen.findByRole('button', { name: '카페' }));
    await screen.findAllByRole('img');
    resetRequestLog();

    await user.click(screen.getByRole('button', { name: '전체' }));
    await screen.findAllByRole('img');
    await user.click(screen.getByRole('button', { name: '카페' }));
    await screen.findAllByRole('img');

    // Step 7 에서는 여기서 두 번 나갔다
    expect(requestLog.filter((line) => line.startsWith('GET /api/posts'))).toHaveLength(0);
  });

  it('staleTime 을 0 으로 두면 Step 7 에서 본 그 두 번이 다시 나간다', async () => {
    const user = userEvent.setup();
    const client = appLikeClient({ staleTime: 0 });
    renderExplore(client);
    await screen.findAllByRole('img');

    await user.click(await screen.findByRole('button', { name: '카페' }));
    await screen.findAllByRole('img');
    resetRequestLog();

    await user.click(screen.getByRole('button', { name: '전체' }));
    await screen.findAllByRole('img');
    await user.click(screen.getByRole('button', { name: '카페' }));
    await screen.findAllByRole('img');

    expect(requestLog.filter((line) => line.startsWith('GET /api/posts'))).toEqual([
      'GET /api/posts',
      'GET /api/posts?tag=카페',
    ]);
  });

  it('★ 30 초가 지나면 다시 물어본다', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    try {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const client = appLikeClient();
      renderExplore(client);
      await screen.findAllByRole('img');

      await user.click(await screen.findByRole('button', { name: '카페' }));
      await screen.findAllByRole('img');

      await vi.advanceTimersByTimeAsync(31_000);
      resetRequestLog();

      await user.click(screen.getByRole('button', { name: '전체' }));
      await screen.findAllByRole('img');

      expect(requestLog.filter((line) => line === 'GET /api/posts')).toHaveLength(1);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('gcTime — 아무도 안 볼 때 캐시에 얼마나 남아 있나', () => {
  it('화면을 떠나도 캐시에는 그대로 있다', async () => {
    const client = appLikeClient();
    const view = renderExplore(client);
    await screen.findAllByRole('img');

    view.unmount();

    expect(client.getQueryData(feedKey())).toHaveLength(allPosts.length);
  });

  it('★ gcTime 이 지나면 캐시에서 지워진다 — 다시 열면 처음부터다', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    try {
      const client = appLikeClient({ gcTime: 1_000 });
      const view = renderExplore(client);
      await screen.findAllByRole('img');
      view.unmount();

      expect(client.getQueryData(feedKey())).toHaveLength(allPosts.length);

      await vi.advanceTimersByTimeAsync(1_500);

      expect(client.getQueryData(feedKey())).toBeUndefined();
    } finally {
      vi.useRealTimers();
    }
  });

  it('★ 두 시간은 서로를 안 본다 — 낡았어도 캐시에는 남아 있다', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    try {
      // 곧바로 낡지만 오래 남는 값
      const client = appLikeClient({ staleTime: 0, gcTime: 5 * 60_000 });
      const view = renderExplore(client);
      await screen.findAllByRole('img');
      view.unmount();

      await vi.advanceTimersByTimeAsync(60_000);

      // 낡은 지 오래인데도 캐시에 있다 → 다시 열면 이것을 먼저 보여준다
      expect(client.getQueryData(feedKey())).toHaveLength(allPosts.length);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('낡은 값을 보여주면서 뒤에서 새로 받는다', () => {
  it('★ 다시 물어보는 동안에도 기다리는 화면이 안 뜬다', async () => {
    const user = userEvent.setup();
    const client = appLikeClient({ staleTime: 0 });
    renderExplore(client);
    await screen.findAllByRole('img');

    await user.click(await screen.findByRole('button', { name: '카페' }));
    await screen.findAllByRole('img');
    await user.click(screen.getByRole('button', { name: '전체' }));
    await screen.findAllByRole('img');

    // 카페로 되돌아가는 순간 — 요청은 나가지만 화면은 이미 채워져 있다
    await user.click(screen.getByRole('button', { name: '카페' }));

    expect(screen.queryByText('게시물을 불러오는 중이에요…')).not.toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(CAFE_COUNT);
  });
});
