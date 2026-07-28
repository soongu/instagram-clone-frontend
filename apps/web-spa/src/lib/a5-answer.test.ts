// apps/web-spa/src/lib/a5-answer.test.ts
import { describe, it, expect } from 'vitest';
import { feedReducerV2, createFeedStateV2 } from '../../scratch/a5-story-answer';
import { feedPosts } from '../data/feed';

describe('과제 1 — 좋아요 되돌리기', () => {
  it('처음에는 되돌릴 것이 없다', () => {
    expect(createFeedStateV2(feedPosts).lastLikedId).toBeNull();
  });

  it('좋아요를 누르면 그 게시물을 기억해둔다', () => {
    const after = feedReducerV2(createFeedStateV2(feedPosts), { type: 'toggleLike', id: 1 });

    expect(after.lastLikedId).toBe(1);
    expect(after.posts[0].liked).toBe(true);
  });

  it('되돌리면 좋아요와 개수가 원래대로 돌아온다', () => {
    const start = createFeedStateV2(feedPosts);
    const liked = feedReducerV2(start, { type: 'toggleLike', id: 1 });
    const undone = feedReducerV2(liked, { type: 'undoLike' });

    expect(undone.posts[0].liked).toBe(false);
    expect(undone.posts[0].likeCount).toBe(start.posts[0].likeCount);
    expect(undone.toast).toEqual({ message: '되돌렸습니다' });
  });

  it('한 번 되돌리면 되돌릴 것이 없어진다', () => {
    const liked = feedReducerV2(createFeedStateV2(feedPosts), { type: 'toggleLike', id: 1 });
    const undone = feedReducerV2(liked, { type: 'undoLike' });

    expect(undone.lastLikedId).toBeNull();

    // 두 번째 되돌리기는 아무 일도 하지 않는다
    expect(feedReducerV2(undone, { type: 'undoLike' })).toBe(undone);
  });

  it('되돌릴 것이 없을 때 되돌리라고 하면 상태가 그대로다', () => {
    const start = createFeedStateV2(feedPosts);

    expect(feedReducerV2(start, { type: 'undoLike' })).toBe(start);
  });

  it('취소한 좋아요도 되돌릴 수 있다 — minji 것은 처음부터 눌려 있다', () => {
    const start = createFeedStateV2(feedPosts);
    const unliked = feedReducerV2(start, { type: 'toggleLike', id: 2 });

    expect(unliked.posts[1].liked).toBe(false);
    expect(unliked.toast).toEqual({ message: 'minji님의 게시물 좋아요를 취소했습니다' });

    const undone = feedReducerV2(unliked, { type: 'undoLike' });
    expect(undone.posts[1].liked).toBe(true);
  });

  it('피드 끝에 닿아도 되돌릴 대상은 그대로 남는다', () => {
    const liked = feedReducerV2(createFeedStateV2(feedPosts), { type: 'toggleLike', id: 1 });
    const scrolled = feedReducerV2(liked, { type: 'reachBottom' });

    expect(scrolled.lastLikedId).toBe(1);
    expect(scrolled.toast).toEqual({ message: '게시물을 모두 확인했습니다 · 좋아요 2개' });
  });

  it('원본 배열을 건드리지 않는다', () => {
    const start = createFeedStateV2(feedPosts);
    const liked = feedReducerV2(start, { type: 'toggleLike', id: 1 });
    feedReducerV2(liked, { type: 'undoLike' });

    expect(feedPosts[0].liked).toBe(false);
    expect(feedPosts[0].likeCount).toBe(1240);
  });
});
