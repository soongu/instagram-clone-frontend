// apps/web-spa/src/types/types-vs-interfaces.ts

// 백엔드가 내려주는 공개 객체는 interface 로 선언한다
export interface Author {
  id: number;
  username: string;
  profileImageUrl: string;
}

// interface 는 extends 로 넓히는 흐름이 자연스럽다
export interface VerifiedAuthor extends Author {
  verifiedAt: string;
}

// 객체가 아닌 모양(별칭·여러 값 중 하나)은 type 으로 쓴다
export type PostId = number;
export type SortDirection = 'asc' | 'desc';

export function mentionOf(author: Author): string {
  return `@${author.username}`;
}

export function badgeOf(author: VerifiedAuthor): string {
  return `@${author.username} ✓`;
}
