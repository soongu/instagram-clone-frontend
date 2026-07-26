// apps/web-spa/src/types/narrowing.ts

import { Post, User } from './instagram';

// 검색창에는 해시태그 이름(문자열)도, 게시물 번호(숫자)도 들어온다
export type SearchTerm = string | number;

// typeof 로 가른 가지 안에서는 그 타입의 기능이 열린다
export function searchLabel(term: SearchTerm): string {
  if (typeof term === 'string') {
    return `#${term.trim()} 검색`;
  }
  return `${term.toLocaleString('ko-KR')}번 게시물`;
}

// 검색 결과에는 계정과 게시물이 섞여 나온다
export type SearchHit = User | Post;

// 둘 다 가진 필드로는 못 가른다 — 한쪽에만 있는 필드를 in 으로 확인한다
export function hitTitle(hit: SearchHit): string {
  if ('imageUrl' in hit) {
    return `게시물 · @${hit.username}`;
  }
  return `계정 · @${hit.username} · 팔로워 ${hit.followerCount}`;
}

// bio 는 없을 수도 있어서, 확인을 거쳐야 문자열로 다룰 수 있다
export function bioPreview(user: User): string {
  if (!user.bio) {
    return '소개글이 아직 없어요';
  }
  return user.bio.slice(0, 20);
}

// undefined 만 걸러내면 빈 문자열은 그대로 통과한다
export function bioLength(user: User): number {
  if (user.bio === undefined) {
    return 0;
  }
  return user.bio.length;
}
