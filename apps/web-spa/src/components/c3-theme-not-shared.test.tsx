import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeColorMeta } from './ThemeColorMeta';
import { ThemeToggle } from './ThemeToggle';
import { THEME_COLOR } from '../lib/theme';

function readThemeColor() {
  return document.querySelector('meta[name="theme-color"]')?.getAttribute('content');
}

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.classList.remove('dark');
  document.head.querySelector('meta[name="theme-color"]')?.remove();

  const meta = document.createElement('meta');
  meta.name = 'theme-color';
  meta.content = THEME_COLOR.light;
  document.head.append(meta);
});

describe('주소창 색을 맞추는 컴포넌트', () => {
  it('혼자 있으면 처음 그려질 때 지금 밝기에 맞춰 넣는다', () => {
    window.localStorage.setItem('ig-theme', 'dark');

    render(<ThemeColorMeta />);

    expect(readThemeColor()).toBe(THEME_COLOR.dark);
  });

  it('같은 훅을 두 곳에서 부르면 한쪽이 못 듣는다', async () => {
    const user = userEvent.setup();

    render(
      <>
        <ThemeToggle />
        <ThemeColorMeta />
      </>,
    );

    expect(readThemeColor()).toBe(THEME_COLOR.light);

    await user.click(screen.getByRole('button', { name: '어둡게' }));

    // 누른 쪽은 바뀐다
    expect(screen.getByRole('button', { name: '어둡게' })).toHaveAttribute('aria-pressed', 'true');

    // 화면도 바뀐다 — 표시를 붙이는 곳은 한 벌뿐이라서
    expect(document.documentElement).toHaveClass('dark');

    // 그런데 주소창 색은 밝은 값 그대로다.
    // ThemeColorMeta 가 부른 useTheme 은 자기 useState 를 따로 들고 있고,
    // 그 값은 아무도 안 바꿔줬다.
    expect(readThemeColor()).toBe(THEME_COLOR.light);
  });
});
