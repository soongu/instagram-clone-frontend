// apps/web-spa/scratch/a2-expected-errors.ts
// 교안에 인용할 "일부러 어겼을 때의 에러 메시지" 채증용.
// tsconfig 의 include 는 ["src"] 라 이 파일은 타입체크 대상이 아니다.
// 확인 명령: npx tsc --noEmit --strict --target es2025 --module esnext \
//            --moduleResolution bundler scratch/a2-expected-errors.ts

import type { SearchTerm, SearchHit } from '../src/types/narrowing';
import type { LikeState } from '../src/types/like-state';
import type { User } from '../src/types/instagram';

// [Step 1] 좁히기 없이 string 전용 기능을 쓰면
export function badSearchLabel(term: SearchTerm): string {
  return `#${term.trim()} 검색`;
}

// [Step 2] 좁히기 없이 한쪽에만 있는 필드를 쓰면
export function badHitTitle(hit: SearchHit): string {
  return `계정 · 팔로워 ${hit.followerCount}`;
}

// [Step 2] 없을 수도 있는 값을 확인 없이 쓰면
export function badBioLength(user: User): number {
  return user.bio.length;
}

// [Step 3] unknown 은 확인을 거치기 전에는 아무것도 못 한다
export function badFeedTitle(payload: unknown): string {
  return `@${payload.username}`;
}

// [Step 4] 판별하기 전에는 특정 상황에만 있는 필드를 못 쓴다
export function badLikeLabel(state: LikeState): string {
  return `좋아요 ${state.likeCount}`;
}

// [Step 5] 케이스를 빠뜨리면 never 자리에서 걸린다
function assertNever(value: never): never {
  throw new Error(`처리하지 않은 좋아요 상태입니다: ${JSON.stringify(value)}`);
}

export function badLikeDisabled(state: LikeState): boolean {
  switch (state.status) {
    case 'pending':
      return true;
    case 'idle':
      return false;
    case 'success':
      return false;
    // 'failed' 를 빠뜨렸다
    default:
      return assertNever(state);
  }
}
