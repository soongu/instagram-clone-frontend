// apps/web-spa/src/routes/c7-answer.test.tsx
// C-7 과제 답안 검증 (내부 검증용)
import { describe, it, expect, vi, beforeEach, beforeAll, afterAll, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { withRouter } from '../../scratch/c1-router-harness';
import { withQuery } from '../../scratch/c5-query-harness';
import { server, resetRequestLog, fakeAuth } from '../../scratch/c5-server-harness';
import { c6Handlers, fakeDb } from '../../scratch/c6-server-harness';

const buttonRenders: string[] = [];

vi.mock('../components/ui/button', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../components/ui/button')>();
  const Original = mod.Button;
  return {
    ...mod,
    Button: (props: Parameters<typeof Original>[0]) => {
      buttonRenders.push(String(props.children));
      return <Original {...props} />;
    },
  };
});

const { ExplorePage } = await import('./ExplorePage');

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
beforeEach(() => {
  server.use(...c6Handlers());
  resetRequestLog();
  fakeAuth.reset();
  fakeDb.reset();
  buttonRenders.length = 0;
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('과제 1 — 탐색 화면을 재보면', () => {
  it('★ 태그를 바꾸면 태그 단추가 전부 다시 그려진다', async () => {
    const user = userEvent.setup();
    render(withQuery(withRouter(<ExplorePage />)));

    const all = await screen.findByRole('button', { name: '전체' });
    await screen.findAllByRole('img');

    const tagButtons = screen.getAllByRole('button');
    const buttonCount = tagButtons.length;
    buttonRenders.length = 0;

    await user.click(tagButtons[1]);
    await screen.findByRole('button', { name: '전체' });

    // 단추가 하나도 안 빠지고 다시 그려졌다
    expect(new Set(buttonRenders).size).toBe(buttonCount);
    expect(all).toBeInTheDocument();
  });

  it('★ 그런데 이건 낭비가 아니다 — 단추마다 눌린 표시가 실제로 갈린다', async () => {
    const user = userEvent.setup();
    render(withQuery(withRouter(<ExplorePage />)));

    const all = await screen.findByRole('button', { name: '전체' });
    await screen.findAllByRole('img');

    // 처음에는 "전체" 가 눌려 있다
    expect(all).toHaveAttribute('aria-pressed', 'true');

    const first = screen.getAllByRole('button')[1];
    const firstName = first.textContent ?? '';
    expect(first).toHaveAttribute('aria-pressed', 'false');

    await user.click(first);

    // 누른 뒤에는 둘 다 뒤집혔다 — 두 단추 다 그려질 이유가 있었다
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: firstName })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('태그를 바꾸면 목록도 실제로 갈린다', async () => {
    const user = userEvent.setup();
    render(withQuery(withRouter(<ExplorePage />)));

    await screen.findByRole('button', { name: '전체' });
    const before = (await screen.findAllByRole('img')).length;

    await user.click(screen.getAllByRole('button')[1]);

    await expect
      .poll(() => screen.queryAllByRole('img').length)
      .not.toBe(before);
  });
});
