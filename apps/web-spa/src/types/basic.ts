// apps/web-spa/src/types/basic.ts

// 게시물 한 장이 화면에 뿌리는 가장 기본적인 값들
export const postId: number = 1;
export const caption: string = '한강 야경 성공';
export const isLiked: boolean = false;

// 배열은 두 가지로 쓸 수 있고 뜻은 같다
export const hashtags: string[] = ['#한강', '#야경', '#서울'];
export const likedUserIds: Array<number> = [7, 12, 45];

/** 12345 → "1.2만", 9999 → "9,999" */
export function formatLikeCount(count: number): string {
  if (count >= 10000) {
    return `${Math.floor(count / 1000) / 10}만`;
  }
  return count.toLocaleString('ko-KR');
}

export function joinHashtags(tags: string[]): string {
  return tags.join(' ');
}
