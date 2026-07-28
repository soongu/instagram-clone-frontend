// apps/web-spa/src/hooks/a5-use-feed.test.tsx
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useFeed } from './useFeed';
import { feedPosts } from '../data/feed';

describe('useFeed — 리듀서를 훅으로 감싸 이름을 붙인다', () => {
  it('넘긴 게시물과 좋아요 개수를 돌려주고, 알림은 처음엔 없다', () => {
    const { result } = renderHook(() => useFeed(feedPosts));

    expect(result.current.posts).toBe(feedPosts);
    expect(result.current.likedCount).toBe(1);
    expect(result.current.toast).toBeNull();
  });

  it('toggleLike 는 게시물과 알림을 함께 바꾼다', () => {
    const { result } = renderHook(() => useFeed(feedPosts));

    act(() => result.current.toggleLike(1));

    expect(result.current.posts[0].liked).toBe(true);
    expect(result.current.likedCount).toBe(2);
    expect(result.current.toast?.message).toBe('jaehoon님의 게시물을 좋아합니다');
  });

  it('dismissToast 는 알림만 치운다', () => {
    const { result } = renderHook(() => useFeed(feedPosts));

    act(() => result.current.toggleLike(1));
    act(() => result.current.dismissToast());

    expect(result.current.toast).toBeNull();
    expect(result.current.likedCount).toBe(2);
  });

  it('훅을 두 번 부르면 상태도 둘이다 — 훅은 로직을 나누지 상태를 나누지 않는다', () => {
    const { result } = renderHook(() => ({
      left: useFeed(feedPosts),
      right: useFeed(feedPosts),
    }));

    act(() => result.current.left.toggleLike(1));

    expect(result.current.left.likedCount).toBe(2);
    expect(result.current.right.likedCount).toBe(1);
  });

  it('reachBottom 을 연달아 불러도 알림은 매번 새 객체다', () => {
    const { result } = renderHook(() => useFeed(feedPosts));

    act(() => result.current.reachBottom());
    const first = result.current.toast;

    act(() => result.current.reachBottom());
    const second = result.current.toast;

    expect(second).toEqual(first);
    expect(second).not.toBe(first);
  });

  it('원본 배열을 건드리지 않는다', () => {
    const { result } = renderHook(() => useFeed(feedPosts));

    act(() => result.current.toggleLike(1));

    expect(feedPosts[0].liked).toBe(false);
    expect(feedPosts[0].likeCount).toBe(1240);
  });
});
