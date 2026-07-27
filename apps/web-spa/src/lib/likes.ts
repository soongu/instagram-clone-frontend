// apps/web-spa/src/lib/likes.ts
import type { Post } from '../types/instagram';

// 화면이 안 바뀌는 버전 — 원래 있던 객체를 그 자리에서 고친다
export function toggleLikeInPlace(posts: Post[], id: number): Post[] {
  const target = posts.find((post) => post.id === id);

  if (target) {
    target.liked = !target.liked;
    target.likeCount = target.liked ? target.likeCount + 1 : target.likeCount - 1;
  }

  return posts;
}

// 제대로 동작하는 버전 — 바뀐 게시물만 새로 만들고 나머지는 그대로 쓴다
export function toggleLike(posts: Post[], id: number): Post[] {
  return posts.map((post) =>
    post.id === id
      ? {
          ...post,
          liked: !post.liked,
          likeCount: post.liked ? post.likeCount - 1 : post.likeCount + 1,
        }
      : post,
  );
}
