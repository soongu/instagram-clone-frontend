// apps/web-spa/src/types/records.ts

import type { FeedSort } from './literals';
// 값과 타입을 같은 곳에서 불러올 땐 타입 쪽에만 표시를 붙인다
import { POST_STATUS, type PostStatus } from './enum-alternative';

// 키 집합 × 값 타입 — 세 정렬 각각에 라벨을 하나씩 매단다
export const SORT_LABEL: Record<FeedSort, string> = {
  latest: '최신순',
  popular: '인기순',
  following: '팔로잉',
};

// if 를 늘어놓는 대신 맵에서 꺼낸다
export function sortLabelOf(sort: FeedSort): string {
  return SORT_LABEL[sort];
}

// 값 자리에는 객체도 올 수 있다
interface StatusView {
  label: string;
  visibleToOthers: boolean;
}

export const STATUS_VIEW: Record<PostStatus, StatusView> = {
  draft: { label: '임시저장', visibleToOthers: false },
  published: { label: '공개됨', visibleToOthers: true },
  archived: { label: '보관됨', visibleToOthers: false },
};

export function statusViewOf(status: PostStatus): StatusView {
  return STATUS_VIEW[status];
}

// 새 글은 임시저장으로 시작한다
export const DEFAULT_STATUS: PostStatus = POST_STATUS.DRAFT;
