// apps/web-spa/src/components/a5-comment-reducer.test.tsx
import { render, screen, within } from '@testing-library/react';
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

// C-4 Step 1 부터 삭제는 두 번 누른다 — X 로 물어보고, 확인 상자에서 지운다.
// 지워지는 결과를 보는 단언은 그대로 두고 누르는 순서만 맞춘다.
async function removeComment(index: number) {
  const user = userEvent.setup();
  const buttons = screen.getAllByRole('button', { name: '댓글 삭제' });
  await user.click(buttons.at(index)!);
  await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: '지우기' }));
}

describe('댓글을 리듀서로 옮긴 뒤', () => {
  it('댓글을 달면 목록에 뜨고 댓글 수가 하나 늘어난다', async () => {
    renderCard();

    await writeComment('노을 미쳤다');

    expect(screen.getByText('노을 미쳤다')).toBeInTheDocument();
    expect(screen.getByText(`댓글 ${first.commentCount + 1}개 모두 보기`)).toBeInTheDocument();
  });

  it('삭제 버튼을 누르면 그 줄만 사라진다', async () => {
    renderCard();

    await writeComment('첫째');
    await writeComment('둘째');

    await removeComment(0);

    expect(screen.queryByText('첫째')).not.toBeInTheDocument();
    expect(screen.getByText('둘째')).toBeInTheDocument();
    expect(screen.getByText(`댓글 ${first.commentCount + 1}개 모두 보기`)).toBeInTheDocument();
  });

  it('지운 뒤 새로 달아도 남은 댓글이 딸려 사라지지 않는다 — 번호를 다시 쓰지 않기 때문', async () => {
    renderCard();

    await writeComment('첫째');
    await writeComment('둘째');
    await removeComment(0);
    await writeComment('셋째');

    expect(screen.getByText('둘째')).toBeInTheDocument();
    expect(screen.getByText('셋째')).toBeInTheDocument();

    // 새로 단 '셋째' 를 지워도 '둘째' 는 그대로 남는다
    await removeComment(-1);

    expect(screen.getByText('둘째')).toBeInTheDocument();
    expect(screen.queryByText('셋째')).not.toBeInTheDocument();
  });

  it('지우는 함수를 안 넘기면 삭제 버튼이 아예 안 그려진다', () => {
    render(<CommentList comments={[{ id: 1, content: '노을 최고' }]} />);

    expect(screen.getByText('노을 최고')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '댓글 삭제' })).not.toBeInTheDocument();
  });
});
