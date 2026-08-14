import { describe, expect, it, beforeEach } from 'vitest';
import { useConfirmStore } from '../stores/useConfirmStore';
import { useThemeContext } from '../contexts/ThemeContext';

beforeEach(() => {
  useConfirmStore.setState({ request: null });
});

describe('컴포넌트가 아닌 자리에서', () => {
  it('store 는 읽고 쓸 수 있다', () => {
    expect(useConfirmStore.getState().request).toBeNull();

    useConfirmStore.getState().ask('여기는 컴포넌트가 아니다', () => {});
    expect(useConfirmStore.getState().request?.message).toBe('여기는 컴포넌트가 아니다');

    useConfirmStore.setState({ request: null });
    expect(useConfirmStore.getState().request).toBeNull();
  });

  it('훅에 달려 있는 것들 — 훅이면서 동시에 객체다', () => {
    expect(typeof useConfirmStore).toBe('function');
    expect(typeof useConfirmStore.getState).toBe('function');
    expect(typeof useConfirmStore.setState).toBe('function');
    expect(typeof useConfirmStore.subscribe).toBe('function');
  });

  it('subscribe 로 값이 바뀔 때마다 들을 수 있다', () => {
    const seen: (string | null)[] = [];
    const stop = useConfirmStore.subscribe((state) => {
      seen.push(state.request?.message ?? null);
    });

    useConfirmStore.getState().ask('첫 번째', () => {});
    useConfirmStore.getState().close();
    stop();
    useConfirmStore.getState().ask('구독을 끊은 뒤', () => {});

    expect(seen).toEqual(['첫 번째', null]);
  });

  it('Context 를 읽는 훅은 같은 자리에서 부를 수 없다', () => {
    let message = '';

    try {
      useThemeContext();
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }

    // 우리가 던지는 "Provider 안에서 불러야 합니다" 가 아니라, 그 앞에서 막힌다
    expect(message).not.toBe('');
    expect(message).not.toContain('ThemeProvider');
    console.log('[측정] Context 훅을 컴포넌트 밖에서 부르면 =', message);
  });
});
