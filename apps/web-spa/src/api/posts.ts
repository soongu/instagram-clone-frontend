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
