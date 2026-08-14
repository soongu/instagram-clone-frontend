// apps/web-spa/src/routes/c6-throw-on-error.test.tsx
// C-6 Step 8 — 읽기 실패를 화면 밖으로 (내부 검증용)
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { routes } from './routes';
import { withApp } from '../../scratch/c3-theme-harness';
import { server, API_BASE, failure, resetRequestLog, fakeAuth } from '../../scratch/c5-server-harness';
import { c6Handlers, fakeDb, deleteCommentHandler } from '../../scratch/c6-server-harness';
import { queryClient } from '../queries/queryClient';
import { login } from '../api/auth';

// 라우터가 잡은 오류를 콘솔에 흘린다. 판정과 상관없는 잡음이라 이 파일에서만 막는다.
let consoleError: ReturnType<typeof vi.spyOn>;

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

beforeEach(() => {
  server.use(...c6Handlers());
  resetRequestLog();
  fakeAuth.reset();
  fakeDb.reset();
  queryClient.clear();
  consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  // ⚠️ 앱 기본값은 실패하면 세 번 더 물어본다(백오프까지 하면 몇 초).
  //    오류 화면이 뜨는 것 자체를 보는 판이라 그 재시도만 끈다.
  // ⚠️ setDefaultOptions 는 queries 를 통째로 갈아치운다.
  //    그냥 { retry:false } 만 주면 throwOnError 까지 지워진다.
  queryClient.setDefaultOptions({
    queries: { ...queryClient.getDefaultOptions().queries, retry: false },
  });
});

afterEach(() => {
  server.resetHandlers();
  consoleError.mockRestore();
});

afterAll(() => server.close());

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(withApp(<RouterProvider router={router} />));
  return router;
}

describe('읽다가 실패하면 화면이 통째로 갈린다', () => {
  it('★ 피드가 실패하면 오류 화면이 뜬다 — 홈이 처리하지 않는다', async () => {
    server.use(
      http.get(`${API_BASE}/posts`, () =>
        HttpResponse.json(failure('피드를 만들지 못했습니다'), { status: 500 }),
      ),
    );

    renderAt('/');

    expect(await screen.findByText('문제가 생겼어요')).toBeInTheDocument();
    expect(screen.getByText('피드를 만들지 못했습니다')).toBeInTheDocument();
  });

  it('오류 화면에는 머리말이 없다 — Layout 을 대신하기 때문이다', async () => {
    server.use(
      http.get(`${API_BASE}/posts`, () =>
        HttpResponse.json(failure('피드를 만들지 못했습니다'), { status: 500 }),
      ),
    );

    renderAt('/');
    await screen.findByText('문제가 생겼어요');

    expect(screen.queryByRole('navigation', { name: '주요 메뉴' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: '홈으로' })).toBeInTheDocument();
  });

  it('화면 파일에서 실패를 다루는 갈래가 사라졌다', async () => {
    const home = await import('./HomePage.tsx?raw');
    const explore = await import('./ExplorePage.tsx?raw');

    expect(home.default).not.toMatch(/error/);
    expect(explore.default).not.toMatch(/error !== null/);
    // 두 갈래(기다리는 중 / 실패)가 한 갈래로 줄었다
    expect(home.default).toMatch(/isSuccess/);
    expect(explore.default).toMatch(/isSuccess/);
  });
});

describe('실패하면 바로 포기하지 않는다', () => {
  it('★ 기본값은 세 번 더 물어본다 — 요청이 모두 네 번', async () => {
    queryClient.setDefaultOptions({
      queries: { ...queryClient.getDefaultOptions().queries, retry: 3, retryDelay: 0 },
    });

    let calls = 0;
    server.use(
      http.get(`${API_BASE}/posts`, () => {
        calls += 1;
        return HttpResponse.json(failure('피드를 만들지 못했습니다'), { status: 500 });
      }),
    );

    renderAt('/');
    await screen.findByText('문제가 생겼어요');

    expect(calls).toBe(4);
  });
});

describe('★ 쓰기는 위로 안 던진다', () => {
  it('삭제가 거절당해도 화면은 그대로고 그 자리에서 알린다', async () => {
    const user = userEvent.setup();
    await login('jaehoon');
    server.use(deleteCommentHandler());

    renderAt('/p/1');
    await screen.findByText('와 여기 어디예요?');

    const buttons = await screen.findAllByRole('button', { name: '댓글 삭제' });
    await user.click(buttons[0]);
    await user.click(await screen.findByRole('button', { name: '지우기' }));

    // 오류 화면으로 안 넘어간다
    expect(await screen.findByRole('status')).toHaveTextContent('내가 쓴 댓글만 지울 수 있습니다');
    expect(screen.queryByText('문제가 생겼어요')).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: '게시물' })).toBeInTheDocument();
  });
});
