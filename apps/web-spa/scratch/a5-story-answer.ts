// apps/web-spa/scratch/a5-story-answer.ts
// A-5 과제 1 예시답안 채증 — 좋아요 되돌리기를 리듀서에 더한 판.
// 실제 파일(src/lib/feed-state.ts)을 건드리지 않고 여기서만 확장해 검증한다.
import type { Post } from '../src/types/instagram';
import type { FeedToast } from '../src/lib/feed-state';
import { toggleLike } from '../src/lib/likes';

// 되돌릴 대상이 없을 수도 있으니 number 하나로는 모자란다
export interface FeedStateV2 {
  posts: Post[];
  toast: FeedToast | null;
  lastLikedId: number | null;
}

export type FeedActionV2 =
  | { type: 'toggleLike'; id: number }
  | { type: 'reachBottom' }
  | { type: 'dismissToast' }
  | { type: 'undoLike' };

export function createFeedStateV2(posts: Post[]): FeedStateV2 {
  return { posts, toast: null, lastLikedId: null };
}

function countLiked(posts: Post[]): number {
  return posts.filter((post) => post.liked).length;
}

function likeMessage(post: Post): string {
  return post.liked
    ? `${post.username}님의 게시물 좋아요를 취소했습니다`
    : `${post.username}님의 게시물을 좋아합니다`;
}

export function feedReducerV2(state: FeedStateV2, action: FeedActionV2): FeedStateV2 {
  switch (action.type) {
    case 'toggleLike': {
      const target = state.posts.find((post) => post.id === action.id);

      if (!target) {
        return state;
      }

      return {
        posts: toggleLike(state.posts, action.id),
        toast: { message: likeMessage(target) },
        // 방금 건드린 게시물을 기억해둔다
        lastLikedId: action.id,
      };
    }

    case 'undoLike': {
      if (state.lastLikedId === null) {
        return state;
      }

      return {
        posts: toggleLike(state.posts, state.lastLikedId),
        toast: { message: '되돌렸습니다' },
        // 한 번 되돌리면 되돌릴 것이 없어진다
        lastLikedId: null,
      };
    }

    case 'reachBottom':
      return {
        ...state,
        toast: { message: `게시물을 모두 확인했습니다 · 좋아요 ${countLiked(state.posts)}개` },
      };

    case 'dismissToast':
      return { ...state, toast: null };

    default: {
      const missed: never = action;
      return missed;
    }
  }
}
