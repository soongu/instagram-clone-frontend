// apps/web-spa/src/hooks/useFeed.ts
import { useReducer } from 'react';
import type { Post } from '../types/instagram';
import { createFeedState, feedReducer } from '../lib/feed-state';

// 리듀서를 그대로 쓰면 화면 쪽에 dispatch 와 액션 객체가 흩어진다.
// 훅으로 한 겹 감싸 "이 피드가 할 수 있는 일" 에 이름을 붙여둔다.
export function useFeed(initialPosts: Post[]) {
  const [state, dispatch] = useReducer(feedReducer, createFeedState(initialPosts));
  const likedCount = state.posts.filter((post) => post.liked).length;

  return {
    posts: state.posts,
    toast: state.toast,
    likedCount,
    toggleLike: (id: number) => dispatch({ type: 'toggleLike', id }),
    reachBottom: () => dispatch({ type: 'reachBottom' }),
    dismissToast: () => dispatch({ type: 'dismissToast' }),
  };
}
