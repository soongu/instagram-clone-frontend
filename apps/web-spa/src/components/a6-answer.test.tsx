// apps/web-spa/src/components/a6-answer.test.tsx
import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HashtagList } from '../../scratch/a6-story-answer';
import { feedPosts } from '../data/feed';

describe('과제 1 — 해시태그 목록', () => {
  it('첫 게시물의 해시태그가 # 를 달고 나온다', () => {
    render(<HashtagList names={feedPosts[0].hashtagNames} />);

    const list = screen.getByRole('list', { name: '해시태그' });
    const items = within(list).getAllByRole('listitem');

    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('#한강');
    expect(items[1]).toHaveTextContent('#노을');
  });

  it('두 번째 게시물도 그대로 동작한다', () => {
    render(<HashtagList names={feedPosts[1].hashtagNames} />);

    expect(screen.getByText('#제주도')).toBeInTheDocument();
    expect(screen.getByText('#여행')).toBeInTheDocument();
  });

  it('태그가 없으면 목록은 비어 있다', () => {
    render(<HashtagList names={[]} />);

    expect(screen.getByRole('list', { name: '해시태그' })).toBeEmptyDOMElement();
  });
});
