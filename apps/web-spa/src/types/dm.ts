// apps/web-spa/src/types/dm.ts

// 주고받은 쪽지 하나.
export interface DirectMessage {
  messageId: number;
  conversationId: number;
  senderUsername: string;
  content: string;
  createdAt: string;
}

// 대화방 하나. 상대가 누구인지와 마지막 쪽지를 함께 준다.
export interface Conversation {
  conversationId: number;
  otherUsername: string;
  otherProfileImageUrl: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
}
