// apps/web-spa/src/components/a4-answer.test.tsx
// A-4 과제 1 예시답안 검증 (내부 검증용)
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import {
  CommentCounter,
  CommentFormWithCounter,
} from '../../scratch/a4-story-answer';

describe('CommentCounter — 지금 글자 수와 한도를 함께 받는다', () => {
  it('받은 값을 그대로 보여준다', () => {
    render(<CommentCounter count={12} max={100} />);

    expect(screen.getByLabelText('글자 수')).toHaveTextContent('12 / 100');
  });

  it('한도를 props 로 받으므로 다른 한도도 그린다', () => {
    render(<CommentCounter count={3} max={20} />);

    expect(screen.getByLabelText('글자 수')).toHaveTextContent('3 / 20');
  });

  it('남은 글자가 10 자 이하면 구별되게 표시한다', () => {
    render(<CommentCounter count={90} max={100} />);

    expect(screen.getByLabelText('글자 수')).toHaveClass('near-limit');
  });

  it('여유가 있으면 강조하지 않는다', () => {
    render(<CommentCounter count={89} max={100} />);

    expect(screen.getByLabelText('글자 수')).not.toHaveClass('near-limit');
  });
});

describe('CommentForm — 한도를 넘기면 못 올린다', () => {
  it('글자를 칠 때마다 세어 보여준다', async () => {
    const user = userEvent.setup();
    render(<CommentFormWithCounter onSubmit={() => {}} />);

    await user.type(screen.getByLabelText('댓글 입력'), '노을 최고');

    expect(screen.getByLabelText('글자 수')).toHaveTextContent('5 / 100');
  });

  it('100 자를 넘기면 게시 버튼이 잠긴다', async () => {
    const user = userEvent.setup();
    render(<CommentFormWithCounter onSubmit={() => {}} />);

    await user.type(screen.getByLabelText('댓글 입력'), 'ㄱ'.repeat(101));

    expect(screen.getByRole('button', { name: '게시' })).toBeDisabled();
  });

  it('딱 100 자는 올릴 수 있다', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<CommentFormWithCounter onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('댓글 입력'), 'ㄱ'.repeat(100));
    await user.click(screen.getByRole('button', { name: '게시' }));

    expect(onSubmit).toHaveBeenCalledWith('ㄱ'.repeat(100));
  });

  it('한도를 넘긴 채 엔터를 쳐도 올라가지 않는다', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<CommentFormWithCounter onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('댓글 입력'), 'ㄱ'.repeat(101) + '{Enter}');

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('올리고 나면 글자 수가 0 으로 돌아오고 커서가 남는다', async () => {
    const user = userEvent.setup();
    render(<CommentFormWithCounter onSubmit={() => {}} />);

    const input = screen.getByLabelText('댓글 입력');
    await user.type(input, '노을 최고');
    await user.click(screen.getByRole('button', { name: '게시' }));

    expect(screen.getByLabelText('글자 수')).toHaveTextContent('0 / 100');
    expect(input).toHaveFocus();
  });
});
