// apps/web-spa/src/api/comments.ts
import type { Comment } from '../types/instagram';
import { api } from './client';

export async function fetchComments(postId: number): Promise<Comment[]> {
  const response = await api.get<Comment[]>(`/posts/${postId}/comments`);

  return response.data;
}

export async function deleteComment(commentId: number): Promise<{ id: number }> {
  const response = await api.delete<{ id: number }>(`/comments/${commentId}`);

  return response.data;
}
