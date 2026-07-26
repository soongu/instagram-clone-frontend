// 교안 본문 주장 검증용 (include 밖)
import type { User, Post } from '../src/types/instagram';
import type { LikeState } from '../src/types/like-state';
import { assertNever } from '../src/types/like-state';

// [주장 A] Step2 토글: in 연산자에 오타를 내면 막아준다?
export function claimA(hit: User | Post): boolean {
  return 'imagUrl' in hit;
}

// [주장 B] Step5 토글: if 체인으로도 완전성 검사가 된다
export function claimB(state: LikeState): boolean {
  if (state.status === 'idle') return false;
  if (state.status === 'pending') return true;
  if (state.status === 'success') return false;
  if (state.status === 'failed') return false;
  return assertNever(state);
}

// [주장 C] Step5 토글: default 없이 케이스를 빠뜨리면 "일부 경로에서 반환 안 함" 에러
export function claimC(state: LikeState): boolean {
  switch (state.status) {
    case 'idle': return false;
    case 'pending': return true;
    case 'success': return false;
  }
}

// [주장 D] 답안: const 로 꺼내면 콜백 안에서 좁히기가 유지된다
export function claimD(user: User): number[] {
  const bio = user.bio;
  if (bio !== undefined) {
    return [1, 2].map(() => bio.length);
  }
  return [];
}
