// apps/web-spa/src/routes/c6-delete-rollback.test.tsx
// C-6 Step 7 — 서버가 거절한 삭제를 되돌린다 (내부 검증용)
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import { routes } from './routes';
import { withApp } from '../../scratch/c3-theme-harness';
import { server, requestLog, resetRequestLog, fakeAuth } from '../../scratch/c5-server-harness';
import { c6Handlers, fakeDb, deleteCommentHandler } from '../../scratch/c6-server-harness';
import { queryClient } from '../queries/queryClient';
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

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(withApp(<RouterProvider router={router} />));
  return router;
}

async function askToDelete(user: ReturnType<typeof userEvent.setup>, index = 0) {
  const buttons = await screen.findAllByRole('button', { name: '댓글 삭제' });
  await user.click(buttons[index]);
  await user.click(await screen.findByRole('button', { name: '지우기' }));
}

describe('서버 댓글을 보여준다', () => {
  it('1번 게시물에는 남이 쓴 댓글 둘이 있다', async () => {
    renderAt('/p/1');

    expect(await screen.findByText('와 여기 어디예요?')).toBeInTheDocument();
    expect(screen.getByText('노을 색이 진짜 좋네요')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem').filter((li) => li.textContent?.includes('minji'))).toHaveLength(1);
  });
});

describe('내 댓글은 지워진다', () => {
  it('2번 게시물의 내 댓글을 지우면 목록에서 사라진다', async () => {
    const user = userEvent.setup();
    await login('jaehoon');

    renderAt('/p/2');
    await screen.findByText('3박 4일이면 넉넉했나요?');

    await askToDelete(user);

    await expect
      .poll(() => screen.queryByText('3박 4일이면 넉넉했나요?'))
      .toBeNull();
    expect(fakeDb.comments.some((comment) => comment.id === 3)).toBe(false);
  });
});

describe('★ 남의 댓글은 서버가 403 으로 거절한다', () => {
  it('먼저 사라졌다가 되돌아온다', async () => {
    const user = userEvent.setup();
    await login('jaehoon');

    // 되돌아오는 순간을 보려면 거절이 조금 늦게 와야 한다
    server.use(deleteCommentHandler(300));

    renderAt('/p/1');
    await screen.findByText('와 여기 어디예요?');

    await askToDelete(user);

    // 물어보자마자 목록에서 빠진다
    expect(screen.queryByText('와 여기 어디예요?')).not.toBeInTheDocument();

    // 서버가 거절하면 되돌아온다
    expect(await screen.findByText('와 여기 어디예요?')).toBeInTheDocument();
  });

  it('서버가 보낸 사유가 화면에 뜬다', async () => {
    const user = userEvent.setup();
    await login('jaehoon');

    renderAt('/p/1');
    await screen.findByText('와 여기 어디예요?');

    await askToDelete(user);

    expect(await screen.findByRole('status')).toHaveTextContent('내가 쓴 댓글만 지울 수 있습니다');
  });

  it('서버 쪽 댓글은 그대로 남아 있다', async () => {
    const user = userEvent.setup();
    await login('jaehoon');

    renderAt('/p/1');
    await screen.findByText('와 여기 어디예요?');

    await askToDelete(user);
    await expect.poll(() => requestLog.filter((e) => e.startsWith('DELETE')).length).toBe(1);

    expect(fakeDb.comments.filter((comment) => comment.postId === 1)).toHaveLength(2);
  });
});

describe('확인 상자를 거치지 않으면 아무 일도 없다', () => {
  it('취소하면 요청이 안 나간다', async () => {
    const user = userEvent.setup();
    await login('jaehoon');

    renderAt('/p/1');
    await screen.findByText('와 여기 어디예요?');

    const buttons = await screen.findAllByRole('button', { name: '댓글 삭제' });
    await user.click(buttons[0]);
    await user.click(await screen.findByRole('button', { name: '취소' }));

    expect(requestLog.filter((entry) => entry.startsWith('DELETE'))).toHaveLength(0);
    expect(screen.getByText('와 여기 어디예요?')).toBeInTheDocument();
  });
});
