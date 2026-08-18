// apps/web-next/lib/posts.ts

/** 피드 한 장 — SPA 쪽 apps/web-spa/src/types/instagram.ts 와 같은 이름을 쓴다 */
export interface Post {
  id: number;
  username: string;
  profileImageUrl: string;
  imageUrl: string;
  mediaKind: 'image' | 'carousel' | 'video';
  content: string;
  hashtagNames: string[];
  likeCount: number;
  commentCount: number;
  liked: boolean;
  createdAt: string;
}

function seed(name: string, size: number) {
  return `https://picsum.photos/seed/${name}/${size}/${size}`;
}

function post(
  id: number,
  username: string,
  mediaKind: Post['mediaKind'],
  content: string,
  hashtagNames: string[],
  likeCount: number,
  commentCount: number,
  createdAt: string,
): Post {
  return {
    id,
    username,
    profileImageUrl: seed(username, 64),
    imageUrl: seed(`post${id}`, 640),
    mediaKind,
    content,
    hashtagNames,
    likeCount,
    commentCount,
    liked: false,
    createdAt,
  };
}

// SPA 의 apps/web-spa/src/data/feed.ts 와 같은 열 장이다.
// 아직 서버에서 가져오지 않는다 — 파일에 적어둔 값을 그대로 쓴다.
export const allPosts: Post[] = [
  post(1, 'jaehoon', 'image', '오늘 한강 노을이 미쳤다', ['한강', '노을'], 1240, 32, '2026-07-20T18:30:00'),
  post(2, 'minji', 'carousel', '제주도 3박 4일 기록', ['제주도', '여행'], 8500, 214, '2026-07-19T09:10:00'),
  post(3, 'seungwoo', 'image', '한강 러닝 10km 완주했습니다', ['한강', '러닝'], 320, 12, '2026-07-18T07:05:00'),
  post(4, 'dahye', 'carousel', '성수동 카페 투어 첫 번째 집', ['카페', '디저트'], 2180, 64, '2026-07-17T14:40:00'),
  post(5, 'jaehoon', 'image', '작업실 책상 정리 끝', ['작업실', '데스크셋업'], 940, 21, '2026-07-16T21:15:00'),
  post(6, 'minji', 'image', '비 오는 날의 창밖', ['비', '일상'], 5120, 88, '2026-07-15T11:02:00'),
  post(7, 'seungwoo', 'video', '주말 등산 브이로그', ['등산', '주말'], 760, 30, '2026-07-14T16:20:00'),
  post(8, 'dahye', 'image', '오늘의 도시락', ['도시락', '집밥'], 1430, 45, '2026-07-13T12:00:00'),
  post(9, 'jaehoon', 'image', '한강 자전거 20km', ['한강', '자전거'], 610, 18, '2026-07-12T08:30:00'),
  post(10, 'minji', 'carousel', '전시 다녀왔어요', ['전시', '주말'], 3300, 97, '2026-07-11T15:45:00'),
];

/** 홈 피드는 아직 전부 다 보여주지 않는다 */
export const feedPosts: Post[] = allPosts.slice(0, 2);

export function postsByUsername(username: string): Post[] {
  return allPosts.filter((it) => it.username === username);
}

/** 우리가 아는 사람의 목록 — 게시물이 0장인 것과 아예 없는 사람은 다르다 */
const knownUsernames = new Set(allPosts.map((it) => it.username));

export function isKnownUser(username: string): boolean {
  return knownUsernames.has(username);
}
