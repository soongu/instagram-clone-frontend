// apps/web-spa/src/components/a5-comment-reducer.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { PostCard } from './PostCard';
import { CommentList } from './CommentList';
import { feedPosts } from '../data/feed';

const [first] = feedPosts;

function renderCard() {
  return render(<PostCard {...first} onToggleLike={() => {}} />);
}

async function writeComment(text: string) {
  const user = userEvent.setup();
  await user.type(screen.getByRole('textbox', { name: '댓글 입력' }), text);
  await user.click(screen.getByRole('button', { name: '게시' }));
}

describe('댓글을 리듀서로 옮긴 뒤', () => {
  it('댓글을 달면 목록에 뜨고 댓글 수가 하나 늘어난다', async () => {
    renderCard();

    await writeComment('노을 미쳤다');

    expect(screen.getByText('노을 미쳤다')).toBeInTheDocument();
    expect(screen.getByText(`댓글 ${first.commentCount + 1}개 모두 보기`)).toBeInTheDocument();
  });

  it('삭제 버튼을 누르면 그 줄만 사라진다', async () => {
    const user = userEvent.setup();
    renderCard();

    await writeComment('첫째');
    await writeComment('둘째');

    await user.click(screen.getAllByRole('button', { name: '댓글 삭제' })[0]);

    expect(screen.queryByText('첫째')).not.toBeInTheDocument();
    expect(screen.getByText('둘째')).toBeInTheDocument();
    expect(screen.getByText(`댓글 ${first.commentCount + 1}개 모두 보기`)).toBeInTheDocument();
  });

  it('지운 뒤 새로 달아도 남은 댓글이 딸려 사라지지 않는다 — 번호를 다시 쓰지 않기 때문', async () => {
    const user = userEvent.setup();
    renderCard();

    await writeComment('첫째');
    await writeComment('둘째');
    await user.click(screen.getAllByRole('button', { name: '댓글 삭제' })[0]);
    await writeComment('셋째');

    expect(screen.getByText('둘째')).toBeInTheDocument();
    expect(screen.getByText('셋째')).toBeInTheDocument();

    // 새로 단 '셋째' 를 지워도 '둘째' 는 그대로 남는다
    const removeButtons = screen.getAllByRole('button', { name: '댓글 삭제' });
    await user.click(removeButtons[removeButtons.length - 1]);

    expect(screen.getByText('둘째')).toBeInTheDocument();
    expect(screen.queryByText('셋째')).not.toBeInTheDocument();
  });

  it('지우는 함수를 안 넘기면 삭제 버튼이 아예 안 그려진다', () => {
    render(<CommentList comments={[{ id: 1, content: '노을 최고' }]} />);

    expect(screen.getByText('노을 최고')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '댓글 삭제' })).not.toBeInTheDocument();
  });
});
