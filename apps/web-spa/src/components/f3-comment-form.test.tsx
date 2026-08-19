// apps/web-spa/src/components/f3-comment-form.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommentForm } from './CommentForm';

describe('댓글 폼', () => {
  it('빈칸이면 게시 버튼이 잠겨 있다', () => {
    render(<CommentForm onSubmit={() => {}} />);

    expect(screen.getByRole('button', { name: '게시' })).toBeDisabled();
  });

  it('글자를 넣으면 풀린다', async () => {
    render(<CommentForm onSubmit={() => {}} />);

    await userEvent.type(screen.getByLabelText('댓글 입력'), '노을 예쁘네요');

    expect(screen.getByRole('button', { name: '게시' })).toBeEnabled();
  });

  it('공백만 넣으면 잠긴 채로 있다', async () => {
    render(<CommentForm onSubmit={() => {}} />);

    await userEvent.type(screen.getByLabelText('댓글 입력'), '   ');

    expect(screen.getByRole('button', { name: '게시' })).toBeDisabled();
  });

  it('게시하면 내용이 넘어가고 입력칸이 비워진다', async () => {
    const onSubmit = vi.fn();
    render(<CommentForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('댓글 입력'), '노을 예쁘네요');
    await userEvent.click(screen.getByRole('button', { name: '게시' }));

    expect(onSubmit).toHaveBeenCalledWith('노을 예쁘네요');
    expect(screen.getByLabelText('댓글 입력')).toHaveValue('');
  });

  it('엔터로도 게시된다', async () => {
    const onSubmit = vi.fn();
    render(<CommentForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('댓글 입력'), '노을 예쁘네요{enter}');

    expect(onSubmit).toHaveBeenCalledWith('노을 예쁘네요');
  });
});
