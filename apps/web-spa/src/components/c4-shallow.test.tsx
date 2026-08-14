import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import {
  ArrayReader,
  BundledReader,
  DerivedStringReader,
  SeparateReader,
  ShallowReader,
} from './ConfirmBundleDemo';
import { useConfirmStore } from '../stores/useConfirmStore';

let errors: string[] = [];
let spy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  useConfirmStore.setState({ request: null });
  errors = [];
  spy = vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    errors.push(args.map(String).join(' '));
  });
});

afterEach(() => {
  spy.mockRestore();
});

function renderAndCatch(ui: React.ReactNode) {
  try {
    render(ui);
    return '';
  } catch (error) {
    return error instanceof Error ? error.message.split('\n')[0] : String(error);
  }
}

describe('조각을 묶어서 고르면', () => {
  it('그리다가 멈춘다 — 새 객체가 매번 다른 값으로 읽힌다', () => {
    const thrown = renderAndCatch(<BundledReader />);

    expect(thrown).toContain('Maximum update depth exceeded');
    expect(errors[0]).toContain('The result of getSnapshot should be cached');
  });

  it('useShallow 로 감싸면 그대로 그려진다', () => {
    const thrown = renderAndCatch(<ShallowReader />);

    expect(thrown).toBe('');
    expect(errors).toHaveLength(0);
    expect(screen.getByText('(b) 닫힘 / (없음)')).toBeInTheDocument();
  });

  it('묶지 않고 조각을 따로 고르면 감쌀 것도 없다', () => {
    const thrown = renderAndCatch(<SeparateReader />);

    expect(thrown).toBe('');
    expect(errors).toHaveLength(0);
    expect(screen.getByText('(c) 닫힘 / (없음)')).toBeInTheDocument();
  });

  it('갈리는 기준은 개수가 아니라 매번 새로 만드느냐다', () => {
    // 계산해서 돌려주는데도 문자열이라 괜찮다
    expect(renderAndCatch(<DerivedStringReader />)).toBe('');
    expect(screen.getByText('(d) 닫힘')).toBeInTheDocument();

    // 배열로 묶으면 개수와 상관없이 터진다
    expect(renderAndCatch(<ArrayReader />)).toContain('Maximum update depth exceeded');
  });

  it('useShallow 로 감싼 쪽은 값이 바뀌면 제대로 따라온다', () => {
    render(<ShallowReader />);

    act(() => {
      useConfirmStore.getState().ask('댓글을 지울까요?', () => {});
    });

    expect(screen.getByText('(b) 열림 / 댓글을 지울까요?')).toBeInTheDocument();
  });
});
