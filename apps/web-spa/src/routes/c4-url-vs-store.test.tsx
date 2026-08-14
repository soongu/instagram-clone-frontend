import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import {
  ConfirmInUrl,
  PostModalInStore,
  useModalStore,
} from '../../scratch/c4-url-vs-store-probe';
import { useConfirmStore } from '../stores/useConfirmStore';

beforeEach(() => {
  useModalStore.setState({ openId: null });
});

describe('삭제 확인을 주소에 담아보면', () => {
  it('열고 지우는 것까지는 멀쩡하게 동작한다', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();

    render(
      <MemoryRouter initialEntries={['/']}>
        <ConfirmInUrl onRemove={onRemove} />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: '3번 댓글 지우기' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: '지우기' }));
    expect(onRemove).toHaveBeenCalledWith(3);
  });

  it('그 주소로 새로 들어오면 상자가 떠 있다 — 아무도 안 물어봤는데', () => {
    render(
      <MemoryRouter initialEntries={['/?confirm=3']}>
        <ConfirmInUrl onRemove={vi.fn()} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('3번 댓글을 지울까요?')).toBeInTheDocument();
  });

  it('링크를 받은 사람이 지우기를 누르면 남의 댓글이 지워진다', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();

    // 주소만 들고 처음부터 그린 화면 = 링크를 받아 연 화면
    render(
      <MemoryRouter initialEntries={['/?confirm=3']}>
        <ConfirmInUrl onRemove={onRemove} />
      </MemoryRouter>,
    );

    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: '지우기' }));

    expect(onRemove).toHaveBeenCalledWith(3);
  });
});

describe('주소에 담을 수 있는 것과 없는 것', () => {
  it('우리 request 를 글자로 바꾸면 할 일이 사라진다', () => {
    const removed: number[] = [];

    useConfirmStore.getState().ask('댓글을 지울까요?', () => removed.push(7));
    const request = useConfirmStore.getState().request;

    // 살아 있는 값에는 함수가 있다
    expect(typeof request?.onConfirm).toBe('function');

    // 주소에 적으려면 글자가 되어야 한다
    const asText = JSON.stringify(request);

    expect(asText).toBe('{"message":"댓글을 지울까요?"}');
    expect(JSON.parse(asText).onConfirm).toBeUndefined();
    expect(removed).toHaveLength(0);

    useConfirmStore.setState({ request: null });
  });

  it('게시물 번호는 글자로 바꿔도 그대로다', () => {
    expect(String(1)).toBe('1');
    expect(Number(new URLSearchParams('?post=1').get('post'))).toBe(1);
  });
});

describe('게시물 모달을 store 에 담아보면', () => {
  it('열어도 주소가 그대로다', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/']}>
        <PostModalInStore id={1} />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: '댓글 모두 보기' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(useModalStore.getState().openId).toBe(1);
  });

  it('새로고침하면 닫혀 있다 — 주소에 아무것도 안 적혔으니 되살릴 것이 없다', () => {
    // 새로고침 = 주소만 남고 메모리는 비워진다
    useModalStore.setState({ openId: null });

    render(
      <MemoryRouter initialEntries={['/']}>
        <PostModalInStore id={1} />
      </MemoryRouter>,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
