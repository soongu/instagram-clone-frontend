// 교안 인용 스니펫 검증용 (include 밖)
import type { Post, User } from '../src/types/instagram';

// [오프닝] 별칭 없이 인라인 유니온일 때의 메시지
export function openingBad(term: string | number): string {
  return term.trim();
}

// [Step 2] User | Post 를 인라인으로 받았을 때
export function step2Bad(hit: User | Post): string {
  return `팔로워 ${hit.followerCount}`;
}

// [Step 3] object 로만 좁히면 필드 접근이 안 된다
export function step3Bad(value: unknown): string {
  if (typeof value === 'object' && value !== null) {
    return String(value.username);
  }
  return '';
}

// [Step 3] 가드 없이 unknown 을 Post 자리에 넘기면
declare function takePost(post: Post): void;
export function step3Bad2(payload: unknown): void {
  takePost(payload);
}
