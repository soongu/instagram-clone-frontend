// apps/web-spa/src/lib/f2-likes.test.ts
import { describe, it, expect } from 'vitest';
import { feedPosts } from '../data/feed';
import { toggleLike, toggleLikeInPlace } from './likes';
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

// 없는 번호는 "아무 일도 안 일어나는" 자리다. 그런데 두 함수가 서로 다르게
// 아무 일도 안 한다 — 하나는 있던 배열을 그대로 주고 하나는 새로 만든다.
describe('없는 번호에서 두 함수가 갈리는 곳', () => {
  it('toggleLikeInPlace 는 받은 배열을 그대로 돌려준다', () => {
    const posts = samplePosts();

    const next = toggleLikeInPlace(posts, 999);

    expect(next).toBe(posts);
  });

  it('toggleLike 는 내용이 같은 새 배열을 만든다', () => {
    const posts = samplePosts();

    const next = toggleLike(posts, 999);

    // 내용은 같다
    expect(next).toEqual(posts);
    // 그런데 같은 배열은 아니다
    expect(next).not.toBe(posts);
  });

  it('안에 든 게시물은 두 함수 모두 그대로 쓴다', () => {
    const posts = samplePosts();

    expect(toggleLike(posts, 999)[0]).toBe(posts[0]);
    expect(toggleLikeInPlace(posts, 999)[0]).toBe(posts[0]);
  });
});
