import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommentList } from './CommentList';

const listA = [
  { id: 1, content: 'A 첫 댓글' },
  { id: 2, content: 'A 둘째 댓글' },
];
const listB = [
  { id: 11, content: 'B 첫 댓글' },
  { id: 12, content: 'B 둘째 댓글' },
];

describe('확인 상자를 CommentList 안에 두면', () => {
  it('X 를 눌러도 바로 안 지워지고 먼저 물어본다', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();

    render(<CommentList comments={listA} onRemove={onRemove} />);

    await user.click(screen.getAllByRole('button', { name: '댓글 삭제' })[0]);

    expect(onRemove).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('지우기를 누르면 그때 지워지고 취소는 아무 일도 안 한다', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();

    render(<CommentList comments={listA} onRemove={onRemove} />);

    await user.click(screen.getAllByRole('button', { name: '댓글 삭제' })[1]);
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: '취소' }));
    expect(onRemove).not.toHaveBeenCalled();

    await user.click(screen.getAllByRole('button', { name: '댓글 삭제' })[1]);
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: '지우기' }));
    expect(onRemove).toHaveBeenCalledWith(2);
  });

  it('닫혀 있는 동안에는 화면 어디에도 상자가 없다', () => {
    render(
      <>
        <CommentList comments={listA} onRemove={vi.fn()} />
        <CommentList comments={listB} onRemove={vi.fn()} />
      </>,
    );

    expect(document.querySelectorAll('[data-slot="dialog-content"]')).toHaveLength(0);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('목록이 둘이어도 열린 상자는 하나뿐이다 — 두 번째를 열면 첫 번째가 닫힌다', async () => {
    const user = userEvent.setup();
    const removeA = vi.fn();
    const removeB = vi.fn();

    render(
      <>
        <CommentList comments={listA} onRemove={removeA} />
        <CommentList comments={listB} onRemove={removeB} />
      </>,
    );

    const buttons = screen.getAllByRole('button', { name: '댓글 삭제' });
    expect(buttons).toHaveLength(4);

    await user.click(buttons[0]);
    await user.click(buttons[2]);

    expect(screen.getAllByRole('dialog')).toHaveLength(1);

    // 남아 있는 상자가 누구 것인지는 눌러봐야 안다
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: '지우기' }));
    expect(removeA).not.toHaveBeenCalled();
    expect(removeB).toHaveBeenCalledWith(11);
  });
});
