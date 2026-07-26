// 교안에 "이렇게 쓰면 에러가 난다"고 쓸 자리의 실제 컴파일러 메시지를 확보하기 위한 파일.
// tsconfig 의 include 는 ["src"] 라 평소 타입체크에는 잡히지 않는다. 의도적으로 전부 에러다.

import { FeedSort } from '../src/types/literals';
import { findPost, StoredPost } from '../src/types/strict-demo';
import { ProfileSummary } from '../src/types/optional';
import { Post } from '../src/types/instagram';
import { PostStatus } from '../src/types/enum-alternative';

// [case 1] 기본 타입 — 문자열을 number 자리에
export const postId: number = '1';

// [case 2] 암묵적 any — 매개변수에 타입이 없다
export function buildUrl(username): string {
  return `https://instagram.com/${username}`;
}

// [case 3] 옵셔널 — 없을 수도 있는 값을 바로 꺼내 쓴다
export function bioLength(profile: ProfileSummary): number {
  return profile.bio.length;
}

// [case 4] 리터럴 유니온 — 오타
export const sort: FeedSort = 'lastest';

// [case 5] strict — 못 찾은 경우를 처리하지 않고 바로 접근
export function contentOf(posts: StoredPost[], id: number): string {
  const found = findPost(posts, id);
  return found.content;
}

// [case 6] satisfies — const 객체 안의 오타를 잡아낸다
interface PostStatusMap {
  DRAFT: PostStatus;
  PUBLISHED: PostStatus;
}
export const POST_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'publish',
} as const satisfies PostStatusMap;

// [case 7] 인터페이스 필수 필드 누락
export const post: Post = {
  id: 1,
  username: 'soongu',
};
