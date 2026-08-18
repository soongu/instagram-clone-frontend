// apps/web-next/lib/api.ts
import type { Post } from './posts';

// 브라우저가 아니라 서버가 부른다. 서버에는 "지금 보고 있는 주소" 같은 게 없어서
// 상대 경로(/api/posts)로는 어디로 갈지 정할 수 없다 — 주소를 통째로 적는다.
const API_BASE = 'http://localhost:8090/api';

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
};

export function fetchProfile(username: string): Promise<Profile> {
  return get<Profile>(`/users/${encodeURIComponent(username)}`);
}

export function fetchPostsByUsername(username: string): Promise<Post[]> {
  return get<Post[]>(`/posts?username=${encodeURIComponent(username)}`);
}

/** 자주 쓴 해시태그. 게시물을 전부 훑어 세는 집계라 다른 것보다 오래 걸린다. */
export function fetchTopTags(username: string): Promise<string[]> {
  return get<string[]>(`/users/${encodeURIComponent(username)}/tags`);
}
