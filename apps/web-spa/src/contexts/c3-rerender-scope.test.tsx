import { describe, expect, it, beforeEach } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useThemeContext } from './ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';

const counts = { reader: 0, bystander: 0, outside: 0 };
const seenValues: unknown[] = [];

// Context 를 읽는 쪽
function Reader() {
  counts.reader += 1;
  const theme = useThemeContext();
  seenValues.push(theme);

  return <p>{`읽음 ${theme.resolved}`}</p>;
}

// Provider 아래에 있지만 Context 를 안 읽는 쪽
function Bystander() {
  counts.bystander += 1;

  return <p>안 읽음</p>;
}

// Provider 바깥
function Outside() {
  counts.outside += 1;

  return <p>바깥</p>;
}

function Harness() {
  const [tick, setTick] = useState(0);

  return (
    <>
      <Outside />
      <button type="button" onClick={() => setTick(tick + 1)}>
        바깥에서 다시 그리기
      </button>
      <span>{`다시 그린 횟수 ${tick}`}</span>
      <ThemeProvider>
        <ThemeToggle />
        <Reader />
        <Bystander />
      </ThemeProvider>
    </>
  );
}

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.classList.remove('dark');
  counts.reader = 0;
  counts.bystander = 0;
  counts.outside = 0;
  seenValues.length = 0;
});

describe('값이 바뀌면 누가 다시 그려지나', () => {
  it('밝기를 바꾸면 읽는 쪽만 다시 그려진다 — 옆에 있어도 안 읽으면 안 그려진다', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const before = { ...counts };

    await user.click(screen.getByRole('button', { name: '어둡게' }));

    expect(screen.getByText('읽음 dark')).toBeInTheDocument();

    // 읽는 쪽만 늘어난다
    expect(counts.reader).toBe(before.reader + 1);
    // Provider 바로 아래인데도 안 읽으면 안 그려진다.
    // children 은 Harness 가 만든 그대로라 ThemeProvider 가 다시 그려져도 같은 엘리먼트다.
    expect(counts.bystander).toBe(before.bystander);
    expect(counts.outside).toBe(before.outside);
  });

  it('바깥이 다시 그려지면 Context 와 무관하게 아래가 따라 그려진다', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const before = { ...counts };

    await user.click(screen.getByRole('button', { name: '바깥에서 다시 그리기' }));

    expect(screen.getByText('다시 그린 횟수 1')).toBeInTheDocument();

    // 컴파일러가 켜져 있으면 하나도 안 그려진다.
    // props 가 그대로인 자식 엘리먼트를 컴파일러가 붙들고 있기 때문이다.
    // (같은 판을 컴파일러 없이 돌리면 셋 다 1 -> 2 가 된다)
    expect(counts.reader).toBe(before.reader);
    expect(counts.bystander).toBe(before.bystander);
    expect(counts.outside).toBe(before.outside);
  });

  it('useTheme 이 매번 새 객체를 만드는데도 Context 값의 정체가 안 바뀐다', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const first = seenValues.at(-1);

    await user.click(screen.getByRole('button', { name: '어둡게' }));

    const afterChange = seenValues.at(-1);

    // 값이 진짜 바뀌었으니 새 객체다
    expect(afterChange).not.toBe(first);
    expect((afterChange as { resolved: string }).resolved).toBe('dark');

    // 그런데 밝기와 무관한 다시 그리기에서는 읽는 쪽이 아예 안 불린다.
    // 그래서 새 객체를 받아볼 일 자체가 없다 — 컴파일러가 그 앞에서 끊는다.
    const seenBefore = seenValues.length;

    await user.click(screen.getByRole('button', { name: '바깥에서 다시 그리기' }));

    expect(seenValues.length).toBe(seenBefore);
  });
});
