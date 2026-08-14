import { describe, expect, it, beforeEach, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  AnswerFeed,
  BusyConfirmDialog,
  ConstantSelector,
  SixthSelector,
  useBusyConfirmStore,
} from '../../scratch/c4-story-answer';
import { withConfirm } from '../../scratch/c4-confirm-harness';
import { useConfirmStore } from '../stores/useConfirmStore';
import { feedPosts } from '../data/feed';

beforeEach(() => {
  useConfirmStore.setState({ request: null });
  useBusyConfirmStore.setState({ request: null, isBusy: false });
});

describe('과제 1 — 게시물 삭제에도 같은 상자를 쓴다', () => {
  it('점 세 개 옆 삭제를 누르면 같은 확인 상자가 뜬다', async () => {
    const user = userEvent.setup();

    render(withConfirm(<AnswerFeed posts={feedPosts.slice(0, 2)} />));

    await user.click(screen.getAllByRole('button', { name: '게시물 삭제' })[0]);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('이 게시물을 지울까요?')).toBeInTheDocument();
  });

  it('확인하면 그 게시물만 피드에서 사라진다', async () => {
    const user = userEvent.setup();
    const [first, second] = feedPosts;

    render(withConfirm(<AnswerFeed posts={[first, second]} />));
    expect(screen.getByText(first.username)).toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: '게시물 삭제' })[0]);
    await user.click(screen.getByRole('button', { name: '지우기' }));

    expect(screen.queryByText(first.username)).not.toBeInTheDocument();
    expect(screen.getByText(second.username)).toBeInTheDocument();
  });

  it('취소하면 아무것도 안 사라진다', async () => {
    const user = userEvent.setup();
    const [first, second] = feedPosts;

    render(withConfirm(<AnswerFeed posts={[first, second]} />));

    await user.click(screen.getAllByRole('button', { name: '게시물 삭제' })[0]);
    await user.click(screen.getByRole('button', { name: '취소' }));

    expect(screen.getByText(first.username)).toBeInTheDocument();
    expect(screen.getByText(second.username)).toBeInTheDocument();
  });

  it('상자와 store 는 한 줄도 안 고쳤다 — 지우는 쪽만 늘었다', () => {
    // 게시물 쪽도 댓글 쪽과 똑같은 ask 하나로 끝난다
    useConfirmStore.getState().ask('이 게시물을 지울까요?', () => {});

    expect(useConfirmStore.getState().request?.message).toBe('이 게시물을 지울까요?');
  });
});

describe('과제 2 — 처리 중에는 물어보지 않는다', () => {
  it('처리 중에는 새 요청이 들어오지 않는다', async () => {
    let release = () => {};
    const slow = () => new Promise<void>((resolve) => (release = resolve));

    useBusyConfirmStore.getState().ask('첫 번째를 지울까요?', slow);

    let running: Promise<void>;
    act(() => {
      running = useBusyConfirmStore.getState().confirm();
    });

    expect(useBusyConfirmStore.getState().isBusy).toBe(true);

    // 처리 중에 다른 X 를 눌렀다고 치자
    act(() => {
      useBusyConfirmStore.getState().ask('두 번째를 지울까요?', () => {});
    });

    expect(useBusyConfirmStore.getState().request?.message).toBe('첫 번째를 지울까요?');

    await act(async () => {
      release();
      await running;
    });

    expect(useBusyConfirmStore.getState().isBusy).toBe(false);
    expect(useBusyConfirmStore.getState().request).toBeNull();
  });

  it('버튼 글자가 지우는 중으로 바뀌고 다시 눌리지 않는다', async () => {
    let release = () => {};
    const onConfirm = vi.fn(() => new Promise<void>((resolve) => (release = resolve)));

    render(<BusyConfirmDialog />);
    act(() => {
      useBusyConfirmStore.getState().ask('지울까요?', onConfirm);
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: '지우기' }));

    const busyButton = screen.getByRole('button', { name: '지우는 중…' });
    expect(busyButton).toBeDisabled();

    await act(async () => {
      release();
    });

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('할 일이 실패해도 잠금은 풀린다', async () => {
    useBusyConfirmStore.getState().ask('지울까요?', () => {
      throw new Error('서버가 거절했다');
    });

    await act(async () => {
      await useBusyConfirmStore.getState().confirm().catch(() => {});
    });

    expect(useBusyConfirmStore.getState().isBusy).toBe(false);
  });
});

describe('과제 4 — 멈출 것 같은데 안 멈추는 selector', () => {
  it('객체를 돌려주는데도 멈추지 않는다', () => {
    render(<SixthSelector />);

    expect(screen.getByText('(f) 닫힘')).toBeInTheDocument();

    act(() => {
      useConfirmStore.getState().ask('댓글을 지울까요?', () => {});
    });

    expect(screen.getByText('(f) 댓글을 지울까요?')).toBeInTheDocument();
  });

  it('늘 같은 하나를 돌려주는 것도 안 멈춘다', () => {
    render(<ConstantSelector />);

    expect(screen.getByText('(g) (없음)')).toBeInTheDocument();
  });
});
