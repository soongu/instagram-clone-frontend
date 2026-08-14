// apps/web-spa/scratch/c6-cancel-probe.test.tsx
//
// cancelQueries 가 실제로 무엇을 막는지 재는 probe (내부 검증용)
// 캐시 값의 시간 변화를 찍어서, 세울 때와 안 세울 때를 견준다.
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider, useMutation, useQuery } from '@tanstack/react-query';
import type { Post } from '../src/types/instagram';
import { fetchFeed, likePost } from '../src/api/posts';
import { toggleLike } from '../src/lib/likes';
import { server, resetRequestLog, fakeAuth } from './c5-server-harness';
import { c6Handlers, fakeDb, feedFromDb, likeToggleHandler } from './c6-server-harness';
import { login } from '../src/api/auth';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

beforeEach(() => {
  server.use(...c6Handlers());
  resetRequestLog();
  fakeAuth.reset();
  fakeDb.reset();
});

afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function Probe({ cancel }: { cancel: boolean }) {
  const { data } = useQuery({ queryKey: ['posts'], queryFn: () => fetchFeed() });
  const like = useMutation({
    mutationFn: likePost,
    onMutate: async (postId, context) => {
      if (cancel) {
        await context.client.cancelQueries({ queryKey: ['posts'] });
      }
      context.client.setQueryData<Post[]>(['posts'], (previous) =>
        previous === undefined ? previous : toggleLike(previous, postId),
      );
    },
  });

  if (data === undefined) return <p>불러오는 중</p>;

  return (
    <div>
      <p data-count>{data[0].likeCount}</p>
      <button onClick={() => like.mutate(1)}>좋아요</button>
    </div>
  );
}

async function observe(cancel: boolean) {
  const user = userEvent.setup();
  await login('jaehoon');

  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 0 } } });
  // 피드는 200ms, 좋아요는 700ms — 그 사이(200~700ms)가 우리가 볼 구간이다
  server.use(feedFromDb(200), likeToggleHandler(700));

  render(
    <QueryClientProvider client={client}>
      <Probe cancel={cancel} />
    </QueryClientProvider>,
  );
  await screen.findByText('1240');

  // 다시 물어보기를 띄워놓고 그 사이에 누른다
  void client.refetchQueries({ queryKey: ['posts'] });
  await user.click(screen.getByRole('button', { name: '좋아요' }));

  const seen: number[] = [];
  for (let i = 0; i < 20; i += 1) {
    const value = client.getQueryData<Post[]>(['posts'])?.[0].likeCount;
    if (value !== undefined && seen.at(-1) !== value) seen.push(value);
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  return seen;
}

describe('cancelQueries 가 무엇을 막나', () => {
  it('세울 때 캐시 값의 흐름', async () => {
    const seen = await observe(true);
    console.log('[cancelQueries 있음]', JSON.stringify(seen));
    expect(seen.length).toBeGreaterThan(0);
  });

  it('안 세울 때 캐시 값의 흐름', async () => {
    const seen = await observe(false);
    console.log('[cancelQueries 없음]', JSON.stringify(seen));
    expect(seen.length).toBeGreaterThan(0);
  });
});
