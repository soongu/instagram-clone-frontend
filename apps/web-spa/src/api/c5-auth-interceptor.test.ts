// apps/web-spa/src/api/c5-auth-interceptor.test.ts
// C-5 Step 4 — 토큰을 붙이는 일과 만료를 갱신하는 일 (내부 검증용)
import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import { api, ApiError } from './client';
import { login, logout } from './auth';
import { tokenStore } from '../lib/tokens';
import {
  server,
  fakeAuth,
  REFRESH_TOKEN,
  requestLog,
  resetRequestLog,
  seenAuthHeaders,
} from '../../scratch/c5-server-harness';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
beforeEach(() => {
  fakeAuth.reset();
  resetRequestLog();
  seenAuthHeaders.length = 0;
  window.localStorage.clear();
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('보내는 쪽 — 토큰은 인터셉터가 붙인다', () => {
  it('토큰이 없으면 헤더도 없다', async () => {
    await api.get('/whoami');

    expect(seenAuthHeaders).toEqual([null]);
  });

  it('로그인한 뒤에는 모든 요청에 Bearer 가 붙는다', async () => {
    await login('jaehoon');

    await api.get('/whoami');
    await api.get('/posts');
    await api.get('/whoami');

    expect(seenAuthHeaders).toEqual(['Bearer access-1', 'Bearer access-1']);
  });

  it('로그아웃하면 다시 안 붙는다', async () => {
    await login('jaehoon');
    logout();

    await api.get('/whoami');

    expect(seenAuthHeaders).toEqual([null]);
    expect(tokenStore.access()).toBeNull();
    expect(tokenStore.refresh()).toBeNull();
  });

  it('로그인이 토큰 두 개를 저장해 둔다', async () => {
    const user = await login('jaehoon');

    expect(user.username).toBe('jaehoon');
    expect(tokenStore.access()).toBe('access-1');
    expect(tokenStore.refresh()).toBe(REFRESH_TOKEN);
  });
});

describe('받는 쪽 — 401 이면 갱신하고 다시 보낸다', () => {
  it('부르는 쪽은 실패한 줄도 모른다', async () => {
    await login('jaehoon');
    fakeAuth.expireAll();

    const response = await api.post('/posts/1/like');

    expect(response.data).toEqual({ id: 1, liked: true, likeCount: 1241 });
  });

  it('한 번의 좋아요에 요청이 세 번 나간다 — 실패·갱신·재시도', async () => {
    await login('jaehoon');
    fakeAuth.expireAll();
    resetRequestLog();

    await api.post('/posts/1/like');

    expect(requestLog).toEqual([
      'POST /api/posts/1/like',
      'POST /api/auth/refresh',
      'POST /api/posts/1/like',
    ]);
  });

  it('갱신된 토큰이 저장돼서 다음 요청부터는 그것이 붙는다', async () => {
    await login('jaehoon');
    fakeAuth.expireAll();

    await api.post('/posts/1/like');
    seenAuthHeaders.length = 0;
    await api.get('/whoami');

    expect(tokenStore.access()).toBe('access-2');
    expect(seenAuthHeaders).toEqual(['Bearer access-2']);
  });

  it('★ 동시에 다섯 개가 만료를 만나도 갱신은 한 번뿐이다', async () => {
    await login('jaehoon');
    fakeAuth.expireAll();

    await Promise.all([
      api.post('/posts/1/like'),
      api.post('/posts/2/like'),
      api.post('/posts/3/like'),
      api.post('/posts/4/like'),
      api.post('/posts/5/like'),
    ]);

    expect(fakeAuth.refreshCount).toBe(1);
    expect(requestLog.filter((line) => line.includes('refresh'))).toHaveLength(1);
  });

  it('갱신이 끝난 뒤 또 만료되면 그때 다시 한 번 갱신한다', async () => {
    await login('jaehoon');

    fakeAuth.expireAll();
    await api.post('/posts/1/like');

    fakeAuth.expireAll();
    await api.post('/posts/2/like');

    expect(fakeAuth.refreshCount).toBe(2);
  });
});

describe('갱신도 실패하면 거기서 멈춘다', () => {
  it('리프레시 토큰이 거절당하면 다시 로그인하라고 말한다', async () => {
    await login('jaehoon');
    fakeAuth.expireAll();
    fakeAuth.refreshShouldFail = true;

    const thrown = await api.post('/posts/1/like').catch((error: unknown) => error);

    expect(thrown).toBeInstanceOf(ApiError);
    expect((thrown as ApiError).message).toBe('다시 로그인해주세요');
    expect((thrown as ApiError).status).toBe(401);
  });

  it('그때 저장해 둔 토큰을 지운다', async () => {
    await login('jaehoon');
    fakeAuth.expireAll();
    fakeAuth.refreshShouldFail = true;

    await api.post('/posts/1/like').catch(() => undefined);

    expect(tokenStore.access()).toBeNull();
    expect(tokenStore.refresh()).toBeNull();
  });

  it('★ 갱신했는데도 또 401 이면 두 번은 안 보낸다 — 무한 루프 방지', async () => {
    await login('jaehoon');
    // 갱신은 성공하지만 발급된 토큰이 곧바로 죽는 상황
    fakeAuth.expireAll();
    const originalIssue = fakeAuth.issueAccess.bind(fakeAuth);
    fakeAuth.issueAccess = () => {
      const token = originalIssue();
      fakeAuth.liveAccessTokens.delete(token);
      return token;
    };
    resetRequestLog();

    const thrown = await api.post('/posts/1/like').catch((error: unknown) => error);

    expect(thrown).toBeInstanceOf(ApiError);
    expect((thrown as ApiError).status).toBe(401);
    expect(requestLog.filter((line) => line.includes('/like'))).toHaveLength(2);
    expect(requestLog.filter((line) => line.includes('refresh'))).toHaveLength(1);

    fakeAuth.issueAccess = originalIssue;
  });

  it('로그인한 적이 없으면 갱신을 시도하지도 않는다', async () => {
    const thrown = await api.post('/posts/1/like').catch((error: unknown) => error);

    expect(thrown).toBeInstanceOf(ApiError);
    expect((thrown as ApiError).message).toBe('다시 로그인해주세요');
    expect(fakeAuth.refreshCount).toBe(0);
  });
});

describe('화면에는 Authorization 을 적는 곳이 없다', () => {
  it('HomePage·posts.ts 어디에도 토큰 이야기가 없다', async () => {
    const home = await import('../routes/HomePage.tsx?raw');
    const posts = await import('./posts.ts?raw');
    const query = await import('../queries/posts.ts?raw');

    for (const source of [home.default, posts.default, query.default]) {
      expect(source).not.toMatch(/Authorization|Bearer|token/i);
    }
  });
});
