import { describe, it, expect } from 'vitest';

import { thumbnailBadge, cardHeadline } from './derived';
import { likeButtonLabel, likeButtonDisabled } from './like-state';
import type { PostThumbnail, PostCardProps } from './derived';
import type { LikeState } from './like-state';
import type { Post } from './instagram';

const post: Post = {
  id: 7,
  username: 'jaehoon',
  profileImageUrl: 'https://cdn.example.com/u/7.jpg',
  imageUrl: 'https://cdn.example.com/p/7.jpg',
  mediaKind: 'image',
  content: '한강 야경',
  hashtagNames: ['한강', '야경'],
  likeCount: 1240,
  commentCount: 12,
  liked: false,
  createdAt: '2026-07-26T10:00:00',
};

describe('Step 1 — Pick 과 Omit 으로 파생', () => {
  it('Pick 으로 뽑은 썸네일은 고른 세 필드만 담는다', () => {
    const thumb: PostThumbnail = {
      id: post.id,
      imageUrl: post.imageUrl,
      mediaKind: post.mediaKind,
    };

    expect(Object.keys(thumb).sort()).toEqual(['id', 'imageUrl', 'mediaKind']);
  });

  it('사진에는 배지를 붙이지 않고 나머지에는 붙인다', () => {
    expect(thumbnailBadge({ id: 1, imageUrl: 'a.jpg', mediaKind: 'image' })).toBeNull();
    expect(thumbnailBadge({ id: 2, imageUrl: 'b.jpg', mediaKind: 'video' })).toBe('동영상');
    expect(thumbnailBadge({ id: 3, imageUrl: 'c.jpg', mediaKind: 'carousel' })).toBe('여러 장');
  });

  it('Omit 으로 뺀 두 필드는 카드 타입에 남지 않는다', () => {
    const { hashtagNames, createdAt, ...rest } = post;
    const card: PostCardProps = rest;

    expect(hashtagNames).toHaveLength(2);
    expect(createdAt).toBe('2026-07-26T10:00:00');
    expect(card).not.toHaveProperty('hashtagNames');
    expect(card).not.toHaveProperty('createdAt');
    expect(cardHeadline(card)).toBe('@jaehoon · 좋아요 1240');
  });

  it('공통 필드를 뽑아내도 판별 유니온은 그대로 동작한다', () => {
    const states: LikeState[] = [
      { status: 'idle', liked: false },
      { status: 'pending', liked: true },
      { status: 'success', liked: true, likeCount: 1241 },
      { status: 'failed', liked: false, message: '네트워크 오류' },
    ];

    expect(states.map(likeButtonLabel)).toEqual([
      '좋아요',
      '처리 중...',
      '좋아요 1241',
      '실패 · 네트워크 오류',
    ]);
    expect(states.map(likeButtonDisabled)).toEqual([false, true, false, false]);
  });
});
