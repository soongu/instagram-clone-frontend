// apps/web-spa/src/components/a5-toast-reset.test.tsx
// 같은 문구가 연달아 뜰 때 타이머가 다시 걸리는지를 두 판으로 나란히 잰다.
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HomePage } from '../routes/HomePage';
import { AppStringToast } from '../../scratch/a5-toast-before';

// jsdom 은 실제로 스크롤되지 않으니 위치를 직접 세팅하고 이벤트만 쏜다
function scrollToBottom() {
  Object.defineProperty(window, 'scrollY', { value: 1000, writable: true, configurable: true });
  act(() => {
    window.dispatchEvent(new Event('scroll'));
  });
}

// 끝까지 내려 알림을 띄우고, 2초 뒤 다시 끝까지 내린다(문구가 똑같다).
// 두 번째 알림이 뜬 뒤 1.1초·3.1초 시점의 화면을 돌려준다.
function reachBottomTwice() {
  scrollToBottom();
  const firstMessage = screen.getByRole('status').textContent;

  act(() => {
    vi.advanceTimersByTime(2000);
  });
  scrollToBottom();
  const secondMessage = screen.getByRole('status').textContent;

  act(() => {
    vi.advanceTimersByTime(1100);
  });
  const at1100 = screen.queryByRole('status')?.textContent ?? null;

  act(() => {
    vi.advanceTimersByTime(2000);
  });
  const at3100 = screen.queryByRole('status')?.textContent ?? null;

  return { firstMessage, secondMessage, at1100, at3100 };
}

describe('같은 문구가 연달아 뜰 때', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.clear();
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 800, writable: true, configurable: true });
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: 1500,
      writable: true,
      configurable: true,
    });
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('문자열로 들고 있던 판 — 두 번째 알림이 자기 시간을 못 채운다', () => {
    render(<AppStringToast />);
    const result = reachBottomTwice();

    // 피드에 minji 것 하나가 이미 좋아요 상태라 1 개다
    expect(result.firstMessage).toBe('게시물을 모두 확인했습니다 · 좋아요 1개');
    expect(result.secondMessage).toBe(result.firstMessage);

    // 첫 타이머가 그대로 살아 있어 두 번째 알림을 1.1 초 만에 지운다
    expect(result.at1100).toBeNull();
  });

  it('리듀서로 옮긴 판 — 두 번째 알림이 3 초를 온전히 채운다', () => {
    render(<HomePage />);
    const result = reachBottomTwice();

    expect(result.firstMessage).toBe('게시물을 모두 확인했습니다 · 좋아요 1개');
    expect(result.secondMessage).toBe(result.firstMessage);

    // 알림이 새 객체라 타이머가 다시 걸린다
    expect(result.at1100).toBe('게시물을 모두 확인했습니다 · 좋아요 1개');
    expect(result.at3100).toBeNull();
  });
});

describe('두 번째 알림이 화면에 머문 시간을 정확히 재면', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.clear();
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 800, writable: true, configurable: true });
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: 1500,
      writable: true,
      configurable: true,
    });
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  function liveMsAfterSecondToast(ui: React.ReactElement) {
    render(ui);
    scrollToBottom();
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    scrollToBottom(); // 두 번째 알림 — 문구가 똑같다

    let lived = 0;
    while (lived < 5000 && screen.queryByRole('status') !== null) {
      act(() => {
        vi.advanceTimersByTime(100);
      });
      lived += 100;
    }
    return lived;
  }

  it('문자열 판은 약 1초, 리듀서 판은 3초를 채운다', () => {
    expect(liveMsAfterSecondToast(<AppStringToast />)).toBe(1000);
  });

  it('리듀서 판은 3000ms', () => {
    expect(liveMsAfterSecondToast(<HomePage />)).toBe(3000);
  });
});
