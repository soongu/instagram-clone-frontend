// apps/web-spa/src/components/b3-snapshots.test.tsx
// B-3 교안 중간 Step 코드가 실제로 동작하는지 + 분해 전후 화면이 같은지 (내부 검증용)
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect, vi } from 'vitest';
import {
  PostCardBefore,
  PostCardStep1,
  PostCardStep1Final,
  PostCardStep4,
  PostHeaderPassthrough,
  PostHeaderStep1,
  LikeButtonBefore,
  CommentFormBefore,
} from '../../scratch/b3-lecture-snapshots';
import { PostCard } from './PostCard';
import { PostHeader } from './PostHeader';
import { Avatar } from './Avatar';
import { LikeButton } from './LikeButton';
import { CommentForm } from './CommentForm';
import { feedPosts } from '../data/feed';

const [firstPost] = feedPosts;

// React 19 는 <img src> 를 만나면 결과 맨 앞에 <link rel="preload" as="image"> 를 얹는다.
// 조각끼리 이어 붙여 비교할 때만 방해가 되므로 떼어내고 본다.
function withoutPreloadLinks(html: string) {
  return html.replace(/<link rel="preload"[^>]*\/>/g, '');
}

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

describe('Step 1 — 쪼갤 이유가 없던 머리 구역', () => {
  it('넘겨받은 것을 그대로 넘기기만 하면 Avatar 와 결과가 글자 하나 안 다르다', () => {
    const avatar = renderToStaticMarkup(
      <Avatar username="jaehoon" profileImageUrl="/jaehoon.jpg" />,
    );
    const passthrough = renderToStaticMarkup(
      <PostHeaderPassthrough username="jaehoon" profileImageUrl="/jaehoon.jpg" />,
    );

    expect(passthrough).toBe(avatar);
  });

  it('더보기 버튼이 들어오면 Avatar 로는 못 그리는 화면이 된다', () => {
    const avatar = withoutPreloadLinks(
      renderToStaticMarkup(<Avatar username="jaehoon" profileImageUrl="/jaehoon.jpg" />),
    );
    const header = withoutPreloadLinks(
      renderToStaticMarkup(
        <PostHeaderStep1 username="jaehoon" profileImageUrl="/jaehoon.jpg" />,
      ),
    );

    expect(header).not.toBe(avatar);
    expect(header).toBe(
      `<div class="post-header">${avatar}<button class="post-more" aria-label="게시물 메뉴">⋯</button></div>`,
    );
  });

  it('머리 구역을 손봐도 카드의 나머지는 그대로다', () => {
    const step1 = withoutPreloadLinks(
      renderToStaticMarkup(<PostCardStep1 {...firstPost} onToggleLike={() => {}} />),
    );
    const withMore = withoutPreloadLinks(
      renderToStaticMarkup(<PostCardStep1Final {...firstPost} onToggleLike={() => {}} />),
    );
    const avatar = withoutPreloadLinks(
      renderToStaticMarkup(
        <Avatar
          username={firstPost.username}
          profileImageUrl={firstPost.profileImageUrl}
        />,
      ),
    );

    expect(withMore).toBe(
      step1.replace(
        avatar,
        `<div class="post-header">${avatar}<button class="post-more" aria-label="게시물 메뉴">⋯</button></div>`,
      ),
    );
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
  it('더보기 버튼도 type="button" 한 군데만 달라진다', () => {
    const before = renderToStaticMarkup(
      <PostHeaderStep1 username="jaehoon" profileImageUrl="/jaehoon.jpg" />,
    );
    const after = renderToStaticMarkup(
      <PostHeader username="jaehoon" profileImageUrl="/jaehoon.jpg" />,
    );

    expect(after).toBe(
      before.replace('class="post-more"', 'class="post-more" type="button"'),
    );
  });

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

describe('Step 4 — Card 로 조립해도 안쪽 구조는 그대로다', () => {
  it('조립 방식을 바꿔도 버튼 한 곳의 type 말고는 달라지는 게 없다', () => {
    const step1 = renderToStaticMarkup(
      <PostCardStep1Final {...firstPost} onToggleLike={() => {}} />,
    );
    const step4 = renderToStaticMarkup(
      <PostCardStep4 {...firstPost} onToggleLike={() => {}} />,
    );

    expect(step4).toBe(
      step1.replace('class="post-more"', 'class="post-more" type="button"'),
    );
  });

  it('캡션을 접기 전에는 카드가 캡션을 통째로 그린다', () => {
    const step4 = renderToStaticMarkup(
      <PostCardStep4 {...firstPost} onToggleLike={() => {}} />,
    );

    expect(step4).toContain('오늘 한강 노을이 미쳤다');
    expect(step4).not.toContain('caption-toggle');
  });

  it('머리와 꼬리를 슬롯으로 넘겨도 그리는 순서는 그대로다', () => {
    const html = renderToStaticMarkup(
      <PostCard {...firstPost} onToggleLike={() => {}} />,
    );

    expect(html.indexOf('avatar')).toBeLessThan(html.indexOf('post-image'));
    expect(html.indexOf('post-image')).toBeLessThan(html.indexOf('like-area'));
    expect(html.indexOf('like-area')).toBeLessThan(html.indexOf('comment-list'));
    expect(html.indexOf('comment-list')).toBeLessThan(html.indexOf('comment-form'));
  });
});

describe('Step 7 — 캡션 접기가 들어와서 달라지는 것', () => {
  it('카드에서 달라지는 곳은 캡션 한 줄과 버튼 하나뿐이다', () => {
    const step4 = renderToStaticMarkup(
      <PostCardStep4 {...firstPost} onToggleLike={() => {}} />,
    );
    const current = renderToStaticMarkup(
      <PostCard {...firstPost} onToggleLike={() => {}} />,
    );

    expect(current).toBe(
      step4.replace(
        '오늘 한강 노을이 미쳤다</p>',
        '오늘 한강 노을이...<button class="caption-toggle" type="button">더 보기</button></p>',
      ),
    );
  });
});
