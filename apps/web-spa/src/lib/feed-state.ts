// apps/web-spa/src/lib/feed-state.ts
import type { Post } from '../types/instagram';
import { toggleLike } from './likes';
import { findById } from './collections';

// 알림을 문자열이 아니라 객체로 들고 있는다.
// 문구가 같아도 새로 만들면 다른 값이 되기 때문이다.
export interface FeedToast {
  message: string;
}

// 좋아요를 누르면 게시물과 알림이 늘 함께 바뀐다 — 그래서 한 덩어리로 둔다
export interface FeedState {
  posts: Post[];
  toast: FeedToast | null;
}

// 피드에서 일어날 수 있는 일 전부. type 하나로 갈라지는 판별 유니온이다
export type FeedAction =
  | { type: 'toggleLike'; id: number }
  | { type: 'reachBottom' }
  | { type: 'dismissToast' };

export function createFeedState(posts: Post[]): FeedState {
  return { posts, toast: null };
}

function countLiked(posts: Post[]): number {
  return posts.filter((post) => post.liked).length;
}

export function feedReducer(state: FeedState, action: FeedAction): FeedState {
  switch (action.type) {
    case 'toggleLike': {
      const target = findById(state.posts, action.id);

      if (!target) {
        return state;
      }

      return {
        posts: toggleLike(state.posts, action.id),
        toast: {
          message: target.liked
            ? `${target.username}님의 게시물 좋아요를 취소했습니다`
            : `${target.username}님의 게시물을 좋아합니다`,
        },
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
      // 위에서 빠뜨린 일이 있으면 이 줄에서 잡힌다
      const missed: never = action;
      return missed;
    }
  }
}
