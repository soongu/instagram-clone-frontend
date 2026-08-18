// apps/web-spa/src/queries/c6-optimistic.test.tsx
// C-6 Step 4 — 기다리지 않고 먼저 바꾼다 (내부 검증용)
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import type { Post } from '../types/instagram';
import { HomePage } from '../routes/HomePage';
import { feedKey } from './posts';
import { withRouter } from '../../scratch/c1-router-harness';
import { withQuery, freshQueryClient } from '../../scratch/c5-query-harness';
import { server, resetRequestLog, fakeAuth } from '../../scratch/c5-server-harness';
import { c6Handlers, fakeDb, feedFromDb, likeToggleHandler } from '../../scratch/c6-server-harness';
import { login } from '../api/auth';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

beforeEach(() => {
  server.use(...c6Handlers());
  resetRequestLog();
  fakeAuth.reset();
  fakeDb.reset();
});

afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('먼저 바꾸고 나중에 확인한다', () => {
  it('★ 서버가 400ms 걸려도 화면은 기다리지 않는다', async () => {
    const user = userEvent.setup();
    await login('jaehoon');

    // 연습용 서버와 같은 지연을 준다
    server.use(feedFromDb(), likeToggleHandler(400));

    render(withQuery(withRouter(<HomePage />)));
    const hearts = await screen.findAllByRole('button', { name: '좋아요' });
    await screen.findByText('좋아요 1240개');

    await user.click(hearts[0]);

    // 서버는 아직 답도 안 했는데 화면은 이미 바뀌어 있다
    expect(screen.getByText('좋아요 1241개')).toBeInTheDocument();
    expect(fakeDb.find(1)?.likeCount).toBe(1240);
  });

  it('하트도 그 자리에서 빨개진다', async () => {
    const user = userEvent.setup();
    await login('jaehoon');
    server.use(feedFromDb(), likeToggleHandler(400));

    render(withQuery(withRouter(<HomePage />)));
    const hearts = await screen.findAllByRole('button', { name: '좋아요' });

    await user.click(hearts[0]);

    expect(hearts[0]).toHaveAttribute('aria-pressed', 'true');
  });

  it('서버 답이 오면 서버 값으로 맞춰진다', async () => {
    const user = userEvent.setup();
    await login('jaehoon');

    // ⚠️ 지연이 없으면 낙관적 값이 눈에 안 잡힌다 — 답이 먼저 도착해 덮어쓴다.
    //    아래 1241 단언은 기다리지 않고 그 자리에서 본다. 판이 늘어 컴퓨터가 바쁘면
    //    클릭 한 번이 수백 ms 를 먹어서 400ms 로는 답이 먼저 오기도 했다.
    //    창을 넓히되, 뒤의 기다림에도 그만큼 여유를 줘야 한다(아래 timeout).
    server.use(feedFromDb(), likeToggleHandler(700));

    render(withQuery(withRouter(<HomePage />)));
    const hearts = await screen.findAllByRole('button', { name: '좋아요' });
    await screen.findByText('좋아요 1240개');

    // 우리가 누르기 직전에 다른 사람들도 눌렀다
    const target = fakeDb.find(1);
    if (target === undefined) throw new Error('1번 게시물이 없다');
    target.likeCount = 1300;

    await user.click(hearts[0]);

    // 먼저 우리 셈으로 1241 을 보여주고
    expect(screen.getByText('좋아요 1241개')).toBeInTheDocument();

    // 답이 오면 진짜 값으로 갈린다 (기본 1초로는 위 지연을 못 기다린다)
    expect(await screen.findByText('좋아요 1301개', {}, { timeout: 5000 })).toBeInTheDocument();
    // ⚠️ 판 자체의 기본 한도도 5초다. 위 5초를 실제로 쓰려면 판의 한도를 함께 넓혀야 한다.
  }, 15_000);
});

describe('진행 중인 요청을 세우는 이유', () => {
  // ⚠️ 갈리는 것은 *마지막 값* 이 아니다. 끝나고 보면 어느 쪽이든 서버 값으로 맞는다.
  // 갈리는 것은 *가는 길에 한 번 되돌아가느냐* 다. 그래서 값의 흐름을 통째로 본다.
  it('★ 늦게 온 옛 답이 우리가 바꾼 것을 덮어쓰지 않는다', async () => {
    const user = userEvent.setup();
    await login('jaehoon');

    const client = freshQueryClient();

    // 피드는 200ms, 좋아요는 700ms — 그 사이(200~700ms)가 우리가 볼 구간이다
    server.use(feedFromDb(200), likeToggleHandler(700));

    render(withQuery(withRouter(<HomePage />), client));
    const hearts = await screen.findAllByRole('button', { name: '좋아요' });
    await screen.findByText('좋아요 1240개');

    // 다시 물어보기를 띄워놓고(아직 안 왔다) 그 사이에 누른다
    void client.refetchQueries({ queryKey: ['posts'] });
    await user.click(hearts[0]);

    const seen: number[] = [];
    for (let i = 0; i < 20; i += 1) {
      const value = client.getQueryData<Post[]>(feedKey())?.[0].likeCount;
      if (value !== undefined && seen.at(-1) !== value) seen.push(value);
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    // 세우지 않으면 여기가 [1241, 1240] 이 된다 — 옛 답이 덮어쓴 자국이다
    expect(seen).toEqual([1241]);
  });
});
