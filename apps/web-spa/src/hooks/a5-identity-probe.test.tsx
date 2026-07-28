// apps/web-spa/src/hooks/a5-identity-probe.test.tsx
// 교안이 "알림이 새 객체라서 타이머가 다시 걸린다" 고 말하려면,
// 정말 그 이유인지(다른 값이 바뀐 게 아닌지) 갈라서 확인해야 한다.
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useFeed } from './useFeed';
import { feedPosts } from '../data/feed';

describe('무엇이 바뀌어서 effect 가 다시 도는가', () => {
  it('dispatch 를 감싼 함수들은 렌더가 다시 돌아도 같은 함수다', () => {
    const { result, rerender } = renderHook(() => useFeed(feedPosts));

    const first = result.current.dismissToast;
    rerender();
    const afterRerender = result.current.dismissToast;

    // 상태가 안 바뀐 리렌더에서는 같은 함수여야 한다
    expect(afterRerender).toBe(first);
  });

  it('상태가 바뀌어도 dismissToast 는 같은 함수다 — 바뀌는 것은 toast 뿐이다', () => {
    const { result } = renderHook(() => useFeed(feedPosts));

    const beforeFn = result.current.dismissToast;
    const beforeToast = result.current.toast;

    act(() => result.current.reachBottom());

    expect(result.current.dismissToast).toBe(beforeFn);
    expect(result.current.toast).not.toBe(beforeToast);
  });

  it('그래서 같은 문구를 두 번 띄우면 toast 만 새 객체로 바뀐다', () => {
    const { result } = renderHook(() => useFeed(feedPosts));

    act(() => result.current.reachBottom());
    const firstToast = result.current.toast;
    const firstFn = result.current.dismissToast;

    act(() => result.current.reachBottom());

    expect(result.current.toast).toEqual(firstToast);
    expect(result.current.toast).not.toBe(firstToast);
    expect(result.current.dismissToast).toBe(firstFn);
  });
});
