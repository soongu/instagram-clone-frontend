// apps/web-spa/scratch/a3-claims.ts
// 교안 본문·과제의 주장 검증용 (include 밖).
// 확인 명령: npx tsc --noEmit --ignoreConfig --strict --target es2025 --module esnext \
//            --moduleResolution bundler scratch/a3-claims.ts

import type { Post } from '../src/types/instagram';
import type { ProfileSummary } from '../src/types/optional';

// [주장 A] Pick 의 필드 이름에 오타를 내면 막힌다
export type ClaimA = Pick<Post, 'id' | 'imagUrl'>;

// [주장 B] Omit 의 필드 이름에 오타를 내도 막히지 않는다 (A 와 결과가 다르다)
export type ClaimB = Omit<Post, 'imagUrl'>;

// [주장 B-2] 그래서 오타 난 Omit 은 아무것도 빼지 못한다 — imageUrl 이 그대로 남아 있다
export function claimB2(value: ClaimB): string {
  return value.imageUrl;
}

// [주장 C] 원본에 필드를 추가하면 Omit 파생은 따라오고 Pick 파생은 그대로다
interface PostPlus extends Post {
  savedByMe: boolean;
}
export type ClaimCThumb = Pick<PostPlus, 'id' | 'imageUrl' | 'mediaKind'>;
export type ClaimCCard = Omit<PostPlus, 'hashtagNames' | 'createdAt'>;

// 카드 파생에는 savedByMe 가 저절로 생긴다
export function claimCCard(card: ClaimCCard): boolean {
  return card.savedByMe;
}

// 썸네일 파생에는 생기지 않는다 (여기서 에러가 나야 주장이 맞다)
export function claimCThumb(thumb: ClaimCThumb): boolean {
  return thumb.savedByMe;
}

// [주장 D] Partial·Required 는 한 겹만 적용된다
interface Nested {
  outer: string;
  inner: { a: string; b: string };
}
export function claimD(value: Partial<Nested>): string {
  // outer 는 선택이 됐지만, inner 안쪽 a 는 여전히 필수다
  return value.inner!.a;
}

// [주장 E] Required 는 물음표를 걷어낸다 — 옵셔널을 빠뜨리면 막힌다
export const claimE: Required<ProfileSummary> = {
  username: 'jaehoon',
  bio: '소개글',
};
