// apps/web-spa/src/components/c7-stable-identity.test.tsx
// C-7 Step 1·5 — 컴파일러에게 안 바뀌는 것만 보여준다 (내부 검증용)
//
// 같은 컴파일러, 같은 화면인데 한 줄 차이로 6 과 0 이 갈린다.
// 대조군은 scratch/c7-feed-section-before.tsx 에 얼려 뒀다.
import { describe, it, expect, vi, beforeEach, beforeAll, afterAll, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { withRouter } from '../../scratch/c1-router-harness';
import { withQuery } from '../../scratch/c5-query-harness';
import { server, resetRequestLog, fakeAuth } from '../../scratch/c5-server-harness';
import { c6Handlers, fakeDb } from '../../scratch/c6-server-harness';
import { useLikeMutation } from '../queries/posts';
import { login } from '../api/auth';
import { allPosts } from '../data/feed';

const cardRenders: number[] = [];

vi.mock('./PostCard', async (importOriginal) => {
  const mod = await importOriginal<typeof import('./PostCard')>();
  const Original = mod.PostCard;
  return {
    PostCard: (props: Parameters<typeof Original>[0]) => {
      cardRenders.push(props.id);
      return <Original {...props} />;
    },
  };
});

const { FeedSection } = await import('./FeedSection');
const { FeedSectionBeforeStableIdentity } = await import('../../scratch/c7-feed-section-before');

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
beforeEach(() => {
  server.use(...c6Handlers());
  resetRequestLog();
  fakeAuth.reset();
  fakeDb.reset();
  cardRenders.length = 0;
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const THREE = allPosts.slice(0, 3);

async function clickFirstHeart(ui: React.ReactNode) {
  const user = userEvent.setup();
  await login('jaehoon');

  render(withQuery(withRouter(ui)));
  await screen.findAllByRole('button', { name: '좋아요' });

  cardRenders.length = 0;

  await user.click(screen.getAllByRole('button', { name: '좋아요' })[0]);
  // 토스트가 떴다는 것은 부모가 실제로 다시 그려졌다는 뜻이다
  await screen.findByRole('status');

  return [...cardRenders];
}

describe('C-7 — 무엇을 붙잡느냐로 갈린다', () => {
  it('결과 객체는 매 렌더 새것이고 .mutate 는 안 바뀐다', async () => {
    const seenObject: unknown[] = [];
    const seenMutate: unknown[] = [];

    function Probe() {
      const mutation = useLikeMutation();
      const [n, setN] = useState(0);

      seenObject.push(mutation);
      seenMutate.push(mutation.mutate);

      return <button onClick={() => setN(n + 1)}>다시 그리기 {n}</button>;
    }

    const user = userEvent.setup();
    await login('jaehoon');
    render(withQuery(withRouter(<Probe />)));

    await user.click(screen.getByRole('button', { name: /다시 그리기/ }));
    await screen.findByRole('button', { name: /다시 그리기 1/ });

    expect(seenObject).toHaveLength(2);
    // 두 번 그렸는데 객체는 둘 다 다른 것 — 이것이 컴파일러를 멈춰 세운다
    expect(new Set(seenObject).size).toBe(2);
    // 정작 우리가 쓰는 것은 안 바뀌었다
    expect(new Set(seenMutate).size).toBe(1);
  });

  it('★ 통째로 붙잡으면 토스트 한 번에 카드 세 장이 두 번씩 다시 그려진다', async () => {
    const renders = await clickFirstHeart(<FeedSectionBeforeStableIdentity posts={THREE} />);

    expect(renders).toEqual([1, 2, 3, 1, 2, 3]);
  });

  it('★ 안 바뀌는 것만 꺼내 쓰면 카드는 한 장도 다시 안 그려진다', async () => {
    const renders = await clickFirstHeart(<FeedSection posts={THREE} />);

    expect(renders).toEqual([]);
  });

  it('그래도 좋아요는 실제로 서버에 갔다 — 아무 일도 안 일어난 게 아니다', async () => {
    await clickFirstHeart(<FeedSection posts={THREE} />);

    expect(fakeDb.find(THREE[0].id)?.likeCount).toBe(THREE[0].likeCount + 1);
  });
});
