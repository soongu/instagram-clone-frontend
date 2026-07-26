// apps/web-spa/src/types/inference.ts

// 타입을 안 적었는데 TS 가 string 으로 읽어낸다
export const defaultCaption = '오늘의 한 컷';

// const 는 값 하나로 좁게, let 은 string 으로 넓게 읽어낸다
export const followLabel = '팔로우';
export let currentTab = 'feed';

// 빈 배열은 추론에 맡기면 곤란해진다 — 무엇이 들어올지 미리 적어준다
export const initialHashtags: string[] = [];

// 함수 경계에서는 반환 타입을 적어 계약을 고정한다
export function buildProfileUrl(username: string): string {
  return `https://instagram.com/${username}`;
}

export function summarizeCaption(caption: string, limit: number): string {
  if (caption.length <= limit) {
    return caption;
  }
  return `${caption.slice(0, limit)}…`;
}
