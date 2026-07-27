// apps/web-spa/src/hooks/useLikeToggle.ts
import { useState } from 'react';
import type { Post } from '../types/instagram';
import { toggleLike } from '../lib/likes';

// 피드가 들고 있던 좋아요 상태와 갱신 함수를 통째로 옮겨 이름을 붙인 것이다.
// 옮긴 것은 코드일 뿐, 상태는 여전히 이 훅을 부른 컴포넌트의 것이다.
export function useLikeToggle(initialPosts: Post[]) {
  const [posts, setPosts] = useState(initialPosts);
  const likedCount = posts.filter((post) => post.liked).length;

  function toggle(id: number) {
    setPosts(toggleLike(posts, id));
  }

  return { posts, likedCount, toggle };
}
