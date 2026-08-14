import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  LabelProvider,
  ReadWithUse,
  ReadWithUseContext,
  ReadWithUseContextAfterState,
  ReadWithConditionalState,
  SandwichedUseContext,
} from './ConditionalContextDemo';

function renderToggling(ui: (show: boolean) => React.ReactNode) {
  const view = render(<LabelProvider label="읽었음">{ui(false)}</LabelProvider>);

  return {
    turnOn: () => view.rerender(<LabelProvider label="읽었음">{ui(true)}</LabelProvider>),
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('조건 안에서 Context 를 읽으면', () => {
  it('use 는 조건이 켜졌다 꺼져도 멀쩡하다', () => {
    const { turnOn } = renderToggling((show) => <ReadWithUse show={show} />);

    expect(screen.getByText(/^\(a\)/)).toHaveTextContent('안 읽음');

    turnOn();

    expect(screen.getByText(/^\(a\)/)).toHaveTextContent('읽었음');
  });

  it('useContext 도 런타임에서는 안 터진다 — 규칙을 어겼는데 화면은 나온다', () => {
    const { turnOn } = renderToggling((show) => <ReadWithUseContext show={show} />);

    expect(screen.getByText(/^\(b\)/)).toHaveTextContent('안 읽음');

    turnOn();

    expect(screen.getByText(/^\(b\)/)).toHaveTextContent('읽었음');
  });

  it('앞에 진짜 훅이 살아 있어도 useContext 는 여전히 안 터진다', () => {
    const { turnOn } = renderToggling((show) => <ReadWithUseContextAfterState show={show} />);

    expect(screen.getByText(/^\(c\)/)).toHaveTextContent('안 읽음 붙어있음');

    turnOn();

    expect(screen.getByText(/^\(c\)/)).toHaveTextContent('읽었음 붙어있음');
  });

  it('같은 자리에 진짜 훅을 넣으면 그때는 터진다', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const { turnOn } = renderToggling((show) => <ReadWithConditionalState show={show} />);

    expect(screen.getByText(/^\(d\)/)).toHaveTextContent('안 읽음 붙어있음');

    expect(() => turnOn()).toThrow(/Rendered more hooks than during the previous render/);
  });

  it('진짜 훅 두 개 사이에 끼워도 뒤엣것의 순서가 안 밀린다 — 자리를 안 잡는다는 뜻', () => {
    const { turnOn } = renderToggling((show) => <SandwichedUseContext show={show} />);

    expect(screen.getByText(/^\(e\)/)).toHaveTextContent('앞/뒤');

    turnOn();

    expect(screen.getByText(/^\(e\)/)).toHaveTextContent('앞/뒤');
  });
});
