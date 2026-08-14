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

export const server = setupServer(feedHandler(), postHandler());
