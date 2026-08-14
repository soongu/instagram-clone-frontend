// apps/web-spa/src/components/b2-form.test.tsx
// B-2 Step 7 — onChange 로 입력값을 상태에 담기 (내부 검증용)
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { CommentForm } from './CommentForm';
import { feedPosts } from '../data/feed';
import { FeedSection } from './FeedSection';
import { withRouter } from '../../scratch/c1-router-harness';

describe('CommentForm — 입력값도 상태다', () => {
  it('빈 칸으로 시작하고 게시 버튼은 눌리지 않는다', () => {
    render(<CommentForm onSubmit={() => {}} />);

    expect(screen.getByLabelText('댓글 입력')).toHaveValue('');
    expect(screen.getByRole('button', { name: '게시' })).toBeDisabled();
  });

  it('한 글자 칠 때마다 상태가 갱신돼 입력창에 그대로 보인다', async () => {
    const user = userEvent.setup();
    render(<CommentForm onSubmit={() => {}} />);

    await user.type(screen.getByLabelText('댓글 입력'), '노을 최고');

    expect(screen.getByLabelText('댓글 입력')).toHaveValue('노을 최고');
  });

  it('글자가 들어가면 게시 버튼이 살아난다', async () => {
    const user = userEvent.setup();
    render(<CommentForm onSubmit={() => {}} />);

    await user.type(screen.getByLabelText('댓글 입력'), '좋네요');

    expect(screen.getByRole('button', { name: '게시' })).toBeEnabled();
  });

  it('공백만 쳐서는 게시 버튼이 살아나지 않는다', async () => {
    const user = userEvent.setup();
    render(<CommentForm onSubmit={() => {}} />);

    await user.type(screen.getByLabelText('댓글 입력'), '   ');

    expect(screen.getByRole('button', { name: '게시' })).toBeDisabled();
  });

  it('게시하면 부모에게 내용을 넘기고 입력창을 비운다', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<CommentForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('댓글 입력'), '노을 최고');
    await user.click(screen.getByRole('button', { name: '게시' }));

    expect(onSubmit).toHaveBeenCalledWith('노을 최고');
    expect(screen.getByLabelText('댓글 입력')).toHaveValue('');
  });
});

describe('카드에 붙인 댓글 폼', () => {
  it('게시한 댓글이 목록에 쌓이고 댓글 수도 함께 오른다', async () => {
    const user = userEvent.setup();
    render(withRouter(<FeedSection posts={feedPosts} />));

    const [firstCard] = screen.getAllByRole('article');
    expect(firstCard).toHaveTextContent('댓글 32개 모두 보기');

    await user.type(within(firstCard).getByLabelText('댓글 입력'), '노을 최고');
    await user.click(within(firstCard).getByRole('button', { name: '게시' }));

    expect(within(firstCard).getByText(/노을 최고/)).toBeInTheDocument();
    expect(firstCard).toHaveTextContent('댓글 33개 모두 보기');
  });

  it('한 카드에 단 댓글이 다른 카드에는 안 보인다', async () => {
    const user = userEvent.setup();
    render(withRouter(<FeedSection posts={feedPosts} />));

    const [firstCard, secondCard] = screen.getAllByRole('article');
    await user.type(within(firstCard).getByLabelText('댓글 입력'), '노을 최고');
    await user.click(within(firstCard).getByRole('button', { name: '게시' }));

    expect(within(secondCard).queryByText(/노을 최고/)).not.toBeInTheDocument();
    expect(secondCard).toHaveTextContent('댓글 214개 모두 보기');
  });
});
