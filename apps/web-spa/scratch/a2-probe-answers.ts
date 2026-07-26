// apps/web-spa/scratch/a2-probe-answers.ts
// A-2 [탐구] 과제의 네 가지 시도 — 실제 결과 채증용 (include 밖)

import type { User } from '../src/types/instagram';
import type { LikeState } from '../src/types/like-state';

// 1) 좁힌 뒤 재할당하면
export function probe1(input: string | number): string {
  let term = input;
  if (typeof term === 'string') {
    term = 7;
    return term.trim();
  }
  return '';
}

// 2) 좁힌 뒤 콜백 안에서 쓰면
export function probe2(user: User): number[] {
  if (user.bio !== undefined) {
    return [1, 2].map(() => user.bio.length);
  }
  return [];
}

// 3) object 로만 좁히고 필드에 접근하면
export function probe3(value: unknown): string {
  if (typeof value === 'object' && value !== null) {
    return String(value.username);
  }
  return '';
}

// 4) 판별 필드를 !== 로 좁히면 남은 타입은 무엇인가
export function probe4(state: LikeState): void {
  if (state.status !== 'idle') {
    const check: 'nope' = state.status;
    console.log(check);
  }
}
