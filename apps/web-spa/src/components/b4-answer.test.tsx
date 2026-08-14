// apps/web-spa/src/components/b4-answer.test.tsx
// 과제 답안과 [탐구] 항목의 실제 결과를 채증한다.
import { StrictMode, useEffect } from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useWindowWidth, AppWithWidth } from '../../scratch/b4-story-answer';
import { useLikeToggle } from '../hooks/useLikeToggle';
import { feedPosts } from '../data/feed';
import { withRouter } from '../../scratch/c1-router-harness';

function resizeTo(width: number) {
  Object.defineProperty(window, 'innerWidth', {
    value: width,
    writable: true,
    configurable: true,
  });
  act(() => {
    window.dispatchEvent(new Event('resize'));
  });
}

describe('과제 1 — 창 너비를 듣는 훅', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      value: 1024,
      writable: true,
      configurable: true,
    });
  });

  it('처음 값은 지금 창 너비다', () => {
    render(withRouter(<AppWithWidth />));

    expect(screen.getByText('너비 1024px')).toBeInTheDocument();
  });

  it('창을 줄이면 숫자가 따라온다', () => {
    render(withRouter(<AppWithWidth />));

    resizeTo(500);

    expect(screen.getByText('너비 500px')).toBeInTheDocument();
  });

  it('640 미만이면 안내가 뜨고 넘으면 사라진다', () => {
    render(withRouter(<AppWithWidth />));
    expect(screen.queryByText(/화면이 좁아요/)).not.toBeInTheDocument();

    resizeTo(500);
    expect(screen.getByText(/화면이 좁아요/)).toBeInTheDocument();

    resizeTo(900);
    expect(screen.queryByText(/화면이 좁아요/)).not.toBeInTheDocument();
  });

  it('화면에서 떨어지면 구독을 끊는다', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const view = render(withRouter(<AppWithWidth />));
    view.unmount();

    const resizeRemovals = removeSpy.mock.calls.filter((call) => call[0] === 'resize');
    expect(resizeRemovals).toHaveLength(1);

    removeSpy.mockRestore();
  });

  it('구독을 끊고 나면 더 반응하지 않는다', () => {
    function Probe() {
      const width = useWindowWidth();
      return <p>{width}</p>;
    }

    const view = render(withRouter(<Probe />));
    view.unmount();

    // 끊긴 뒤에 창을 줄여도 경고 없이 조용해야 한다
    expect(() => resizeTo(300)).not.toThrow();
  });
});

describe('과제 2 — 클린업을 지웠을 때', () => {
  const scrolls: string[] = [];
  // 안 떼어진 리스너가 다음 테스트로 새지 않게 손으로 걷어낸다
  const leaked: EventListener[] = [];

  beforeEach(() => {
    scrolls.length = 0;
    leaked.length = 0;
  });

  afterEach(() => {
    leaked.forEach((handler) => window.removeEventListener('scroll', handler));
    vi.restoreAllMocks();
  });

  function spyOnAdd() {
    const original = window.addEventListener.bind(window);

    return vi
      .spyOn(window, 'addEventListener')
      .mockImplementation((type: string, handler: EventListenerOrEventListenerObject, options?: unknown) => {
        if (type === 'scroll' && typeof handler === 'function') {
          leaked.push(handler);
        }
        original(type, handler, options as boolean);
      });
  }

  function scrollListenerCount(spy: { mock: { calls: unknown[][] } }) {
    return spy.mock.calls.filter((call) => call[0] === 'scroll').length;
  }

  // 클린업만 지운 판
  function useScrollNoCleanup() {
    useEffect(() => {
      function handleScroll() {
        scrolls.push('지금 위치');
      }

      window.addEventListener('scroll', handleScroll);
    }, []);
  }

  function Screen() {
    useScrollNoCleanup();
    return <p>피드</p>;
  }

  it('개발 모드에서 리스너가 둘 붙어 한 번 스크롤에 두 줄이 찍힌다', () => {
    const addSpy = spyOnAdd();

    render(<StrictMode>{withRouter(<Screen />)}</StrictMode>);
    expect(scrollListenerCount(addSpy)).toBe(2);

    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    expect(scrolls).toHaveLength(2);
  });

  it('StrictMode 를 벗기면 한 줄로 줄어든다 — 문제가 사라진 것은 아니다', () => {
    const addSpy = spyOnAdd();

    render(withRouter(<Screen />));
    expect(scrollListenerCount(addSpy)).toBe(1);

    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    expect(scrolls).toHaveLength(1);
  });

  it('화면에서 떠난 뒤에도 안 뗀 리스너는 계속 반응한다', () => {
    spyOnAdd();

    const view = render(withRouter(<Screen />));
    view.unmount();
    scrolls.length = 0;

    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    // 컴포넌트는 사라졌는데 구독은 살아 있다
    expect(scrolls).toHaveLength(1);
  });
});

describe('과제 2 — 의존성 배열을 비웠을 때', () => {
  // 탭 제목 effect 의 배열만 [] 로 바꾼 판
  function AppFrozenTitle() {
    const { posts, likedCount, toggle } = useLikeToggle(feedPosts);

    useEffect(() => {
      document.title = `인스타그램 (좋아요 ${likedCount})`;
    }, []);

    return (
      <div>
        <p data-testid="count">좋아요 {likedCount}개</p>
        <button onClick={() => toggle(posts[0].id)}>토글</button>
      </div>
    );
  }

  it('탭 제목은 처음 값에서 멈추는데 화면 숫자는 따라온다', () => {
    render(withRouter(<AppFrozenTitle />));
    expect(document.title).toBe('인스타그램 (좋아요 1)');

    act(() => {
      screen.getByRole('button').click();
    });

    // 화면은 다시 그려져서 최신 값
    expect(screen.getByTestId('count')).toHaveTextContent('좋아요 2개');
    // 탭 제목은 처음 실행 때 본 값에 멈춰 있다
    expect(document.title).toBe('인스타그램 (좋아요 1)');
  });
});
