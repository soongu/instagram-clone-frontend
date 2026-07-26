// apps/web-spa/src/types/literals.ts

// 값 하나하나가 곧 타입이 된다 — 이 셋 말고는 못 들어온다
export type FeedSort = 'latest' | 'popular' | 'following';
export type MediaKind = 'image' | 'video' | 'carousel';

export function sortLabel(sort: FeedSort): string {
  if (sort === 'latest') {
    return '최신순';
  }
  if (sort === 'popular') {
    return '인기순';
  }
  return '팔로잉';
}

export function mediaBadge(kind: MediaKind): string {
  if (kind === 'video') {
    return '동영상';
  }
  if (kind === 'carousel') {
    return '여러 장';
  }
  return '사진';
}
