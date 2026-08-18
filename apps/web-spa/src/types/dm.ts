// apps/web-spa/src/types/dm.ts

// 주고받은 쪽지 하나.
export interface DirectMessage {
  messageId: number;
  conversationId: number;
  senderUsername: string;
  content: string;
  createdAt: string;

  // 우리가 보낼 때 붙인 표. 서버가 그대로 실어 돌려주므로
  // 돌아온 것이 "내가 방금 보낸 그것" 인지 알아볼 수 있다.
  // 남이 보낸 쪽지에는 없다.
  clientId?: string;
}

// 아직 서버가 받았는지 모르는, 우리 화면에만 있는 쪽지.
// 서버가 모르는 것은 서버 상태가 아니다 — 그래서 캐시가 아니라 화면이 들고 있는다.
export interface PendingMessage {
  clientId: string;
  content: string;
  failedReason: string | null;
}

// 대화방 하나. 상대가 누구인지와 마지막 쪽지를 함께 준다.
export interface Conversation {
  conversationId: number;
  otherUsername: string;
  otherProfileImageUrl: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
}
