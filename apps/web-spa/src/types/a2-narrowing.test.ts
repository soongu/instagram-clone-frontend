import { describe, it, expect } from 'vitest';

import { searchLabel, hitTitle, bioPreview, bioLength } from './narrowing';
import { isPost, isPostArray, feedTitleOf } from './guards';
import { likeButtonLabel, likeButtonDisabled } from './like-state';
import type { LikeState } from './like-state';
import type { Post, User } from './instagram';

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

const user: User = {
  id: 3,
  username: 'minji',
  profileImageUrl: 'https://cdn.example.com/u/3.jpg',
  bio: '사진 찍는 사람입니다',
  followerCount: 8500,
  followingCount: 210,
};

describe('Step 1 — typeof 로 갈라내기', () => {
  it('문자열이 들어오면 해시태그 검색으로 읽는다', () => {
    expect(searchLabel('한강')).toBe('#한강 검색');
  });

  it('앞뒤 공백은 다듬어서 붙인다', () => {
    expect(searchLabel('  야경  ')).toBe('#야경 검색');
  });

  it('숫자가 들어오면 게시물 번호로 읽는다', () => {
    expect(searchLabel(7)).toBe('7번 게시물');
    expect(searchLabel(1240)).toBe('1,240번 게시물');
  });
});

describe('Step 2 — in 과 없음(null/undefined) 갈라내기', () => {
  it('imageUrl 이 있으면 게시물로 읽는다', () => {
    expect(hitTitle(post)).toBe('게시물 · @jaehoon');
  });

  it('imageUrl 이 없으면 계정으로 읽고 팔로워 수를 붙인다', () => {
    expect(hitTitle(user)).toBe('계정 · @minji · 팔로워 8500');
  });

  it('소개글이 있으면 그대로 보여준다', () => {
    expect(bioPreview(user)).toBe('사진 찍는 사람입니다');
    expect(bioLength(user)).toBe(11);
  });

  it('소개글이 없으면 안내 문구를 대신 보여준다', () => {
    const noBio: User = { ...user, bio: undefined };
    expect(bioPreview(noBio)).toBe('소개글이 아직 없어요');
    expect(bioLength(noBio)).toBe(0);
  });

  it('소개글이 빈 문자열이어도 없는 것으로 본다', () => {
    const emptyBio: User = { ...user, bio: '' };
    expect(bioPreview(emptyBio)).toBe('소개글이 아직 없어요');
    expect(bioLength(emptyBio)).toBe(0);
  });

  it('스무 자가 넘는 소개글은 잘라서 보여준다', () => {
    const longBio: User = { ...user, bio: '가'.repeat(30) };
    expect(bioPreview(longBio)).toBe('가'.repeat(20));
  });
});

describe('Step 3 — 사용자 정의 타입 가드', () => {
  it('게시물 모양이면 참으로 판정한다', () => {
    expect(isPost(post)).toBe(true);
  });

  it('객체가 아니거나 null 이면 거짓으로 판정한다', () => {
    expect(isPost(null)).toBe(false);
    expect(isPost(undefined)).toBe(false);
    expect(isPost('한강')).toBe(false);
    expect(isPost(7)).toBe(false);
  });

  it('필드가 빠졌거나 타입이 다르면 거짓으로 판정한다', () => {
    const { imageUrl: _removed, ...withoutImage } = post;
    expect(isPost(withoutImage)).toBe(false);
    expect(isPost({ ...post, likeCount: '1240' })).toBe(false);
    expect(isPost({ ...post, id: '7' })).toBe(false);
  });

  it('배열은 모든 요소가 게시물일 때만 참이다', () => {
    expect(isPostArray([post, { ...post, id: 8 }])).toBe(true);
    expect(isPostArray([])).toBe(true);
    expect(isPostArray([post, { id: 9 }])).toBe(false);
    expect(isPostArray(post)).toBe(false);
  });

  it('가드를 통과한 응답만 게시물로 다룬다', () => {
    expect(feedTitleOf(post)).toBe('@jaehoon · 좋아요 1240');
    expect(feedTitleOf({ message: '서버 오류' })).toBe('알 수 없는 응답');
  });
});

describe('Step 4 — 판별 유니온으로 좋아요 상태 나누기', () => {
  it('아직 누르기 전에는 누를 수 있는 문구를 보여준다', () => {
    const idle: LikeState = { status: 'idle', liked: false };
    expect(likeButtonLabel(idle)).toBe('좋아요');
  });

  it('이미 누른 상태면 취소 문구를 보여준다', () => {
    const idle: LikeState = { status: 'idle', liked: true };
    expect(likeButtonLabel(idle)).toBe('좋아요 취소');
  });

  it('요청 중에는 진행 문구를 보여준다', () => {
    const pending: LikeState = { status: 'pending', liked: true };
    expect(likeButtonLabel(pending)).toBe('처리 중...');
  });

  it('성공했을 때만 서버가 준 좋아요 수를 쓴다', () => {
    const success: LikeState = { status: 'success', liked: true, likeCount: 1241 };
    expect(likeButtonLabel(success)).toBe('좋아요 1241');
  });

  it('실패했을 때만 사유 메시지를 쓴다', () => {
    const failed: LikeState = { status: 'failed', liked: false, message: '네트워크 오류' };
    expect(likeButtonLabel(failed)).toBe('실패 · 네트워크 오류');
  });
});

describe('Step 5 — never 로 빠뜨린 케이스 잡기', () => {
  it('요청 중일 때만 버튼을 잠근다', () => {
    expect(likeButtonDisabled({ status: 'pending', liked: true })).toBe(true);
    expect(likeButtonDisabled({ status: 'idle', liked: false })).toBe(false);
    expect(likeButtonDisabled({ status: 'success', liked: true, likeCount: 1 })).toBe(false);
    expect(likeButtonDisabled({ status: 'failed', liked: false, message: '실패' })).toBe(false);
  });
});
