// apps/web-spa/src/types/derived.ts

import { Post } from './instagram';
import { mediaBadge } from './literals';

// 프로필 그리드 한 칸에는 이미지와 종류 배지만 있으면 된다 — 남길 것을 적는다
export type PostThumbnail = Pick<Post, 'id' | 'imageUrl' | 'mediaKind'>;

// 카드는 해시태그 목록과 원본 시각 문자열을 쓰지 않는다 — 뺄 것을 적는다
export type PostCardProps = Omit<Post, 'hashtagNames' | 'createdAt'>;

// 사진에는 배지를 붙이지 않는다
export function thumbnailBadge(thumb: PostThumbnail): string | null {
  if (thumb.mediaKind === 'image') {
    return null;
  }
  return mediaBadge(thumb.mediaKind);
}

// hashtagNames·createdAt 은 이 타입에 없으니 여기서 꺼내 쓸 수 없다
export function cardHeadline(props: PostCardProps): string {
  return `@${props.username} · 좋아요 ${props.likeCount}`;
}
