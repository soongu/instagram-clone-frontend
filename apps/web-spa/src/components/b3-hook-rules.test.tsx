// apps/web-spa/src/components/b3-hook-rules.test.tsx
// B-3 Step 5 — 훅 규칙을 어겼을 때 실행 중에 실제로 무슨 일이 나는지 (내부 검증용)
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ConditionalHookCard } from '../../scratch/b3-hook-runtime';

// React 는 렌더가 터질 때 콘솔에도 같은 내용을 쏟아낸다. 출력만 조용히 시킨다.
function silenceReactErrorLog() {
  return vi.spyOn(console, 'error').mockImplementation(() => {});
}

function messageOf(run: () => void) {
  try {
    run();
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }

  return null;
}

describe('조건부 훅 — 조건이 그대로면 아무 일도 안 난다', () => {
  it('처음부터 끝까지 true 면 멀쩡히 그려진다', () => {
    const { rerender } = render(<ConditionalHookCard withCaption />);
    rerender(<ConditionalHookCard withCaption />);

    expect(screen.getByRole('button', { name: '더보기' })).toBeInTheDocument();
  });

  it('처음부터 끝까지 false 여도 멀쩡히 그려진다', () => {
    const { rerender } = render(<ConditionalHookCard withCaption={false} />);
    rerender(<ConditionalHookCard withCaption={false} />);

    expect(screen.getByRole('button', { name: '♡' })).toBeInTheDocument();
  });
});

describe('조건부 훅 — 조건이 바뀌는 순간 터진다', () => {
  it('훅이 하나 늘어나는 쪽으로 바뀌면 "더 많이 불렸다"고 한다', () => {
    const spy = silenceReactErrorLog();
    const { rerender } = render(<ConditionalHookCard withCaption={false} />);

    const message = messageOf(() => rerender(<ConditionalHookCard withCaption />));

    expect(message).toBe(
      'Rendered more hooks than during the previous render.',
    );
    spy.mockRestore();
  });

  it('훅이 하나 줄어드는 쪽으로 바뀌면 "덜 불렸다"고 한다', () => {
    const spy = silenceReactErrorLog();
    const { rerender } = render(<ConditionalHookCard withCaption />);

    const message = messageOf(() => rerender(<ConditionalHookCard withCaption={false} />));

    expect(message).toBe(
      'Rendered fewer hooks than expected. This may be caused by an accidental early return statement.',
    );
    spy.mockRestore();
  });
});
