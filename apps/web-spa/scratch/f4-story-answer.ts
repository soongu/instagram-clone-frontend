// apps/web-spa/scratch/f4-story-answer.ts
// F-4 과제 1·3 예시답안 — 학생이 src 에 쓸 코드를 여기서 검증한다.
import { http, HttpResponse } from 'msw';
import type { Comment, Post } from '../src/types/instagram';
import { api } from '../src/api/client';
import { MOCK_API_BASE, ok, failure } from '../src/mocks/handlers';
import { allPosts } from '../src/data/feed';

// ── 과제 1: src/api/comments.ts 에 더할 함수
export async function createComment(postId: number, content: string): Promise<Comment> {
  const response = await api.post<Comment>(`/posts/${postId}/comments`, { content });

  return response.data;
}

// ── 과제 1: src/mocks/handlers.ts 에 더할 핸들러
export const receivedCommentBodies: unknown[] = [];

export function createCommentHandler() {
  return http.post(`${MOCK_API_BASE}/posts/:postId/comments`, async ({ request, params }) => {
    const body = (await request.json()) as { content?: string };
    receivedCommentBodies.push(body);

    const content = typeof body.content === 'string' ? body.content.trim() : '';
    if (content === '') {
      return HttpResponse.json(failure('댓글 내용을 입력해주세요'), { status: 400 });
    }

    const created: Comment = {
      id: 100,
      postId: Number(params.postId),
      username: 'jaehoon',
      content,
      createdAt: '2026-08-20T10:00:00',
    };

    return HttpResponse.json(ok(created), { status: 201 });
  });
}

// ── 과제 3: 좋아요 핸들러
//
// ⚠️ 실패 규칙을 핸들러 안에 고정하면 판마다 몇 번째인지를 세야 한다.
// 그래서 세는 곳을 바깥에 두고 판이 reset() 으로 처음 상태를 만든다.
export const likeDb = {
  posts: [] as Post[],

  reset(): void {
    this.posts = allPosts.map((post) => ({ ...post }));
  },

  find(id: number): Post | undefined {
    return this.posts.find((post) => post.id === id);
  },
};

likeDb.reset();

export function likeToggleHandler() {
  return http.post(`${MOCK_API_BASE}/posts/:postId/like`, ({ params }) => {
    const found = likeDb.find(Number(params.postId));

    if (found === undefined) {
      return HttpResponse.json(failure('게시물을 찾을 수 없습니다'), { status: 404 });
    }

    found.liked = !found.liked;
    found.likeCount += found.liked ? 1 : -1;

    return HttpResponse.json(ok({ id: found.id, liked: found.liked, likeCount: found.likeCount }));
  });
}
