// apps/web-spa/src/hooks/b4-use-effect-event.test.tsx
// 콜백을 의존성에 넣었을 때와 useEffectEvent 로 뺐을 때, 구독이 몇 번 다시 맺어지는지 잰다.
import { useState } from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useScrollRestore } from './useScrollRestore';
import { useScrollRestoreBefore } from '../../scratch/b4-scroll-restore-before';

// jsdom 은 실제로 스크롤되지 않으니 위치와 문서 높이를 직접 세팅한다
function setLayout({ scrollY, innerHeight, scrollHeight }: {
  scrollY: number;
  innerHeight: number;
  scrollHeight: number;
}) {
  Object.defineProperty(window, 'scrollY', { value: scrollY, writable: true, configurable: true });
  Object.defineProperty(window, 'innerHeight', { value: innerHeight, writable: true, configurable: true });
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    value: scrollHeight,
    writable: true,
    configurable: true,
  });
}

const reached: number[] = [];

// 고치기 전 — 콜백과 값이 의존성에 들어간다
function BeforeScreen() {
  const [likedCount, setLikedCount] = useState(0);

  useScrollRestoreBefore(() => reached.push(likedCount));

  return <button onClick={() => setLikedCount(likedCount + 1)}>좋아요 {likedCount}</button>;
}

// 고친 뒤 — 콜백을 useEffectEvent 로 빼서 의존성이 비어 있다
function AfterScreen() {
  const [likedCount, setLikedCount] = useState(0);

  useScrollRestore(() => reached.push(likedCount));

  return <button onClick={() => setLikedCount(likedCount + 1)}>좋아요 {likedCount}</button>;
}

describe('구독을 다시 맺는 횟수', () => {
  let addSpy: ReturnType<typeof vi.spyOn>;
  let removeSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    sessionStorage.clear();
    reached.length = 0;
    setLayout({ scrollY: 0, innerHeight: 800, scrollHeight: 2000 });
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    addSpy = vi.spyOn(window, 'addEventListener');
    removeSpy = vi.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function scrollCalls(spy: { mock: { calls: unknown[][] } }) {
    return spy.mock.calls.filter((call) => call[0] === 'scroll').length;
  }

  function counts() {
    return {
      붙임: scrollCalls(addSpy),
      뗌: scrollCalls(removeSpy),
    };
  }

  function clickThreeTimes() {
    for (let i = 0; i < 3; i += 1) {
      act(() => {
        screen.getByRole('button').click();
      });
    }
  }

  it('고치기 전 — 좋아요를 누를 때마다 구독을 끊고 다시 맺는다', () => {
    render(<BeforeScreen />);
    expect(counts()).toEqual({ 붙임: 1, 뗌: 0 });

    clickThreeTimes();

    expect(counts()).toEqual({ 붙임: 4, 뗌: 3 });
  });

  it('고친 뒤 — 몇 번을 눌러도 처음 맺은 구독 하나로 간다', () => {
    render(<AfterScreen />);
    expect(counts()).toEqual({ 붙임: 1, 뗌: 0 });

    clickThreeTimes();

    expect(counts()).toEqual({ 붙임: 1, 뗌: 0 });
  });
});

describe('구독을 다시 맺지 않아도 최신 값이 보인다', () => {
  beforeEach(() => {
    sessionStorage.clear();
    reached.length = 0;
    setLayout({ scrollY: 0, innerHeight: 800, scrollHeight: 2000 });
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function scrollToBottom() {
    setLayout({ scrollY: 1200, innerHeight: 800, scrollHeight: 2000 });
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });
  }

  it('좋아요를 세 번 누른 뒤 끝까지 내리면 3 이 넘어온다', () => {
    render(<AfterScreen />);

    for (let i = 0; i < 3; i += 1) {
      act(() => {
        screen.getByRole('button').click();
      });
    }
    scrollToBottom();

    expect(reached).toEqual([3]);
  });

  it('끝에 닿지 않으면 부르지 않는다', () => {
    render(<AfterScreen />);

    setLayout({ scrollY: 100, innerHeight: 800, scrollHeight: 2000 });
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    expect(reached).toEqual([]);
  });
});
