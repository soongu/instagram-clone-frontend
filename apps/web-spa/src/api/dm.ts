// apps/web-spa/src/api/dm.ts
import type { Conversation, DirectMessage } from '../types/dm';
import { api } from './client';

// 통로가 열리기 전에 오간 것은 통로로 안 온다. 그건 요청으로 받아야 한다.
export async function fetchMessages(conversationId: number): Promise<DirectMessage[]> {
  const response = await api.get<DirectMessage[]>(`/conversations/${conversationId}/messages`);

  return response.data;
}

export async function fetchConversations(): Promise<Conversation[]> {
  const response = await api.get<Conversation[]>('/conversations');

  return response.data;
}
