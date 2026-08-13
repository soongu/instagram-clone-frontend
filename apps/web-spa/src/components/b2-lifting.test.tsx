// apps/web-spa/src/components/b2-lifting.test.tsx
// B-2 Step 5~6 — 상태 끌어올리기 · 상태 불변성 (내부 검증용)
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { HomePage } from '../routes/HomePage';
import { LikeButton } from './LikeButton';
import { toggleLike, toggleLikeInPlace } from '../lib/likes';
import type { Post } from '../types/instagram';
import { feedPosts } from '../data/feed';
import { withRouter } from '../../scratch/c1-router-harness';

function samplePosts(): Post[] {
  return feedPosts.map((post) => ({ ...post }));
}

describe('LikeButton — 제어 컴포넌트가 된 뒤', () => {
  it('자기 상태 없이 받은 props 그대로만 그린다', () => {
    render(<LikeButton liked likeCount={8500} onToggle={() => {}} />);

    // E-7 에서 글자가 아이콘으로 바뀌면서 눌린 상태를 aria-pressed 가 들고 있다
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('좋아요 8500개')).toBeInTheDocument();
  });

  it('눌러도 스스로 바뀌지 않고 부모가 준 함수만 부른다', async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();
    render(<LikeButton liked={false} likeCount={1240} onToggle={onToggle} />);

    await user.click(screen.getByRole('button'));

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('좋아요 1240개')).toBeInTheDocument();
  });
});

describe('HomePage — 상태를 끌어올린 뒤', () => {
  it('헤더가 좋아요 누른 게시물 수를 센다', () => {
    render(withRouter(<HomePage />));

    // 초기 데이터에서 liked 가 true 인 건 minji 하나
    expect(screen.getByText('좋아요 누른 게시물 1개')).toBeInTheDocument();
  });

  it('카드에서 누른 좋아요가 헤더 숫자까지 올라온다', async () => {
    const user = userEvent.setup();
    render(withRouter(<HomePage />));

    const [firstCard] = screen.getAllByRole('article');
    await user.click(within(firstCard).getByRole('button', { name: /좋아요/ }));

    expect(screen.getByText('좋아요 누른 게시물 2개')).toBeInTheDocument();
    expect(within(firstCard).getByText('좋아요 1241개')).toBeInTheDocument();
  });

  it('한 번 더 누르면 헤더도 함께 되돌아온다', async () => {
    const user = userEvent.setup();
    render(withRouter(<HomePage />));

    const [firstCard] = screen.getAllByRole('article');
    await user.click(within(firstCard).getByRole('button', { name: /좋아요/ }));
    await user.click(within(firstCard).getByRole('button', { name: /좋아요/ }));

    expect(screen.getByText('좋아요 누른 게시물 1개')).toBeInTheDocument();
    expect(within(firstCard).getByText('좋아요 1240개')).toBeInTheDocument();
  });

  it('한 카드를 눌러도 다른 카드는 그대로다', async () => {
    const user = userEvent.setup();
    render(withRouter(<HomePage />));

    const [firstCard, secondCard] = screen.getAllByRole('article');
    await user.click(within(firstCard).getByRole('button', { name: /좋아요/ }));

    expect(within(secondCard).getByText('좋아요 8500개')).toBeInTheDocument();
  });
});

describe('toggleLike — 새로 만드는 버전', () => {
  it('원본 배열을 건드리지 않는다', () => {
    const posts = samplePosts();
    const before = posts[0].liked;

    toggleLike(posts, 1);

    expect(posts[0].liked).toBe(before);
  });

  it('배열도 바뀐 게시물도 새 참조로 돌아온다', () => {
    const posts = samplePosts();
    const next = toggleLike(posts, 1);

    expect(next).not.toBe(posts);
    expect(next[0]).not.toBe(posts[0]);
  });

  it('안 바뀐 게시물은 원래 객체를 그대로 재사용한다', () => {
    const posts = samplePosts();
    const next = toggleLike(posts, 1);

    expect(next[1]).toBe(posts[1]);
  });

  it('누르면 좋아요 수가 하나 오르고 다시 누르면 되돌아온다', () => {
    const posts = samplePosts();

    const liked = toggleLike(posts, 1);
    expect(liked[0].liked).toBe(true);
    expect(liked[0].likeCount).toBe(1241);

    const unliked = toggleLike(liked, 1);
    expect(unliked[0].liked).toBe(false);
    expect(unliked[0].likeCount).toBe(1240);
  });
});

describe('toggleLikeInPlace — 그 자리에서 고치는 버전', () => {
  it('값은 바뀌지만 배열 참조가 그대로라 React 가 바뀐 걸 모른다', () => {
    const posts = samplePosts();
    const next = toggleLikeInPlace(posts, 1);

    expect(next[0].liked).toBe(true);
    expect(next).toBe(posts);
    expect(next[0]).toBe(posts[0]);
  });
});
