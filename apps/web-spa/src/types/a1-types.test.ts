import { describe, it, expect } from 'vitest';

import { formatLikeCount, joinHashtags, hashtags, likedUserIds } from './basic';
import { buildProfileUrl, summarizeCaption, initialHashtags, followLabel } from './inference';
import { mentionOf, badgeOf } from './types-vs-interfaces';
import { renderBio, renderWebsite, hasCompleteProfile } from './optional';
import { sortLabel, mediaBadge } from './literals';
import { findPost, contentOf, countValidPosts } from './strict-demo';
import { POST_STATUS, statusLabel, isVisibleToOthers } from './enum-alternative';
import { feedSummary, isPopular, commentsOf } from './instagram';
import type { Post, Comment, User } from './instagram';
import type { StoredPost } from './strict-demo';
import type { ProfileSummary } from './optional';
import type { Author, VerifiedAuthor } from './types-vs-interfaces';

describe('Step 1 — 기본 타입', () => {
  it('만 단위는 축약하고 그 아래는 천단위 구분자를 쓴다', () => {
    expect(formatLikeCount(12345)).toBe('1.2만');
    expect(formatLikeCount(10000)).toBe('1만');
    expect(formatLikeCount(9999)).toBe('9,999');
    expect(formatLikeCount(0)).toBe('0');
  });

  it('해시태그 배열을 한 줄로 합친다', () => {
    expect(joinHashtags(hashtags)).toBe('#한강 #야경 #서울');
    expect(joinHashtags([])).toBe('');
  });

  it('두 배열 표기는 각각 값을 담는다', () => {
    expect(hashtags).toHaveLength(3);
    expect(likedUserIds).toEqual([7, 12, 45]);
  });
});

describe('Step 2 — 추론 vs 명시', () => {
  it('프로필 URL 을 만든다', () => {
    expect(buildProfileUrl('soongu')).toBe('https://instagram.com/soongu');
  });

  it('한도를 넘으면 말줄임표를 붙인다', () => {
    expect(summarizeCaption('한강 야경 성공', 4)).toBe('한강 야…');
    expect(summarizeCaption('짧다', 10)).toBe('짧다');
  });

  it('빈 배열은 string[] 으로 시작한다', () => {
    expect(initialHashtags).toEqual([]);
    expect(followLabel).toBe('팔로우');
  });
});

describe('Step 3 — type vs interface', () => {
  const author: Author = { id: 1, username: 'soongu', profileImageUrl: '/a.png' };
  const verified: VerifiedAuthor = { ...author, verifiedAt: '2026-07-26' };

  it('interface 는 확장해도 원래 함수에 그대로 들어간다', () => {
    expect(mentionOf(author)).toBe('@soongu');
    expect(mentionOf(verified)).toBe('@soongu');
    expect(badgeOf(verified)).toBe('@soongu ✓');
  });
});

describe('Step 4 — 옵셔널', () => {
  it('없는 소개글은 기본 문구로 대체한다', () => {
    const empty: ProfileSummary = { username: 'soongu' };
    const filled: ProfileSummary = { username: 'soongu', bio: '개발자입니다' };

    expect(renderBio(empty)).toBe('소개글이 아직 없어요');
    expect(renderBio(filled)).toBe('개발자입니다');
    expect(renderWebsite(empty)).toBe('링크 없음');
  });

  it('둘 다 채워져야 완성으로 본다', () => {
    expect(hasCompleteProfile({ username: 'a' })).toBe(false);
    expect(hasCompleteProfile({ username: 'a', bio: 'b' })).toBe(false);
    expect(hasCompleteProfile({ username: 'a', bio: 'b', websiteUrl: 'c' })).toBe(true);
  });

  it('빈 문자열은 undefined 가 아니라 값으로 취급된다', () => {
    expect(renderBio({ username: 'a', bio: '' })).toBe('');
  });
});

