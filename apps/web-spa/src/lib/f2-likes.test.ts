// apps/web-spa/src/lib/f2-likes.test.ts
import { describe, it, expect } from 'vitest';
import { feedPosts } from '../data/feed';
import { toggleLikeInPlace } from './likes';
import type { Post } from '../types/instagram';

// 원본을 건드리면 다음 판이 영향을 받는다. 판마다 새 사본으로 시작한다.
function samplePosts(): Post[] {
  return feedPosts.map((post) => ({ ...post }));
}

describe('toggleLikeInPlace — 없는 번호를 줬을 때', () => {
  it('숫자도 하트도 그대로다', () => {
    const posts = samplePosts();

    const next = toggleLikeInPlace(posts, 999);

    expect(next[0].likeCount).toBe(1240);
    expect(next[0].liked).toBe(false);
  });

  it('있는 번호를 주면 바뀐다 — 없을 때와 갈리는 것을 함께 본다', () => {
    const posts = samplePosts();

    const next = toggleLikeInPlace(posts, 1);

    expect(next[0].likeCount).toBe(1241);
    expect(next[0].liked).toBe(true);
  });

  it('이미 눌린 것을 다시 누르면 숫자가 내려간다', () => {
    const posts = samplePosts();
    toggleLikeInPlace(posts, 1);

    const next = toggleLikeInPlace(posts, 1);

    expect(next[0].likeCount).toBe(1240);
    expect(next[0].liked).toBe(false);
  });
});
