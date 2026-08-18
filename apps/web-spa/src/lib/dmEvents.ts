// apps/web-spa/src/lib/dmEvents.ts
import type { DirectMessage } from '../types/dm';

// 통로로 온 것을 우리 타입으로 좁힌다.
// 서버가 보낸 것이라도 우리가 아는 모양인지는 확인해야 한다 (C-8 의 parsePostEvent 와 같은 결).
export function parseDirectMessage(raw: string): DirectMessage | null {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }

  if (typeof value !== 'object' || value === null) return null;
  const candidate = value as Record<string, unknown>;

  if (typeof candidate.messageId !== 'number') return null;
  if (typeof candidate.conversationId !== 'number') return null;
  if (typeof candidate.senderUsername !== 'string') return null;
  if (typeof candidate.content !== 'string') return null;

  return {
    messageId: candidate.messageId,
    conversationId: candidate.conversationId,
    senderUsername: candidate.senderUsername,
    content: candidate.content,
    createdAt: typeof candidate.createdAt === 'string' ? candidate.createdAt : '',
    clientId: typeof candidate.clientId === 'string' ? candidate.clientId : undefined,
  };
}

// 서버가 보내기를 거절했을 때 오는 것. 정상 쪽지와 다른 줄로 온다.
export interface StompError {
  code: string;
  message: string;
  clientId: string | null;
}

export function parseStompError(raw: string): StompError | null {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }

  if (typeof value !== 'object' || value === null) return null;
  const candidate = value as Record<string, unknown>;

  if (typeof candidate.message !== 'string') return null;

  return {
    code: typeof candidate.code === 'string' ? candidate.code : 'UNKNOWN',
    message: candidate.message,
    clientId: typeof candidate.clientId === 'string' ? candidate.clientId : null,
  };
}

// 받아둔 쪽지 목록에 새 것을 얹는다.
//
// ⚠️ 같은 것이 두 번 올 수 있다. 통로는 "한 번만 간다" 를 약속하지 않는다.
// 번호가 같은 것이 이미 있으면 그대로 둔다.
export function appendMessage(
  messages: DirectMessage[] | undefined,
  incoming: DirectMessage,
): DirectMessage[] {
  const current = messages ?? [];
  if (current.some((it) => it.messageId === incoming.messageId)) return current;

  return [...current, incoming];
}
