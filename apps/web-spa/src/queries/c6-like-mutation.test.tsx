// apps/web-spa/src/queries/c6-like-mutation.test.tsx
// C-6 Step 1 — 좋아요를 서버에 보낸다 (내부 검증용)
import { StrictMode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import { HomePage } from '../routes/HomePage';
import { SignInButton } from '../components/SignInButton';
import { withRouter } from '../../scratch/c1-router-harness';
import { withQuery, freshQueryClient } from '../../scratch/c5-query-harness';
import { server, requestLog, resetRequestLog, fakeAuth } from '../../scratch/c5-server-harness';
import { c6Handlers, fakeDb } from '../../scratch/c6-server-harness';
import { login } from '../api/auth';
import { useSessionStore } from '../stores/useSessionStore';
import { fetchFeed } from '../api/posts';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

beforeEach(() => {
  server.use(...c6Handlers());
  resetRequestLog();
  fakeAuth.reset();
  fakeDb.reset();
  // C-9 에서 "누구로 들어와 있는지" 가 store 로 옮겨갔다.
  // store 는 판이 끝나도 안 지워지니 판마다 로그아웃 상태에서 시작한다.
  useSessionStore.getState().signOut();
});

afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function likeRequests() {
  return requestLog.filter((entry) => entry.endsWith('/like'));
}

describe('하트를 누르면 서버로 간다', () => {
  it('출입증을 받은 뒤 누르면 POST 가 나간다', async () => {
    const user = userEvent.setup();
    await login('jaehoon');

    render(withQuery(withRouter(<HomePage />)));
    const hearts = await screen.findAllByRole('button', { name: '좋아요' });

    await user.click(hearts[0]);

    expect(likeRequests()).toEqual(['POST /api/posts/1/like']);
  });

  it('서버가 기억한다 — 다시 물어보면 뒤집힌 값이 온다', async () => {
    const user = userEvent.setup();
    await login('jaehoon');

    render(withQuery(withRouter(<HomePage />)));
    const hearts = await screen.findAllByRole('button', { name: '좋아요' });

    // 1번 게시물은 처음에 안 눌린 상태고 좋아요가 1240 개다
    expect(fakeDb.find(1)).toMatchObject({ liked: false, likeCount: 1240 });

    await user.click(hearts[0]);
    await expect.poll(() => fakeDb.find(1)?.liked).toBe(true);

    // 화면을 새로 여는 것과 같다 — 캐시를 안 거치고 서버에 직접 물어본다
    const fromServer = await fetchFeed();

    expect(fromServer[0]).toMatchObject({ id: 1, liked: true, likeCount: 1241 });
  });

  it('출입증이 없으면 서버가 거절한다', async () => {
    const user = userEvent.setup();

    render(withQuery(withRouter(<HomePage />)));
    const hearts = await screen.findAllByRole('button', { name: '좋아요' });

    await user.click(hearts[0]);
    await expect.poll(() => likeRequests().length).toBeGreaterThan(0);

    // 서버는 요청을 받았지만 아무것도 안 바꿨다
    expect(fakeDb.find(1)).toMatchObject({ liked: false, likeCount: 1240 });
  });
});

describe('읽기와 쓰기는 나가는 횟수가 다르다', () => {
  it('★ StrictMode 에서 읽기는 두 번 불러도 요청이 한 번이다 — 같은 키라 합쳐진다', async () => {
    await login('jaehoon');

    render(<StrictMode>{withQuery(withRouter(<HomePage />))}</StrictMode>);
    await screen.findAllByRole('button', { name: '좋아요' });

    // C-5 Step 1 의 effect+fetch 판은 같은 자리에서 두 번 나갔다.
    // 도구를 쓰면 같은 키로 겹친 요청이 하나로 합쳐진다.
    expect(requestLog.filter((entry) => entry === 'GET /api/posts')).toHaveLength(1);
  });

  it('★ 그런데 쓰기는 안 합쳐준다 — 누른 만큼 나간다', async () => {
    const user = userEvent.setup();
    await login('jaehoon');

    render(<StrictMode>{withQuery(withRouter(<HomePage />))}</StrictMode>);
    const hearts = await screen.findAllByRole('button', { name: '좋아요' });

    await user.click(hearts[0]);
    await expect.poll(() => likeRequests().length).toBe(1);

    expect(likeRequests()).toEqual(['POST /api/posts/1/like']);
  });

  it('★ 두 번 누르면 두 번 나간다 — 도구가 합쳐주지 않는다', async () => {
    const user = userEvent.setup();
    await login('jaehoon');

    render(withQuery(withRouter(<HomePage />)));
    const hearts = await screen.findAllByRole('button', { name: '좋아요' });

    await user.click(hearts[0]);
    await user.click(hearts[0]);
    await expect.poll(() => likeRequests().length).toBe(2);

    // 눌렀다 껐으니 서버 값은 처음으로 돌아와 있다
    await expect.poll(() => fakeDb.find(1)?.likeCount).toBe(1240);
    expect(fakeDb.find(1)?.liked).toBe(false);
  });
});

describe('출입증 버튼', () => {
  it('누르면 로그인하고 이름이 뜬다', async () => {
    const user = userEvent.setup();
    const client = freshQueryClient();

    render(withQuery(<SignInButton />, client));

    await user.click(screen.getByRole('button', { name: '로그인' }));

    expect(await screen.findByText('jaehoon')).toBeInTheDocument();
    expect(requestLog).toContain('POST /api/auth/login');
  });

  it('보내는 동안에는 못 누른다', async () => {
    const user = userEvent.setup();
    const client = freshQueryClient();

    render(withQuery(<SignInButton />, client));
    const button = screen.getByRole('button', { name: '로그인' });

    await user.click(button);

    // 누른 직후에는 버튼이 잠겨 있다
    expect(await screen.findByText('jaehoon')).toBeInTheDocument();
    expect(requestLog.filter((entry) => entry === 'POST /api/auth/login')).toHaveLength(1);
  });
});
