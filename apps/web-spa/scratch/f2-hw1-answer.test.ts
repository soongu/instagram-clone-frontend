// F-2 과제 1 예시답안 보관 — 저장소 본판에는 두지 않는다.
import { describe, it, expect } from 'vitest';
import { createFeedState, feedReducer } from '../src/lib/feed-state';
import { feedPosts } from '../src/data/feed';
import type { Post } from '../src/types/instagram';

function samplePosts(): Post[] {
  return feedPosts.map((post) => ({ ...post }));
}

describe('feedReducer — 없는 번호로 좋아요를 누르면', () => {
  it('상태가 그대로 나온다', () => {
    const state = createFeedState(samplePosts());

    const next = feedReducer(state, { type: 'toggleLike', id: 999 });

    expect(next).toBe(state);
  });

  it('알림도 안 생긴다', () => {
    const state = createFeedState(samplePosts());

    const next = feedReducer(state, { type: 'toggleLike', id: 999 });

    expect(next.toast).toBeNull();
  });
});
