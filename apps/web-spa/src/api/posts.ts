// apps/web-spa/src/api/posts.ts
import type { Post } from '../types/instagram';
import { api } from './client';

// 봉투는 인스턴스가 이미 벗겨준다. 그래서 제네릭에 적는 것은
// 봉투가 아니라 안에 들어 있던 것이다.
export async function fetchFeed(): Promise<Post[]> {
  const response = await api.get<Post[]>('/posts');

  return response.data;
}

export async function fetchPostById(id: number): Promise<Post> {
  const response = await api.get<Post>(`/posts/${id}`);

  return response.data;
}
