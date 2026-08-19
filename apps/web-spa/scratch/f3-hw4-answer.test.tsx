// F-3 과제 4 예시답안 — 마우스 없이 쓸 수 있는지
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommentForm } from '../src/components/CommentForm';

describe('댓글 폼 — 키보드', () => {
  it('탭을 누르면 입력칸으로 간다', async () => {
    render(<CommentForm onSubmit={() => {}} />);

    await userEvent.tab();

    expect(screen.getByLabelText('댓글 입력')).toHaveFocus();
  });

  it('잠긴 버튼은 탭 순서에서 빠진다', async () => {
    render(<CommentForm onSubmit={() => {}} />);

    await userEvent.tab();
    await userEvent.tab();

    // 갈 곳이 없어서 화면 밖으로 나간다
    expect(screen.getByRole('button', { name: '게시' })).not.toHaveFocus();
  });

  it('글자를 넣으면 버튼이 탭 순서에 들어온다', async () => {
    render(<CommentForm onSubmit={() => {}} />);

    await userEvent.type(screen.getByLabelText('댓글 입력'), '노을 예쁘네요');
    await userEvent.tab();

    expect(screen.getByRole('button', { name: '게시' })).toHaveFocus();
  });
});
