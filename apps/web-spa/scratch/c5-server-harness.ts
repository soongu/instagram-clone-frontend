// apps/web-spa/scratch/c5-server-harness.ts
//
// 테스트가 진짜 네트워크를 쓰지 않게 :8090 응답을 흉내 내는 장치.
// 연습용 서버(apps/api-stub/server.mjs)와 같은 봉투·같은 주소를 말한다.

import { http, HttpResponse, delay } from 'msw';
import { setupServer } from 'msw/node';
import type { Post } from '../src/types/instagram';
import { allPosts } from '../src/data/feed';

export const API_BASE = 'http://localhost:8090/api';

interface Envelope<T> {
  success: boolean;
  data: T | null;
  message: string | null;
}

export function ok<T>(data: T): Envelope<T> {
  return { success: true, data, message: null };
}

export function failure(message: string): Envelope<never> {
  return { success: false, data: null, message };
}

// 요청이 몇 번 갔는지 세는 자리. 이중 실행·캐시 확인에 쓴다.
export const requestLog: string[] = [];

export function resetRequestLog(): void {
  requestLog.length = 0;
}

export function feedHandler(posts: Post[] = allPosts, delayMs = 0) {
  return http.get(`${API_BASE}/posts`, async () => {
    requestLog.push('GET /api/posts');
    if (delayMs > 0) await delay(delayMs);
    return HttpResponse.json(ok(posts));
  });
}

export function postHandler(posts: Post[] = allPosts, delayMs = 0) {
  return http.get(`${API_BASE}/posts/:postId`, async ({ params }) => {
    requestLog.push(`GET /api/posts/${String(params.postId)}`);
    if (delayMs > 0) await delay(delayMs);
    const found = posts.find((post) => post.id === Number(params.postId));
    if (found === undefined) {
      return HttpResponse.json(failure('게시물을 찾을 수 없습니다'), { status: 404 });
    }
    return HttpResponse.json(ok(found));
  });
}

// ── 인증 흉내 (Step 4)
//
// 연습용 서버는 액세스 토큰을 세 번 쓰면 만료시킨다. 테스트에서는 그 시점을
// 우리가 정할 수 있어야 하므로 "지금 살아 있는 토큰" 을 손으로 들고 있는다.
export const fakeAuth = {
  liveAccessTokens: new Set<string>(),
  issuedCount: 0,
  refreshCount: 0,
  refreshShouldFail: false,

  reset(): void {
    this.liveAccessTokens.clear();
    this.issuedCount = 0;
    this.refreshCount = 0;
    this.refreshShouldFail = false;
  },

  issueAccess(): string {
    this.issuedCount += 1;
    const token = `access-${this.issuedCount}`;
    this.liveAccessTokens.add(token);
    return token;
  },

  expireAll(): void {
    this.liveAccessTokens.clear();
  },

  accepts(header: string | null): boolean {
    if (header === null || !header.startsWith('Bearer ')) return false;
    return this.liveAccessTokens.has(header.slice('Bearer '.length));
  },
};

export const REFRESH_TOKEN = 'refresh-1';

export function authHandlers() {
  return [
    http.post(`${API_BASE}/auth/login`, async () => {
      requestLog.push('POST /api/auth/login');
      return HttpResponse.json(
        ok({
          accessToken: fakeAuth.issueAccess(),
          refreshToken: REFRESH_TOKEN,
          user: { id: 1, username: 'jaehoon', profileImageUrl: 'https://picsum.photos/seed/jaehoon/64/64' },
        }),
      );
    }),

    http.post(`${API_BASE}/auth/refresh`, async ({ request }) => {
      requestLog.push('POST /api/auth/refresh');
      fakeAuth.refreshCount += 1;

      if (fakeAuth.refreshShouldFail) {
        return HttpResponse.json(failure('리프레시 토큰이 유효하지 않습니다'), { status: 401 });
      }

      const body = (await request.json()) as { refreshToken?: string };
      if (body.refreshToken !== REFRESH_TOKEN) {
        return HttpResponse.json(failure('리프레시 토큰이 유효하지 않습니다'), { status: 401 });
      }

      return HttpResponse.json(ok({ accessToken: fakeAuth.issueAccess() }));
    }),
  ];
}

// 토큰이 있어야 되는 요청. 좋아요는 C-6 의 주제지만, 401 갱신을 재려면
// 인증이 필요한 자리가 하나 있어야 한다.
export function likeHandler() {
  return http.post(`${API_BASE}/posts/:postId/like`, ({ request, params }) => {
    requestLog.push(`POST /api/posts/${String(params.postId)}/like`);

    if (!fakeAuth.accepts(request.headers.get('authorization'))) {
      return HttpResponse.json(failure('액세스 토큰이 만료되었습니다'), { status: 401 });
    }

    return HttpResponse.json(ok({ id: Number(params.postId), liked: true, likeCount: 1241 }));
  });
}

// 요청에 실려 온 Authorization 헤더를 그대로 되돌려주는 자리 — 헤더 부착 확인용
export const seenAuthHeaders: (string | null)[] = [];

export function echoAuthHandler() {
  return http.get(`${API_BASE}/whoami`, ({ request }) => {
    seenAuthHeaders.push(request.headers.get('authorization'));
    return HttpResponse.json(ok({ authorization: request.headers.get('authorization') }));
  });
}

export const server = setupServer(
  feedHandler(),
  postHandler(),
  ...authHandlers(),
  likeHandler(),
  echoAuthHandler(),
);
