// apps/web-spa/src/components/a5-ref-vs-state.test.tsx
// ref 에 담은 값이 남기는 하지만 화면을 다시 그리지는 않는다는 것을 잰다.
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { RefVsStateDemo } from './RefVsStateDemo';

function shown() {
  return {
    state: screen.getByText(/^state 로 센 수:/).textContent,
    ref: screen.getByText(/^ref 로 센 수:/).textContent,
  };
}

describe('ref 와 state 를 나란히 눌러보면', () => {
  it('ref 를 세 번 올려도 화면은 0 그대로다', async () => {
    const user = userEvent.setup();
    render(<RefVsStateDemo />);

    for (let i = 0; i < 3; i += 1) {
      await user.click(screen.getByRole('button', { name: 'ref +1' }));
    }

    expect(shown()).toEqual({ state: 'state 로 센 수: 0', ref: 'ref 로 센 수: 0' });
  });

  it('그 뒤 state 를 한 번 올리면 그동안 쌓인 ref 값이 드러난다', async () => {
    const user = userEvent.setup();
    render(<RefVsStateDemo />);

    for (let i = 0; i < 3; i += 1) {
      await user.click(screen.getByRole('button', { name: 'ref +1' }));
    }
    await user.click(screen.getByRole('button', { name: 'state +1' }));

    // 값은 처음부터 쌓이고 있었다. 화면이 다시 그려질 이유가 없었을 뿐이다.
    expect(shown()).toEqual({ state: 'state 로 센 수: 1', ref: 'ref 로 센 수: 3' });
  });

  it('state 를 올리면 그때마다 화면이 따라온다', async () => {
    const user = userEvent.setup();
    render(<RefVsStateDemo />);

    await user.click(screen.getByRole('button', { name: 'state +1' }));
    expect(shown().state).toBe('state 로 센 수: 1');

    await user.click(screen.getByRole('button', { name: 'state +1' }));
    expect(shown().state).toBe('state 로 센 수: 2');
  });
});

describe('과제 [탐구] 재현 — 다섯 번 누르면', () => {
  it('ref +1 다섯 번 뒤 state +1 한 번이면 5 가 드러난다', async () => {
    const user = userEvent.setup();
    render(<RefVsStateDemo />);

    for (let i = 0; i < 5; i += 1) {
      await user.click(screen.getByRole('button', { name: 'ref +1' }));
    }
    expect(shown().ref).toBe('ref 로 센 수: 0');

    await user.click(screen.getByRole('button', { name: 'state +1' }));
    expect(shown()).toEqual({ state: 'state 로 센 수: 1', ref: 'ref 로 센 수: 5' });
  });
});
