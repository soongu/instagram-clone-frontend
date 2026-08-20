// apps/web-next/lib/api.ts
import { cacheLife, cacheTag } from 'next/cache';
import type { Post } from './posts';
// 브라우저가 아니라 서버가 부른다. 서버에는 "지금 보고 있는 주소" 같은 게 없어서
// 상대 경로(/api/posts)로는 어디로 갈지 정할 수 없다 — 주소를 통째로 적는다.
// 그 주소를 어디서 받아오는지는 config.ts 한 곳에서 정한다.
import { API_BASE } from './config';

// 백엔드는 늘 같은 봉투로 답한다. C-5 에서 만든 것과 같은 모양이다.
type ApiEnvelope<T> = {
  success: boolean;
  data: T | null;
  message: string | null;
};

async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);

  if (!response.ok) {
    throw new Error(`서버가 ${response.status} 로 답했습니다 (${path})`);
  }

  const envelope: ApiEnvelope<T> = await response.json();

  if (!envelope.success || envelope.data === null) {
    throw new Error(envelope.message ?? `데이터를 받지 못했습니다 (${path})`);
  }

  return envelope.data;
}

export function fetchPosts(): Promise<Post[]> {
  return get<Post[]>('/posts');
}

/** 프로필 머리에 쓰는 집계값 */
export type Profile = {
  username: string;
  profileImageUrl: string;
  followerCount: number;
  /** 이 숫자를 센 시각. 모아 센 값은 언제 기준인지가 같이 와야 한다. */
  countedAt: string;
};

/**
 * 프로필 머리의 집계값은 초당 천 번 물어볼 이유가 없다 — 굳혀두고 쓴다.
 * 인자로 받은 username 이 그대로 캐시 칸을 가르는 열쇠가 된다.
 */
export async function fetchProfile(username: string): Promise<Profile> {
  'use cache';
  // 팔로워 수는 하루에도 몇 번 변한다. 한 시간마다 다시 세면 충분하다.
  cacheLife('hours');
  // 이 칸에 이름표를 붙여둔다. 누군가 이 사람을 팔로우한 순간 이 이름으로 지목해 버릴 수 있게.
  cacheTag('profile', `profile:${username}`);
  return get<Profile>(`/users/${encodeURIComponent(username)}`);
}

/**
 * 없는 사람이면 예외 대신 null 을 준다 — 없는 것과 못 가져온 것은 다르게 다뤄야 한다.
 * 이 사람이 있는지 없는지도 매 요청 물어볼 값은 아니라 같이 굳힌다.
 */
export async function findProfile(username: string): Promise<Profile | null> {
  'use cache';
  // 사람이 있느냐 없느냐도 같은 주기로 본다 — 가입한 사람이 한 시간 안에는 보여야 한다.
  cacheLife('hours');
  cacheTag('profile', `profile:${username}`);
  const response = await fetch(`${API_BASE}/users/${encodeURIComponent(username)}`);

  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`서버가 ${response.status} 로 답했습니다 (프로필)`);
  }

  const envelope: ApiEnvelope<Profile> = await response.json();

  if (!envelope.success || envelope.data === null) {
    throw new Error(envelope.message ?? '프로필을 받지 못했습니다');
  }

  return envelope.data;
}

export function fetchPostsByUsername(username: string): Promise<Post[]> {
  return get<Post[]>(`/posts?username=${encodeURIComponent(username)}`);
}

/** 게시물에 달린 댓글 한 줄 */
export type Comment = {
  id: number;
  postId: number;
  username: string;
  content: string;
  createdAt: string;
};

/**
 * 댓글은 굳히지 않는다. 방금 단 것이 안 보이면 안 단 것과 같다.
 * 그래서 'use cache' 도 이름표도 없다 — 피드와 같은 결이다.
 */
export function fetchComments(postId: number): Promise<Comment[]> {
  return get<Comment[]>(`/posts/${postId}/comments`);
}

/** 자주 쓴 해시태그. 게시물을 전부 훑어 세는 집계라 다른 것보다 오래 걸린다. */
export function fetchTopTags(username: string): Promise<string[]> {
  return get<string[]>(`/users/${encodeURIComponent(username)}/tags`);
}
