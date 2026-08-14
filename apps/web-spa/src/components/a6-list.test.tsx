// apps/web-spa/src/components/a6-list.test.tsx
import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { List } from './List';
import { feedPosts } from '../data/feed';
import { FeedSection } from './FeedSection';
import { withRouter } from '../../scratch/c1-router-harness';
import { withQuery } from '../../scratch/c5-query-harness';

const comments = [
  { id: 1, content: '노을 최고' },
  { id: 2, content: '어디예요?' },
];

const posts = [
  { id: 10, username: 'jaehoon' },
  { id: 20, username: 'minji' },
];

describe('List — 담긴 것이 무엇이든 같은 방식으로 그린다', () => {
  it('댓글을 그린다', () => {
    render(<List items={comments} renderItem={(comment) => <span>{comment.content}</span>} />);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('노을 최고');
    expect(items[1]).toHaveTextContent('어디예요?');
  });

  it('전혀 다른 타입도 같은 컴포넌트로 그린다', () => {
    render(<List items={posts} renderItem={(post) => <span>@{post.username}</span>} />);

    expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('@jaehoon');
  });

  it('빈 목록이면 목록 자리는 남고 안은 비어 있다', () => {
    render(<List items={[]} renderItem={() => null} />);

    expect(screen.getByRole('list')).toBeEmptyDOMElement();
  });

  it('className 은 쓰는 쪽이 정한다', () => {
    render(
      <List
        items={comments}
        renderItem={(comment) => <span>{comment.content}</span>}
        className="comment-list"
      />,
    );

    expect(screen.getByRole('list')).toHaveClass('comment-list');
  });
});

describe('List 로 바꾼 뒤에도 화면은 그대로다', () => {
  it('피드에 게시물 두 장이 그대로 뜬다', () => {
    render(withQuery(withRouter(<FeedSection posts={feedPosts} />)));

    expect(screen.getByText('오늘 한강 노을이...')).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(2);
  });

  it('피드가 목록으로 그려지고, 각 게시물이 한 줄씩 차지한다', () => {
    render(withQuery(withRouter(<FeedSection posts={feedPosts} />)));

    const feedList = screen.getByRole('list', { name: '피드 목록' });
    expect(within(feedList).getAllByRole('article')).toHaveLength(2);
  });
});
