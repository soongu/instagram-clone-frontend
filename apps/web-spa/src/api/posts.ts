// apps/web-spa/src/api/posts.ts
import type { Post } from '../types/instagram';
import { api } from './client';

// 봉투는 인스턴스가 이미 벗겨준다. 그래서 제네릭에 적는 것은
// 봉투가 아니라 안에 들어 있던 것이다.
export async function fetchFeed(tag?: string): Promise<Post[]> {
  // params 를 주면 Axios 가 물음표 뒤를 만들어 붙인다.
  // 한글 태그도 여기서 알아서 인코딩된다.
  const response = await api.get<Post[]>('/posts', {
    params: tag === undefined ? undefined : { tag },
  });

  return response.data;
}

export async function fetchTags(): Promise<string[]> {
  const response = await api.get<string[]>('/tags');

  return response.data;
}

export async function fetchPostById(id: number): Promise<Post> {
  const response = await api.get<Post>(`/posts/${id}`);

  return response.data;
}

/** 좋아요를 누른 뒤 서버가 알려주는 것 — 게시물 전체가 아니라 바뀐 값만 온다 */
export interface LikeResult {
  id: number;
  liked: boolean;
  likeCount: number;
}

// 읽을 때와 다른 점은 post 라는 것 하나다. 서버에 무언가를 시키는 요청이다.
export async function likePost(id: number): Promise<LikeResult> {
  const response = await api.post<LikeResult>(`/posts/${id}/like`);

  return response.data;
}
