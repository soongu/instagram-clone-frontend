// apps/web-spa/src/components/b3-snapshots.test.tsx
// B-3 교안 중간 Step 코드가 실제로 동작하는지 + 분해 전후 화면이 같은지 (내부 검증용)
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect, vi } from 'vitest';
import {
  PostCardBefore,
  PostCardStep1,
  LikeButtonBefore,
  CommentFormBefore,
} from '../../scratch/b3-lecture-snapshots';
import { PostCard } from './PostCard';
import { LikeButton } from './LikeButton';
import { CommentForm } from './CommentForm';
import { feedPosts } from '../data/feed';

const [firstPost] = feedPosts;

describe('Step 1 — 세 구역으로 나눠도 화면은 글자 하나 안 바뀐다', () => {
  it('분해 전과 분해 직후의 HTML 이 완전히 같다', () => {
    const before = renderToStaticMarkup(
      <PostCardBefore {...firstPost} onToggleLike={() => {}} />,
    );
    const step1 = renderToStaticMarkup(
      <PostCardStep1 {...firstPost} onToggleLike={() => {}} />,
    );

    expect(step1).toBe(before);
  });

  it('좋아요를 누른 카드도 마찬가지다', () => {
    const likedPost = { ...firstPost, liked: true, likeCount: 1241 };
    const before = renderToStaticMarkup(
      <PostCardBefore {...likedPost} onToggleLike={() => {}} />,
    );
    const step1 = renderToStaticMarkup(
      <PostCardStep1 {...likedPost} onToggleLike={() => {}} />,
    );

    expect(step1).toBe(before);
  });
});

describe('Step 1 — 나누기 전 카드도 여전히 같은 동작을 한다', () => {
  it.each([
    ['분해 전', PostCardBefore],
    ['분해 직후', PostCardStep1],
  ])('%s — 이미지 더블클릭으로 좋아요 요청이 올라간다', async (_name, Card) => {
    const onToggleLike = vi.fn();
    const user = userEvent.setup();
    render(<Card {...firstPost} onToggleLike={onToggleLike} />);

    await user.dblClick(screen.getByRole('img', { name: 'jaehoon 의 게시물' }));

    expect(onToggleLike).toHaveBeenCalledWith(firstPost.id);
  });
});

describe('Step 2 — Button 으로 갈아끼운 뒤 달라지는 것', () => {
  it('좋아요 버튼은 type="button" 한 군데만 달라진다', () => {
    const before = renderToStaticMarkup(
      <LikeButtonBefore liked={false} likeCount={3} onToggle={() => {}} />,
    );
    const after = renderToStaticMarkup(
      <LikeButton liked={false} likeCount={3} onToggle={() => {}} />,
    );

    expect(before).toBe('<div class="like-area"><button class="like-button">♡ 좋아요</button><p class="post-likes">좋아요 3개</p></div>');
    expect(after).toBe(before.replace('class="like-button"', 'class="like-button" type="button"'));
  });

  it('제출 버튼은 HTML 이 완전히 같다', () => {
    const before = renderToStaticMarkup(<CommentFormBefore onSubmit={() => {}} />);
    const after = renderToStaticMarkup(<CommentForm onSubmit={() => {}} />);

    expect(after).toBe(before);
  });

  it('갈아끼우기 전 폼도 같은 방식으로 제출된다', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<CommentFormBefore onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('댓글 입력'), '노을 최고');
    await user.click(screen.getByRole('button', { name: '게시' }));

    expect(onSubmit).toHaveBeenCalledWith('노을 최고');
  });
});

describe('Step 1 — 코드베이스의 PostCard 도 같은 화면을 낸다', () => {
  it('분해 직후 스냅샷과 현재 PostCard 의 HTML 이 같다', () => {
    const step1 = renderToStaticMarkup(
      <PostCardStep1 {...firstPost} onToggleLike={() => {}} />,
    );
    const current = renderToStaticMarkup(
      <PostCard {...firstPost} onToggleLike={() => {}} />,
    );

    expect(current).toBe(step1);
  });
});
