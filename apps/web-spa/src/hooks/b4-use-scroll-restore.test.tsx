// apps/web-spa/src/hooks/b4-use-scroll-restore.test.tsx
// 스크롤 구독과 위치 복원이 실제로 붙고 떨어지는지 잰다.
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useScrollRestore } from './useScrollRestore';

const STORAGE_KEY = 'feed-scroll';

// jsdom 은 실제로 스크롤되지 않으니 위치를 직접 세팅하고 이벤트만 쏜다
function scrollTo(y: number) {
  Object.defineProperty(window, 'scrollY', { value: y, writable: true, configurable: true });
  window.dispatchEvent(new Event('scroll'));
}

function Screen() {
  useScrollRestore(() => {});
  return <p>피드</p>;
}

describe('useScrollRestore', () => {
  let addSpy: ReturnType<typeof vi.spyOn>;
  let removeSpy: ReturnType<typeof vi.spyOn>;
  let scrollToSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    sessionStorage.clear();
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true });
    addSpy = vi.spyOn(window, 'addEventListener');
    removeSpy = vi.spyOn(window, 'removeEventListener');
    scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function scrollListenerCount(spy: { mock: { calls: unknown[][] } }) {
    return spy.mock.calls.filter((call) => call[0] === 'scroll').length;
  }

  it('스크롤하면 지금 위치를 적어둔다', () => {
    render(<Screen />);

    scrollTo(420);

    expect(sessionStorage.getItem(STORAGE_KEY)).toBe('420');
  });

  it('적어둔 위치가 있으면 화면에 붙을 때 그 자리로 되돌린다', () => {
    sessionStorage.setItem(STORAGE_KEY, '640');

    render(<Screen />);

    expect(scrollToSpy).toHaveBeenCalledWith(0, 640);
  });

  it('적어둔 위치가 없으면 되돌리지 않는다', () => {
    render(<Screen />);

    expect(scrollToSpy).not.toHaveBeenCalled();
  });

  it('화면에서 떨어지면 구독을 끊는다', () => {
    const view = render(<Screen />);
    expect(scrollListenerCount(addSpy)).toBe(1);

    view.unmount();

    expect(scrollListenerCount(removeSpy)).toBe(1);
  });

  it('구독을 끊고 나면 스크롤해도 더 적지 않는다', () => {
    const view = render(<Screen />);
    scrollTo(100);
    view.unmount();

    scrollTo(999);

    expect(sessionStorage.getItem(STORAGE_KEY)).toBe('100');
  });
});
