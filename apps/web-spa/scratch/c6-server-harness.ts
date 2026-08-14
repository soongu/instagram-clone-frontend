// apps/web-spa/scratch/c6-server-harness.ts
//
// C-6 은 서버를 "바꾸는" 모듈이라 흉내 서버도 기억을 가져야 한다.
// C-5 의 핸들러는 늘 같은 답을 돌려줬다(읽기만 했으니 그걸로 충분했다).
// 여기서는 좋아요를 누르면 실제로 뒤집히고, 다시 물어보면 뒤집힌 값이 온다.
import { http, HttpResponse, delay } from 'msw';
import { API_BASE, ok, failure, requestLog, fakeAuth } from './c5-server-harness';
import { allPosts } from '../src/data/feed';
import type { Comment, Post } from '../src/types/instagram';

// 연습용 서버(apps/api-stub/server.mjs)와 같은 사람
export const ME = 'jaehoon';

const seedComments: Comment[] = [
  { id: 1, postId: 1, username: 'minji', content: '와 여기 어디예요?', createdAt: '2026-07-20T18:40:00' },
  { id: 2, postId: 1, username: 'seungwoo', content: '노을 색이 진짜 좋네요', createdAt: '2026-07-20T18:52:00' },
  { id: 3, postId: 2, username: ME, content: '3박 4일이면 넉넉했나요?', createdAt: '2026-07-19T09:30:00' },
];

// 서버가 들고 있는 것. 테스트마다 reset() 으로 처음 상태로 되돌린다.
export const fakeDb = {
  posts: [] as Post[],
  comments: [] as Comment[],

  // 좋아요 실패를 재현하는 자리. 0 이면 안 실패한다.
  likeFailEvery: 0,
  likeAttempts: 0,

  reset(): void {
    this.posts = allPosts.map((post) => ({ ...post }));
    this.comments = seedComments.map((comment) => ({ ...comment }));
    this.likeFailEvery = 0;
    this.likeAttempts = 0;
  },

  find(id: number): Post | undefined {
    return this.posts.find((post) => post.id === id);
  },
};

fakeDb.reset();

// 기억하는 피드 — 좋아요가 뒤집히면 그 값이 그대로 보인다
export function feedFromDb(delayMs = 0) {
  return http.get(`${API_BASE}/posts`, async ({ request }) => {
    const tag = new URL(request.url).searchParams.get('tag');
    requestLog.push(tag === null ? 'GET /api/posts' : `GET /api/posts?tag=${tag}`);
    if (delayMs > 0) await delay(delayMs);

    const shown =
      tag === null ? fakeDb.posts : fakeDb.posts.filter((post) => post.hashtagNames.includes(tag));

    return HttpResponse.json(ok(shown.map((post) => ({ ...post }))));
  });
}

export function postFromDb(delayMs = 0) {
  return http.get(`${API_BASE}/posts/:postId`, async ({ params }) => {
    requestLog.push(`GET /api/posts/${String(params.postId)}`);
    if (delayMs > 0) await delay(delayMs);

    const found = fakeDb.find(Number(params.postId));
    if (found === undefined) {
      return HttpResponse.json(failure('게시물을 찾을 수 없습니다'), { status: 404 });
    }

    return HttpResponse.json(ok({ ...found }));
  });
}

// 좋아요 — 토큰을 보고, 뒤집고, 뒤집힌 값을 돌려준다.
// 연습용 서버처럼 몇 번에 한 번 실패하게 만들 수 있다.
export function likeToggleHandler(delayMs = 0) {
  return http.post(`${API_BASE}/posts/:postId/like`, async ({ request, params }) => {
    requestLog.push(`POST /api/posts/${String(params.postId)}/like`);
    if (delayMs > 0) await delay(delayMs);

    if (!fakeAuth.accepts(request.headers.get('authorization'))) {
      return HttpResponse.json(failure('액세스 토큰이 만료되었습니다'), { status: 401 });
    }

    const found = fakeDb.find(Number(params.postId));
    if (found === undefined) {
      return HttpResponse.json(failure('게시물을 찾을 수 없습니다'), { status: 404 });
    }

    fakeDb.likeAttempts += 1;
    if (fakeDb.likeFailEvery > 0 && fakeDb.likeAttempts % fakeDb.likeFailEvery === 0) {
      return HttpResponse.json(failure('좋아요를 저장하지 못했습니다'), { status: 500 });
    }

    found.liked = !found.liked;
    found.likeCount += found.liked ? 1 : -1;

    return HttpResponse.json(ok({ id: found.id, liked: found.liked, likeCount: found.likeCount }));
  });
}

export function commentsHandler(delayMs = 0) {
  return http.get(`${API_BASE}/posts/:postId/comments`, async ({ params }) => {
    requestLog.push(`GET /api/posts/${String(params.postId)}/comments`);
    if (delayMs > 0) await delay(delayMs);

    const postId = Number(params.postId);

    return HttpResponse.json(
      ok(fakeDb.comments.filter((comment) => comment.postId === postId).map((it) => ({ ...it }))),
    );
  });
}

// 삭제 — 남의 댓글이면 403 이다. 화면을 되돌려야 하는 자리.
export function deleteCommentHandler(delayMs = 0) {
  return http.delete(`${API_BASE}/comments/:commentId`, async ({ request, params }) => {
    requestLog.push(`DELETE /api/comments/${String(params.commentId)}`);
    if (delayMs > 0) await delay(delayMs);

    if (!fakeAuth.accepts(request.headers.get('authorization'))) {
      return HttpResponse.json(failure('로그인이 필요합니다'), { status: 401 });
    }

    const id = Number(params.commentId);
    const index = fakeDb.comments.findIndex((comment) => comment.id === id);

    if (index === -1) {
      return HttpResponse.json(failure('댓글을 찾을 수 없습니다'), { status: 404 });
    }

    if (fakeDb.comments[index].username !== ME) {
      return HttpResponse.json(failure('내가 쓴 댓글만 지울 수 있습니다'), { status: 403 });
    }

    const [removed] = fakeDb.comments.splice(index, 1);

    return HttpResponse.json(ok({ id: removed.id }));
  });
}

// C-6 판이 기본으로 쓰는 한 벌. server.use(...) 로 덮어 쓴다.
export function c6Handlers(delayMs = 0) {
  return [
    feedFromDb(delayMs),
    postFromDb(delayMs),
    likeToggleHandler(delayMs),
    commentsHandler(delayMs),
    deleteCommentHandler(delayMs),
  ];
}
