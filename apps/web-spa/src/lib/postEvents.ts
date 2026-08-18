// apps/web-spa/src/lib/postEvents.ts
import type { Post } from '../types/instagram';

// 서버가 먼저 보내오는 소식. 우리가 물어봐서 받은 답이 아니다.
export interface LikeEvent {
  type: 'like';
  postId: number;
  likeCount: number;
  actor: string;
}

export interface CommentEvent {
  type: 'comment';
  postId: number;
  commentCount: number;
  actor: string;
}

export type PostEvent = LikeEvent | CommentEvent;

// 문자열로 온 것을 우리 타입으로 좁힌다. A-2 의 판별 유니온이 여기서 쓰인다.
// 서버가 보낸 것이라도 우리가 아는 모양인지는 확인해야 한다.
export function parsePostEvent(raw: string): PostEvent | null {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }

  if (typeof value !== 'object' || value === null) return null;
  const candidate = value as Record<string, unknown>;

  if (typeof candidate.postId !== 'number') return null;

  if (candidate.type === 'like' && typeof candidate.likeCount === 'number') {
    return {
      type: 'like',
      postId: candidate.postId,
      likeCount: candidate.likeCount,
      actor: typeof candidate.actor === 'string' ? candidate.actor : '',
    };
  }

  if (candidate.type === 'comment' && typeof candidate.commentCount === 'number') {
    return {
      type: 'comment',
      postId: candidate.postId,
      commentCount: candidate.commentCount,
      actor: typeof candidate.actor === 'string' ? candidate.actor : '',
    };
  }

  return null;
}

// 받아둔 피드에 소식을 얹는다. B-2 의 toggleLike 와 같은 결 — 바뀐 것만 새로 만든다.
//
// ⚠️ liked 는 건드리지 않는다. 남이 누른 것이지 내가 누른 게 아니다.
// 숫자는 서버가 세는 것이고, 내 하트가 빨간지는 내 것이다.
export function applyPostEvent(posts: Post[] | undefined, event: PostEvent): Post[] | undefined {
  if (posts === undefined) return posts;

  return posts.map((post) => {
    if (post.id !== event.postId) return post;

    return event.type === 'like'
      ? { ...post, likeCount: event.likeCount }
      : { ...post, commentCount: event.commentCount };
  });
}
