// apps/web-spa/src/types/enum-alternative.ts

export type PostStatus = 'draft' | 'published' | 'archived';

interface PostStatusMap {
  DRAFT: PostStatus;
  PUBLISHED: PostStatus;
  ARCHIVED: PostStatus;
}

// as const 로 값을 고정하고, satisfies 로 셋 다 PostStatus 인지 검사받는다
export const POST_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const satisfies PostStatusMap;

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
