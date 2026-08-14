import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useTheme } from '../hooks/useTheme';

// Context 를 거치지 않고 훅을 직접 부르는 두 컴포넌트.
// 커스텀 훅이 무엇을 공유하고 무엇을 공유하지 않는지만 본다.
function ChoiceButtons() {
  const { choice, select } = useTheme();

  return (
    <div>
      <button type="button" aria-pressed={choice === 'dark'} onClick={() => select('dark')}>
        어둡게
      </button>
    </div>
  );
}

function ChoiceLabel() {
  const { choice, resolved } = useTheme();

  return <p data-testid="label">{`${choice}/${resolved}`}</p>;
}

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.classList.remove('dark');
});

describe('커스텀 훅이 공유하는 것과 안 하는 것', () => {
  it('같은 훅을 두 번 부르면 useState 가 두 벌 생긴다', async () => {
    const user = userEvent.setup();

    render(
      <>
        <ChoiceButtons />
        <ChoiceLabel />
      </>,
    );

    expect(screen.getByTestId('label').textContent).toBe('system/light');

    await user.click(screen.getByRole('button', { name: '어둡게' }));

    // 누른 쪽만 바뀐다
    expect(screen.getByRole('button', { name: '어둡게' })).toHaveAttribute('aria-pressed', 'true');

    // 옆 컴포넌트는 못 듣는다 — 자기 useState 를 따로 들고 있어서
    expect(screen.getByTestId('label').textContent).toBe('system/light');
  });

  it('그런데 화면과 저장소는 한 벌뿐이라 바뀐 쪽 결과가 그대로 반영된다', async () => {
    const user = userEvent.setup();

    render(
      <>
        <ChoiceButtons />
        <ChoiceLabel />
      </>,
    );

    await user.click(screen.getByRole('button', { name: '어둡게' }));

    // 화면은 어두워졌다. 그래서 눈으로는 멀쩡해 보인다.
    expect(document.documentElement).toHaveClass('dark');
    expect(window.localStorage.getItem('ig-theme')).toBe('dark');

    // 틀린 것은 "지금 밝기" 를 읽는다고 만든 쪽의 글자뿐이다.
    expect(screen.getByTestId('label').textContent).toBe('system/light');
  });

  it('안 바뀐 쪽은 되받아쓰지도 않는다 — 싸우는 게 아니라 모르는 것이다', async () => {
    const user = userEvent.setup();

    render(
      <>
        <ChoiceButtons />
        <ChoiceLabel />
      </>,
    );

    await user.click(screen.getByRole('button', { name: '어둡게' }));

    // ChoiceLabel 의 resolved 는 'light' 그대로라 effect 의 의존성이 안 바뀌었다.
    // 다시 안 도니까 표시를 떼지 않는다. 안정적인 게 아니라 안 부딪히는 것뿐이다.
    expect(document.documentElement).toHaveClass('dark');
  });
});
