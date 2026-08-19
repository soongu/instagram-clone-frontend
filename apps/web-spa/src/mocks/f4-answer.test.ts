// apps/web-spa/src/mocks/f4-answer.test.ts
// F-4 과제 예시답안 검증 (내부 확인용)
import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from './node';
import { MOCK_API_BASE, failure } from './handlers';
import { ApiError } from '../api/client';
import { likePost } from '../api/posts';
import {
  createComment,
  createCommentHandler,
  receivedCommentBodies,
  likeToggleHandler,
  likeDb,
} from '../../scratch/f4-story-answer';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
beforeEach(() => {
  receivedCommentBodies.length = 0;
  likeDb.reset();
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('과제 1 — 댓글 제출', () => {
  it('서버가 받은 본문에 내가 쓴 글이 들어 있다', async () => {
    server.use(createCommentHandler());

    await createComment(1, '노을 진짜 예쁘네요');

    expect(receivedCommentBodies).toEqual([{ content: '노을 진짜 예쁘네요' }]);
  });

  it('돌려받은 것은 봉투가 벗겨진 댓글 하나다', async () => {
    server.use(createCommentHandler());

    const created = await createComment(1, '노을 진짜 예쁘네요');

    expect(created.content).toBe('노을 진짜 예쁘네요');
    expect(created.postId).toBe(1);
  });

  it('빈 내용이면 거절당하고 서버가 보낸 사유가 손에 들어온다', async () => {
    server.use(createCommentHandler());

    await expect(createComment(1, '   ')).rejects.toThrow(ApiError);
    await expect(createComment(1, '   ')).rejects.toThrow('댓글 내용을 입력해주세요');
  });
});

describe('과제 3 — 좋아요', () => {
  it('누를 때마다 뒤집히고 개수도 따라 움직인다', async () => {
    server.use(likeToggleHandler());

    const first = await likePost(1);
    const second = await likePost(1);

    expect(first).toMatchObject({ liked: true, likeCount: 1241 });
    expect(second).toMatchObject({ liked: false, likeCount: 1240 });
  });

  it('★ 판마다 처음 상태로 돌아온다 — 세는 곳이 핸들러 바깥에 있어서', async () => {
    server.use(likeToggleHandler());

    const first = await likePost(1);

    expect(first).toMatchObject({ liked: true, likeCount: 1241 });
  });

  it('이 판에서만 500 을 말하게 하면 서버가 보낸 사유가 온다', async () => {
    server.use(
      http.post(`${MOCK_API_BASE}/posts/:postId/like`, () =>
        HttpResponse.json(failure('좋아요를 저장하지 못했습니다'), { status: 500 }),
      ),
    );

    await expect(likePost(1)).rejects.toThrow('좋아요를 저장하지 못했습니다');
  });
});
