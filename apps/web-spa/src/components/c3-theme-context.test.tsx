import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../contexts/ThemeContext';
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

describe('ThemeProvider 아래에서는 같은 값을 본다', () => {
  it('한쪽에서 고르면 다른 쪽도 따라온다', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <ThemeToggle />
        <ThemeColorMeta />
      </ThemeProvider>,
    );

    expect(readThemeColor()).toBe(THEME_COLOR.light);

    await user.click(screen.getByRole('button', { name: '어둡게' }));

    expect(screen.getByRole('button', { name: '어둡게' })).toHaveAttribute('aria-pressed', 'true');
    expect(document.documentElement).toHaveClass('dark');
    // Step 1 에서 밝은 값으로 남아 있던 자리
    expect(readThemeColor()).toBe(THEME_COLOR.dark);
  });

  it('되돌리면 주소창 색도 같이 되돌아온다', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <ThemeToggle />
        <ThemeColorMeta />
      </ThemeProvider>,
    );

    await user.click(screen.getByRole('button', { name: '어둡게' }));
    expect(readThemeColor()).toBe(THEME_COLOR.dark);

    await user.click(screen.getByRole('button', { name: '밝게' }));

    expect(document.documentElement).not.toHaveClass('dark');
    expect(readThemeColor()).toBe(THEME_COLOR.light);
  });

  it('상태는 Provider 한 곳에서만 생긴다 — 저장소에도 한 번만 쓰인다', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <ThemeToggle />
        <ThemeColorMeta />
      </ThemeProvider>,
    );

    await user.click(screen.getByRole('button', { name: '어둡게' }));

    expect(window.localStorage.getItem('ig-theme')).toBe('dark');
  });
});
