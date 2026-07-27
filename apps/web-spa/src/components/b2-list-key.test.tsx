// apps/web-spa/src/components/b2-list-key.test.tsx
// B-2 Step 4 — 리스트 렌더링과 key (내부 검증용)
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Feed } from './Feed';
import { IndexKeyList, IdKeyList } from './KeyDemo';
import { feedPosts } from '../data/feed';

describe('Feed — 배열을 화면으로', () => {
  it('데이터 개수만큼 카드를 그린다', () => {
    render(<Feed posts={feedPosts} onToggleLike={() => {}} />);

    expect(screen.getAllByRole('article')).toHaveLength(feedPosts.length);
  });

  it('각 카드가 자기 데이터를 그린다', () => {
    render(<Feed posts={feedPosts} onToggleLike={() => {}} />);

    const [firstCard, secondCard] = screen.getAllByRole('article');
    expect(firstCard).toHaveTextContent('오늘 한강 노을이');
    expect(secondCard).toHaveTextContent('제주도 3박 4일');
  });

  it('한 카드의 좋아요를 누르면 그 게시물 id 로 부모에게 알린다', async () => {
    const onToggleLike = vi.fn();
    const user = userEvent.setup();
    render(<Feed posts={feedPosts} onToggleLike={onToggleLike} />);

    const [, secondCard] = screen.getAllByRole('article');
    await user.click(within(secondCard).getByRole('button', { name: /좋아요/ }));

    expect(onToggleLike).toHaveBeenCalledWith(feedPosts[1].id);
  });
});

describe('key 를 순서 번호로 주면 상태가 엉뚱한 항목에 남는다', () => {
  it('맨 위에 좋아요를 누르고 그 항목을 숨기면, 좋아요가 아래 항목으로 옮겨간다', async () => {
    const user = userEvent.setup();
    render(<IndexKeyList />);

    const [firstRow] = screen.getAllByRole('listitem');
    expect(firstRow).toHaveTextContent('jaehoon');
    await user.click(within(firstRow).getByRole('button'));
    expect(within(firstRow).getByRole('button')).toHaveTextContent('♥');

    await user.click(screen.getByRole('button', { name: '맨 위 게시물 숨기기' }));

    const rows = screen.getAllByRole('listitem');
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveTextContent('minji');
    // minji 는 누른 적이 없는데 눌린 모습으로 남아 있다
    expect(within(rows[0]).getByRole('button')).toHaveTextContent('♥');
  });
});

describe('key 를 id 로 주면 상태가 제 항목을 따라간다', () => {
  it('맨 위를 숨겨도 아래 항목의 좋아요는 눌리지 않은 상태 그대로다', async () => {
    const user = userEvent.setup();
    render(<IdKeyList />);

    const [firstRow] = screen.getAllByRole('listitem');
    await user.click(within(firstRow).getByRole('button'));

    await user.click(screen.getByRole('button', { name: '맨 위 게시물 숨기기' }));

    const rows = screen.getAllByRole('listitem');
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveTextContent('minji');
    expect(within(rows[0]).getByRole('button')).toHaveTextContent('♡');
  });
});
