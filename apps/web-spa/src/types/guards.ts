// apps/web-spa/src/types/guards.ts

import type { Post } from './instagram';

// value is Post — true 를 돌려주면 그때부터 Post 로 다뤄도 된다고 알려주는 표시
export function isPost(value: unknown): value is Post {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'username' in value &&
    'imageUrl' in value &&
    'likeCount' in value &&
    typeof value.id === 'number' &&
    typeof value.username === 'string' &&
    typeof value.imageUrl === 'string' &&
    typeof value.likeCount === 'number'
  );
}

// 배열은 모든 요소가 통과해야 게시물 목록이다
export function isPostArray(value: unknown): value is Post[] {
  return Array.isArray(value) && value.every(isPost);
}

// 가드를 통과하기 전에는 payload 로 아무것도 할 수 없다
export function feedTitleOf(payload: unknown): string {
  if (!isPost(payload)) {
    return '알 수 없는 응답';
  }
  return `@${payload.username} · 좋아요 ${payload.likeCount}`;
}
