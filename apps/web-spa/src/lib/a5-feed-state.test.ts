// apps/web-spa/src/lib/a5-feed-state.test.ts
import { describe, it, expect } from 'vitest';
import { feedReducer, createFeedState } from './feed-state';
import { feedPosts } from '../data/feed';

describe('feedReducer — 게시물과 알림이 한 상태로 함께 움직인다', () => {
  it('처음 상태는 넘겨받은 게시물과 알림 없음', () => {
    const state = createFeedState(feedPosts);

    expect(state.posts).toEqual(feedPosts);
    expect(state.toast).toBeNull();
  });

  it('toggleLike 는 게시물과 알림을 한 번에 바꾼다', () => {
    const after = feedReducer(createFeedState(feedPosts), { type: 'toggleLike', id: 1 });

    expect(after.posts[0].liked).toBe(true);
    expect(after.posts[0].likeCount).toBe(1241);
    expect(after.toast).toEqual({ message: 'jaehoon님의 게시물을 좋아합니다' });
  });

  it('이미 좋아요를 누른 게시물이면 취소 문구가 뜬다', () => {
    const after = feedReducer(createFeedState(feedPosts), { type: 'toggleLike', id: 2 });

    expect(after.posts[1].liked).toBe(false);
    expect(after.toast).toEqual({ message: 'minji님의 게시물 좋아요를 취소했습니다' });
  });

  it('reachBottom 은 지금 좋아요 개수를 세어 알린다', () => {
    const start = createFeedState(feedPosts);

    // 처음 피드에는 minji 것 하나가 이미 좋아요 상태다
    expect(feedReducer(start, { type: 'reachBottom' }).toast).toEqual({
      message: '게시물을 모두 확인했습니다 · 좋아요 1개',
    });

    const liked = feedReducer(start, { type: 'toggleLike', id: 1 });
    expect(feedReducer(liked, { type: 'reachBottom' }).toast).toEqual({
      message: '게시물을 모두 확인했습니다 · 좋아요 2개',
    });
  });

  it('dismissToast 는 알림만 치우고 게시물은 그대로 둔다', () => {
    const shown = feedReducer(createFeedState(feedPosts), { type: 'toggleLike', id: 1 });
    const after = feedReducer(shown, { type: 'dismissToast' });

    expect(after.toast).toBeNull();
    expect(after.posts).toBe(shown.posts);
  });

  it('문구가 똑같아도 알림은 매번 새 객체다 — 이것이 타이머를 다시 걸리게 한다', () => {
    const start = createFeedState(feedPosts);
    const first = feedReducer(start, { type: 'reachBottom' });
    const second = feedReducer(first, { type: 'reachBottom' });

    expect(second.toast).toEqual(first.toast);
    expect(second.toast).not.toBe(first.toast);
  });

  it('원래 상태를 그 자리에서 고치지 않는다', () => {
    const start = createFeedState(feedPosts);
    const snapshot = structuredClone(start);

    feedReducer(start, { type: 'toggleLike', id: 1 });
    feedReducer(start, { type: 'reachBottom' });

    expect(start).toEqual(snapshot);
    expect(feedPosts[0].liked).toBe(false);
  });
});