describe('Step 5 — 리터럴·유니온', () => {
  it('정렬 라벨을 한국어로 바꾼다', () => {
    expect(sortLabel('latest')).toBe('최신순');
    expect(sortLabel('popular')).toBe('인기순');
    expect(sortLabel('following')).toBe('팔로잉');
  });

  it('미디어 종류를 배지로 바꾼다', () => {
    expect(mediaBadge('image')).toBe('사진');
    expect(mediaBadge('video')).toBe('동영상');
    expect(mediaBadge('carousel')).toBe('여러 장');
  });
});

describe('Step 6 — strict 가 잡는 자리', () => {
  const posts: StoredPost[] = [
    { id: 1, content: '첫 게시물' },
    { id: 2, content: '두 번째' },
  ];

  it('없는 id 는 undefined 로 돌아온다', () => {
    expect(findPost(posts, 1)?.content).toBe('첫 게시물');
    expect(findPost(posts, 999)).toBeUndefined();
  });

  it('못 찾은 경우를 처리했기에 문자열이 보장된다', () => {
    expect(contentOf(posts, 2)).toBe('두 번째');
    expect(contentOf(posts, 999)).toBe('(삭제된 게시물입니다)');
    expect(contentOf([], 1)).toBe('(삭제된 게시물입니다)');
  });

  it('존재하는 것만 센다', () => {
    expect(countValidPosts(posts, [1, 2, 999])).toBe(2);
    expect(countValidPosts(posts, [])).toBe(0);
  });
});

describe('Step 7 — enum 대신 const + satisfies', () => {
  it('as const 라 값이 그대로 고정된다', () => {
    expect(POST_STATUS.DRAFT).toBe('draft');
    expect(POST_STATUS.PUBLISHED).toBe('published');
    expect(POST_STATUS.ARCHIVED).toBe('archived');
  });

  it('상태 라벨과 공개 여부를 판정한다', () => {
    expect(statusLabel('draft')).toBe('임시저장');
    expect(statusLabel(POST_STATUS.PUBLISHED)).toBe('공개됨');
    expect(statusLabel('archived')).toBe('보관됨');
    expect(isVisibleToOthers('published')).toBe(true);
    expect(isVisibleToOthers('draft')).toBe(false);
  });
});

describe('Step 8 — 인스타 도메인 타입', () => {
  const post: Post = {
    id: 1,
    username: 'soongu',
    profileImageUrl: '/soongu.png',
    imageUrl: '/han-river.jpg',
    mediaKind: 'image',
    content: '한강 야경 성공',
    hashtagNames: ['#한강', '#야경'],
    likeCount: 1200,
    commentCount: 34,
    liked: false,
    createdAt: '2026-07-26T21:00:00',
  };

  const comments: Comment[] = [
    { id: 1, postId: 1, username: 'minji', content: '여기 어디예요?', createdAt: '2026-07-26T21:05:00' },
    { id: 2, postId: 2, username: 'jaehoon', content: '다른 글 댓글', createdAt: '2026-07-26T21:06:00' },
  ];

  it('피드 요약 문자열을 만든다', () => {
    expect(feedSummary(post)).toBe('@soongu · 좋아요 1200 · 댓글 34');
  });

  it('좋아요 1000 이상이면 인기 게시물로 본다', () => {
    expect(isPopular(post)).toBe(true);
    expect(isPopular({ ...post, likeCount: 999 })).toBe(false);
    expect(isPopular({ ...post, likeCount: 1000 })).toBe(true);
  });

  it('게시물에 달린 댓글만 골라낸다', () => {
    expect(commentsOf(comments, 1)).toHaveLength(1);
    expect(commentsOf(comments, 1)[0]?.username).toBe('minji');
    expect(commentsOf(comments, 999)).toEqual([]);
  });

  it('bio 는 없어도 User 가 성립한다', () => {
    const user: User = {
      id: 1,
      username: 'soongu',
      profileImageUrl: '/soongu.png',
      followerCount: 1240,
      followingCount: 180,
    };
    expect(user.bio).toBeUndefined();
    expect(user.followerCount).toBe(1240);
  });
});
