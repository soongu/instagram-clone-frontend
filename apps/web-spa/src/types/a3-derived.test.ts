import { describe, it, expect } from 'vitest';

import {
  thumbnailBadge,
  cardHeadline,
  applyProfileEdit,
  isProfileComplete,
  toCardView,
  cardAlt,
  bioBadge,
} from './derived';
import { likeButtonLabel, likeButtonDisabled } from './like-state';
import { SORT_LABEL, sortLabelOf, STATUS_VIEW, statusViewOf } from './records';
import { POST_STATUS, statusLabel } from './enum-alternative';
import type {
  PostThumbnail,
  PostCardProps,
  CompleteProfile,
  ProfileEditDraft,
} from './derived';
import type { LikeState } from './like-state';
import type { Post } from './instagram';
import type { ProfileSummary } from './optional';

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

describe('Step 2 — Partial 과 Required', () => {
  const current: CompleteProfile = {
    username: 'jaehoon',
    bio: '사진 찍는 사람입니다',
    websiteUrl: 'https://jaehoon.dev',
  };

  it('초안에 담긴 필드만 바뀌고 나머지는 그대로 남는다', () => {
    const draft: ProfileEditDraft = { bio: '한강에서 삽니다' };

    expect(applyProfileEdit(current, draft)).toEqual({
      username: 'jaehoon',
      bio: '한강에서 삽니다',
      websiteUrl: 'https://jaehoon.dev',
    });
  });

  it('빈 초안을 보내면 아무것도 바뀌지 않는다', () => {
    expect(applyProfileEdit(current, {})).toEqual(current);
  });

  it('옵셔널이 모두 채워진 프로필만 완성으로 판정한다', () => {
    const partial: ProfileSummary = { username: 'minji', bio: '안녕하세요' };

    expect(isProfileComplete(current)).toBe(true);
    expect(isProfileComplete(partial)).toBe(false);
  });
});

describe('Step 3 — Record 로 키 집합에 값 매달기', () => {
  it('정렬 세 가지에 라벨이 빠짐없이 붙어 있다', () => {
    expect(Object.keys(SORT_LABEL).sort()).toEqual(['following', 'latest', 'popular']);
    expect(sortLabelOf('latest')).toBe('최신순');
    expect(sortLabelOf('popular')).toBe('인기순');
    expect(sortLabelOf('following')).toBe('팔로잉');
  });

  it('값 자리에 객체를 두면 상태마다 여러 정보를 담을 수 있다', () => {
    expect(Object.keys(STATUS_VIEW).sort()).toEqual(['archived', 'draft', 'published']);
    expect(statusViewOf('published')).toEqual({ label: '공개됨', visibleToOthers: true });
    expect(statusViewOf('draft').visibleToOthers).toBe(false);
  });

  it('인터페이스를 지워도 상수 객체는 그대로 동작한다', () => {
    expect(POST_STATUS.DRAFT).toBe('draft');
    expect(POST_STATUS.PUBLISHED).toBe('published');
    expect(POST_STATUS.ARCHIVED).toBe('archived');
    expect(statusLabel(POST_STATUS.ARCHIVED)).toBe('보관됨');
  });
});

describe('Step 4 — ReturnType 과 NonNullable', () => {
  it('반환 타입을 선언하지 않은 함수에서 화면 값이 나온다', () => {
    const view = toCardView(post);

    expect(view).toEqual({
      headline: '@jaehoon',
      caption: '한강 야경',
      likeLabel: '좋아요 1240',
      commentLabel: '댓글 12',
    });
    expect(cardAlt(view)).toBe('@jaehoon — 한강 야경');
  });

  it('없음을 걷어낸 타입은 문자열 기능을 그대로 쓴다', () => {
    expect(bioBadge('사진 찍는 사람입니다')).toBe('소개글 11자');
    expect(bioBadge('')).toBe('소개글 0자');
  });
});
