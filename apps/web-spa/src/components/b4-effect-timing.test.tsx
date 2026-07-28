// apps/web-spa/src/components/b4-effect-timing.test.tsx
// 교안이 "이렇게 돈다" 고 말하는 횟수를 실제로 재서 박아둔 파일이다.
import { StrictMode, useEffect, useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EffectTimingDemo } from './EffectTimingDemo';

const log: string[] = [];

beforeEach(() => {
  log.length = 0;
});

function Probe({ label }: { label: string }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    log.push(`setup:${label}`);
    return () => {
      log.push(`cleanup:${label}`);
    };
  }, [label]);

  return (
    <button onClick={() => setN(n + 1)}>
      {label}-{n}
    </button>
  );
}

function NoCleanupProbe() {
  useEffect(() => {
    log.push('setup:no-cleanup');
  }, []);

  return <p>no cleanup</p>;
}

describe('개발 모드의 이중 실행', () => {
  it('StrictMode 없이 마운트하면 setup 이 한 번만 돈다', () => {
    render(<Probe label="A" />);

    expect(log).toEqual(['setup:A']);
  });

  it('StrictMode 로 감싸면 setup → cleanup → setup 순서로 돈다', () => {
    render(
      <StrictMode>
        <Probe label="B" />
      </StrictMode>,
    );

    expect(log).toEqual(['setup:B', 'cleanup:B', 'setup:B']);
  });

  it('이중 실행은 마운트에만 일어난다 — 상태가 바뀐 재렌더에서는 안 돈다', async () => {
    const user = userEvent.setup();
    render(
      <StrictMode>
        <Probe label="C" />
      </StrictMode>,
    );
    log.length = 0;

    await user.click(screen.getByRole('button'));

    expect(log).toEqual([]);
  });

  it('클린업이 없으면 치우지 않은 채로 setup 만 두 번 쌓인다', () => {
    render(
      <StrictMode>
        <NoCleanupProbe />
      </StrictMode>,
    );

    expect(log).toEqual(['setup:no-cleanup', 'setup:no-cleanup']);
  });
});

describe('의존성 배열 세 갈래의 실행 횟수', () => {
  const lines: string[] = [];
  let restore: () => void;

  beforeEach(() => {
    lines.length = 0;
    const spy = vi.spyOn(console, 'log').mockImplementation((...args: unknown[]) => {
      lines.push(String(args[0]));
    });
    restore = () => spy.mockRestore();
  });

  afterEach(() => {
    restore();
  });

  function counts() {
    return {
      배열없음: lines.filter((line) => line.startsWith('①')).length,
      빈배열: lines.filter((line) => line.startsWith('②')).length,
      count: lines.filter((line) => line.startsWith('③')).length,
    };
  }

  it('StrictMode 없이 — 배열 없음만 매번, 빈 배열은 처음 한 번', async () => {
    const user = userEvent.setup();
    render(<EffectTimingDemo />);

    expect(counts()).toEqual({ 배열없음: 1, 빈배열: 1, count: 1 });

    await user.click(screen.getByRole('button', { name: 'count +1' }));
    expect(counts()).toEqual({ 배열없음: 2, 빈배열: 1, count: 2 });

    // count 와 상관없는 상태를 바꾸면 [count] 짜리는 다시 돌지 않는다
    await user.click(screen.getByRole('button', { name: 'other +1' }));
    expect(counts()).toEqual({ 배열없음: 3, 빈배열: 1, count: 2 });
  });

  it('StrictMode 로 — 마운트에서만 한 번씩 더 돌고 그 뒤 증가분은 같다', async () => {
    const user = userEvent.setup();
    render(
      <StrictMode>
        <EffectTimingDemo />
      </StrictMode>,
    );

    expect(counts()).toEqual({ 배열없음: 2, 빈배열: 2, count: 2 });

    await user.click(screen.getByRole('button', { name: 'count +1' }));
    expect(counts()).toEqual({ 배열없음: 3, 빈배열: 2, count: 3 });

    await user.click(screen.getByRole('button', { name: 'other +1' }));
    expect(counts()).toEqual({ 배열없음: 4, 빈배열: 2, count: 3 });
  });
});
