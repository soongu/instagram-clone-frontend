import { describe, expect, it, beforeEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useConfirmStore } from '../stores/useConfirmStore';

const counts = { whole: 0, slice: 0 };

// 통째로 구독한다. 쓰는 것은 ask 하나뿐인데도 store 전체를 받는다.
function WholeStoreAsker() {
  counts.whole += 1;
  const { ask } = useConfirmStore();

  return (
    <button type="button" onClick={() => ask('통째로 물어보기', () => {})}>
      통째
    </button>
  );
}

// 필요한 조각만 구독한다.
function SliceAsker() {
  counts.slice += 1;
  const ask = useConfirmStore((state) => state.ask);

  return (
    <button type="button" onClick={() => ask('조각으로 물어보기', () => {})}>
      조각
    </button>
  );
}

beforeEach(() => {
  useConfirmStore.setState({ request: null });
  counts.whole = 0;
  counts.slice = 0;
});

describe('무엇을 구독하느냐가 다시 그리는 횟수를 정한다', () => {
  it('request 가 바뀌면 통째로 구독한 쪽만 다시 그려진다', async () => {
    const user = userEvent.setup();

    render(
      <>
        <WholeStoreAsker />
        <SliceAsker />
      </>,
    );

    expect(counts).toEqual({ whole: 1, slice: 1 });

    // 둘 중 아무 버튼이나 눌러 request 를 바꾼다
    await user.click(screen.getByRole('button', { name: '조각' }));

    expect(counts.whole).toBe(2);
    expect(counts.slice).toBe(1);

    // 닫아도 마찬가지다 — request 는 또 바뀐다
    act(() => {
      useConfirmStore.setState({ request: null });
    });

    expect(counts.whole).toBe(3);
    expect(counts.slice).toBe(1);
  });

  it('열고 닫기를 세 번 반복하면 통째는 일곱, 조각은 하나다', () => {
    render(
      <>
        <WholeStoreAsker />
        <SliceAsker />
      </>,
    );

    for (let i = 0; i < 3; i += 1) {
      act(() => {
        useConfirmStore.getState().ask(`${i}번을 지울까요?`, () => {});
      });
      act(() => {
        useConfirmStore.getState().close();
      });
    }

    expect(counts).toEqual({ whole: 7, slice: 1 });
  });

  it('열 장이면 통째는 열 개가 함께 그려지고 조각은 한 개도 안 그려진다', () => {
    const ten = Array.from({ length: 10 }, (_, index) => index);

    render(
      <>
        {ten.map((index) => (
          <WholeStoreAsker key={index} />
        ))}
      </>,
    );
    expect(counts.whole).toBe(10);

    act(() => {
      useConfirmStore.getState().ask('열기', () => {});
    });
    expect(counts.whole).toBe(20);

    act(() => {
      useConfirmStore.getState().close();
    });
    expect(counts.whole).toBe(30);

    counts.slice = 0;
    render(
      <>
        {ten.map((index) => (
          <SliceAsker key={index} />
        ))}
      </>,
    );
    expect(counts.slice).toBe(10);

    act(() => {
      useConfirmStore.getState().ask('열기', () => {});
    });
    act(() => {
      useConfirmStore.getState().close();
    });

    expect(counts.slice).toBe(10);
  });

  it('조각으로 구독한 쪽은 그 조각이 안 바뀌는 한 영영 안 그려진다', () => {
    render(<SliceAsker />);

    expect(counts.slice).toBe(1);

    act(() => {
      useConfirmStore.getState().ask('첫 번째', () => {});
    });
    act(() => {
      useConfirmStore.getState().close();
    });
    act(() => {
      useConfirmStore.getState().ask('두 번째', () => {});
    });
    act(() => {
      useConfirmStore.getState().close();
    });

    expect(counts.slice).toBe(1);
  });
});
