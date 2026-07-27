// apps/web-spa/src/types/enum-alternative.ts

export type PostStatus = 'draft' | 'published' | 'archived';

// 키는 PostStatus 를 대문자로 바꾼 것, 값은 PostStatus — 손으로 쓰던 인터페이스가 사라졌다
export const POST_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const satisfies Record<Uppercase<PostStatus>, PostStatus>;

export function statusLabel(status: PostStatus): string {
  if (status === POST_STATUS.DRAFT) {
    return '임시저장';
  }
  if (status === POST_STATUS.PUBLISHED) {
    return '공개됨';
  }
  return '보관됨';
}

export function isVisibleToOthers(status: PostStatus): boolean {
  return status === POST_STATUS.PUBLISHED;
}
