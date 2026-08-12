// apps/web-spa/src/components/e5-theme-toggle.test.tsx
// E-5 Step 5 — 밝게·어둡게·시스템 셋 중에 고르기 (내부 검증용)
//
// 색이 실제로 갈리는 것은 globals.css 안이라 여기서 못 본다(E-4 때와 같은 이유).
// 여기서 지키는 것은 "누가 .dark 표시를 붙이고 떼느냐" 쪽이다.
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { ThemeToggle } from './ThemeToggle';
import { THEME_STORAGE_KEY } from '../lib/theme';

/** 운영체제 설정을 우리가 쥐고 흔들 수 있게 갈아 끼운다. jsdom 에는 이게 없다. */
function stubSystemPrefersDark(initial: boolean) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  let matches = initial;

  vi.stubGlobal('matchMedia', (query: string) => ({
    media: query,
    get matches() {
      return matches;
    },
    addEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.add(listener);
    },
    removeEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.delete(listener);
    },
    dispatchEvent: () => false,
  }));

  return {
    /** 사용자가 운영체제 설정을 바꿨다고 알린다 */
    change(next: boolean) {
      matches = next;
      for (const listener of listeners) {
        listener({ matches: next } as MediaQueryListEvent);
      }
    },
  };
}

const isDark = () => document.documentElement.classList.contains('dark');
const button = (name: string) => screen.getByRole('button', { name });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ThemeToggle — 고를 수 있는 것은 셋이다', () => {
  it('밝게·어둡게·시스템이 모두 있다', () => {
    render(<ThemeToggle />);

    expect(button('밝게')).toBeInTheDocument();
    expect(button('어둡게')).toBeInTheDocument();
    expect(button('시스템')).toBeInTheDocument();
  });

  it('아무것도 안 고른 사람은 시스템에서 시작한다', () => {
    render(<ThemeToggle />);

    expect(button('시스템')).toHaveAttribute('aria-pressed', 'true');
    expect(button('밝게')).toHaveAttribute('aria-pressed', 'false');
  });
});

describe('고르면 표시가 붙었다 떨어진다', () => {
  it('어둡게를 누르면 표시가 붙는다', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    expect(isDark()).toBe(false);

    await user.click(button('어둡게'));

    expect(isDark()).toBe(true);
    expect(button('어둡게')).toHaveAttribute('aria-pressed', 'true');
  });

  it('밝게로 되돌리면 표시가 떨어진다', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(button('어둡게'));
    await user.click(button('밝게'));

    expect(isDark()).toBe(false);
  });

  it('고른 것은 저장된다 — 다음 방문에 되살리려고', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(button('어둡게'));

    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  it('저장된 값이 있으면 그것으로 시작한다', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark');

    render(<ThemeToggle />);

    expect(isDark()).toBe(true);
    expect(button('어둡게')).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('시스템을 고른 사람만 운영체제를 따라간다', () => {
  it('시스템이 어두우면 시작부터 어둡다', () => {
    stubSystemPrefersDark(true);

    render(<ThemeToggle />);

    expect(isDark()).toBe(true);
    // 고른 것은 여전히 '시스템' 이다 — 어둡게를 고른 게 아니다
    expect(button('시스템')).toHaveAttribute('aria-pressed', 'true');
    expect(button('어둡게')).toHaveAttribute('aria-pressed', 'false');
  });

  it('쓰는 도중에 운영체제 설정이 바뀌면 따라간다', async () => {
    const system = stubSystemPrefersDark(false);
    render(<ThemeToggle />);

    expect(isDark()).toBe(false);

    await act(async () => system.change(true));

    expect(isDark()).toBe(true);
  });

  it('직접 고른 사람은 운영체제가 바뀌어도 안 흔들린다', async () => {
    const user = userEvent.setup();
    const system = stubSystemPrefersDark(false);
    render(<ThemeToggle />);

    await user.click(button('밝게'));
    await act(async () => system.change(true));

    expect(isDark()).toBe(false);
    expect(button('밝게')).toHaveAttribute('aria-pressed', 'true');
  });
});
