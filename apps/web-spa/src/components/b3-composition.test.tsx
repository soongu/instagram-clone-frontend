// apps/web-spa/src/components/b3-composition.test.tsx
// B-3 — 컴포넌트 분리와 합성 (내부 검증용)
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { PostHeader } from './PostHeader';
import { PostImage } from './PostImage';
import { PostActions } from './PostActions';
import { PostCard } from './PostCard';
import { CommentList } from './CommentList';
import { feedPosts } from '../data/feed';

const [firstPost] = feedPosts;

describe('PostHeader — 카드의 머리 구역', () => {
  it('작성자 이름과 프로필 사진을 그린다', () => {
    render(<PostHeader username="jaehoon" profileImageUrl="/jaehoon.jpg" />);

    expect(screen.getByText('jaehoon')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'jaehoon 프로필 사진' })).toHaveAttribute(
      'src',
      '/jaehoon.jpg',
    );
  });
});

describe('PostImage — 사진 구역이 자기 이벤트를 가진다', () => {
  it('더블클릭하면 부모가 준 함수를 부른다', async () => {
    const onLike = vi.fn();
    const user = userEvent.setup();
    render(<PostImage imageUrl="/post1.jpg" username="jaehoon" onLike={onLike} />);

    await user.dblClick(screen.getByRole('img', { name: 'jaehoon 의 게시물' }));

    expect(onLike).toHaveBeenCalledTimes(1);
  });

  it('한 번 클릭으로는 아무 일도 없다', async () => {
    const onLike = vi.fn();
    const user = userEvent.setup();
    render(<PostImage imageUrl="/post1.jpg" username="jaehoon" onLike={onLike} />);

    await user.click(screen.getByRole('img', { name: 'jaehoon 의 게시물' }));

    expect(onLike).not.toHaveBeenCalled();
  });
});

describe('PostActions — 좋아요·캡션·댓글 수 구역', () => {
  it('좋아요 버튼을 누르면 부모가 준 함수를 부른다', async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();
    render(
      <PostActions
        username="jaehoon"
        content="오늘 한강 노을이 미쳤다"
        liked={false}
        likeCount={1240}
        commentCount={32}
        onToggle={onToggle}
      />,
    );

    await user.click(screen.getByRole('button', { name: '♡ 좋아요' }));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('좋아요 수·캡션·댓글 수를 함께 그린다', () => {
    render(
      <PostActions
        username="jaehoon"
        content="오늘 한강 노을이 미쳤다"
        liked
        likeCount={1241}
        commentCount={33}
        onToggle={() => {}}
      />,
    );

    expect(screen.getByText('좋아요 1241개')).toBeInTheDocument();
    expect(screen.getByText('오늘 한강 노을이 미쳤다')).toBeInTheDocument();
    expect(screen.getByText('댓글 33개 모두 보기')).toBeInTheDocument();
  });
});

describe('CommentList — 카드 안에 있던 목록을 꺼낸다', () => {
  it('넘긴 댓글을 순서대로 그린다', () => {
    render(
      <CommentList
        comments={[
          { id: 1, content: '노을 최고' },
          { id: 2, content: '어디예요?' },
        ]}
      />,
    );

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('노을 최고');
    expect(items[1]).toHaveTextContent('어디예요?');
  });

  it('댓글이 없어도 목록 자리는 남는다', () => {
    render(<CommentList comments={[]} />);

    expect(screen.getByRole('list')).toBeEmptyDOMElement();
  });
});

describe('PostCard — 세 구역으로 나눈 뒤에도 동작은 그대로다', () => {
  it('이미지를 더블클릭하면 좋아요 요청이 부모로 올라간다', async () => {
    const onToggleLike = vi.fn();
    const user = userEvent.setup();
    render(<PostCard {...firstPost} onToggleLike={onToggleLike} />);

    await user.dblClick(screen.getByRole('img', { name: 'jaehoon 의 게시물' }));

    expect(onToggleLike).toHaveBeenCalledWith(firstPost.id);
  });

  it('좋아요 버튼을 눌러도 같은 요청이 올라간다', async () => {
    const onToggleLike = vi.fn();
    const user = userEvent.setup();
    render(<PostCard {...firstPost} onToggleLike={onToggleLike} />);

    await user.click(screen.getByRole('button', { name: '♡ 좋아요' }));

    expect(onToggleLike).toHaveBeenCalledWith(firstPost.id);
  });

  it('댓글을 달면 카드 안 목록과 댓글 수가 함께 늘어난다', async () => {
    const user = userEvent.setup();
    render(<PostCard {...firstPost} onToggleLike={() => {}} />);

    await user.type(screen.getByLabelText('댓글 입력'), '노을 최고');
    await user.click(screen.getByRole('button', { name: '게시' }));

    const card = screen.getByRole('article');
    expect(within(card).getByRole('list')).toHaveTextContent('노을 최고');
    expect(screen.getByText('댓글 33개 모두 보기')).toBeInTheDocument();
  });
});
