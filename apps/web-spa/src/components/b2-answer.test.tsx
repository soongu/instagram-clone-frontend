// apps/web-spa/src/components/b2-answer.test.tsx
// B-2 과제 예시답안이 실제로 동작하는지 확인한다 (내부 검증용)
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import {
  collectHashtags,
  visiblePostsOf,
  AppWithFilter,
} from '../../scratch/b2-story-answer';
import { feedPosts } from '../data/feed';

describe('태그 모으기', () => {
  it('데이터에서 중복 없이 뽑아낸다', () => {
    expect(collectHashtags(feedPosts)).toEqual([
      '한강',
      '노을',
      '제주도',
      '여행',
    ]);
  });

  it('같은 태그가 여러 게시물에 있어도 한 번만 나온다', () => {
    const doubled = [...feedPosts, { ...feedPosts[0], id: 99 }];

    expect(collectHashtags(doubled)).toEqual(['한강', '노을', '제주도', '여행']);
  });
});

describe('게시물 걸러내기', () => {
  it('태그를 안 고르면 전부 보인다', () => {
    expect(visiblePostsOf(feedPosts, null)).toHaveLength(2);
  });

  it('고른 태그가 달린 게시물만 남는다', () => {
    const filtered = visiblePostsOf(feedPosts, '한강');

    expect(filtered).toHaveLength(1);
    expect(filtered[0].username).toBe('jaehoon');
  });

  it('아무도 안 쓴 태그면 빈 배열이 된다', () => {
    expect(visiblePostsOf(feedPosts, '없는태그')).toEqual([]);
  });

  it('원본 배열을 건드리지 않는다', () => {
    visiblePostsOf(feedPosts, '한강');

    expect(feedPosts).toHaveLength(2);
  });
});

describe('걸러내기를 붙인 App', () => {
  it('처음에는 전체가 선택돼 있고 카드가 다 보인다', () => {
    render(<AppWithFilter />);

    expect(screen.getByRole('button', { name: '전체' })).toHaveClass('selected');
    expect(screen.getAllByRole('article')).toHaveLength(2);
  });

  it('태그를 고르면 그 태그의 게시물만 남는다', async () => {
    const user = userEvent.setup();
    render(<AppWithFilter />);

    await user.click(screen.getByRole('button', { name: '#제주도' }));

    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(1);
    expect(cards[0]).toHaveTextContent('제주도 3박 4일 기록');
  });

  it('고른 태그 버튼만 구별되게 보인다', async () => {
    const user = userEvent.setup();
    render(<AppWithFilter />);

    await user.click(screen.getByRole('button', { name: '#한강' }));

    expect(screen.getByRole('button', { name: '#한강' })).toHaveClass('selected');
    expect(screen.getByRole('button', { name: '#여행' })).not.toHaveClass(
      'selected',
    );
    expect(screen.getByRole('button', { name: '전체' })).not.toHaveClass(
      'selected',
    );
  });

  it('전체를 다시 누르면 모두 돌아온다', async () => {
    const user = userEvent.setup();
    render(<AppWithFilter />);

    await user.click(screen.getByRole('button', { name: '#한강' }));
    await user.click(screen.getByRole('button', { name: '전체' }));

    expect(screen.getAllByRole('article')).toHaveLength(2);
  });

  it('태그를 걸러내도 눌러둔 좋아요가 유지된다', async () => {
    const user = userEvent.setup();
    render(<AppWithFilter />);

    const [firstCard] = screen.getAllByRole('article');
    await user.click(within(firstCard).getByRole('button', { name: /좋아요/ }));
    expect(screen.getByText('좋아요 누른 게시물 2개')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '#제주도' }));
    await user.click(screen.getByRole('button', { name: '전체' }));

    const [backAgain] = screen.getAllByRole('article');
    expect(within(backAgain).getByText('좋아요 1241개')).toBeInTheDocument();
    expect(screen.getByText('좋아요 누른 게시물 2개')).toBeInTheDocument();
  });
});
