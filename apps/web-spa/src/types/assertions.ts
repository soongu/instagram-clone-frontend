// apps/web-spa/src/types/assertions.ts

import { Post } from './instagram';
import { FeedSort } from './literals';
import { isPost } from './guards';

export interface FeedOption {
  sort: FeedSort;
  pageSize: number;
}

// ① 애너테이션 — 검사를 받고, sort 의 타입은 FeedSort 로 넓어진다
export const annotatedOption: FeedOption = {
  sort: 'latest',
  pageSize: 12,
};

// ② satisfies — 검사도 받고, sort 는 'latest' 그대로 남는다
export const checkedOption = {
  sort: 'latest',
  pageSize: 12,
} satisfies FeedOption;

// ③ as — 검사를 건너뛴다. pageSize 가 없는데도 통과한다
export const assertedOption = {
  sort: 'latest',
} as FeedOption;

// 좁은 타입만 받는 함수 — satisfies 로 검사한 값만 그대로 들어간다
export function isLatestOnly(sort: 'latest'): boolean {
  return sort === 'latest';
}

// 타입상으로는 언제나 number 다
export function pageSizeOf(option: FeedOption): number {
  return option.pageSize;
}

// 확인을 거친 값만 Post 로 다룬다
export function safeTitle(payload: unknown): string {
  if (!isPost(payload)) {
    return '알 수 없는 응답';
  }
  return `@${payload.username}`;
}

// 확인 없이 Post 라고 우긴다 — 막는 것이 아무것도 없다
export function unsafeTitle(payload: unknown): string {
  return `@${(payload as Post).username}`;
}
