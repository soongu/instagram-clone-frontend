import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, useThemeContext } from './ThemeContext';

// 감싸는 걸 잊었을 때 무슨 일이 생기는지만 본다.
function Reader() {
  const { resolved } = useThemeContext();

  return <p data-testid="resolved">{resolved}</p>;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('감싸는 걸 잊으면', () => {
  it('조용히 넘어가지 않고 그 자리에서 멈춘다', () => {
    // React 가 렌더 중 에러를 콘솔에도 찍는다. 테스트 출력만 조용히 시킨다.
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<Reader />)).toThrow(/ThemeProvider/);
  });

  it('메시지가 무엇을 해야 하는지까지 알려준다', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<Reader />)).toThrow(
      'useThemeContext 는 ThemeProvider 안에서 불러야 합니다',
    );
  });

  it('제대로 감싸면 아무 일 없다', () => {
    render(
      <ThemeProvider>
        <Reader />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('resolved')).toHaveTextContent('light');
  });
});
